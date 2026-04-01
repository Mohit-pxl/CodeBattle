const Game = require('../models/game');
const Problem = require('../models/problem');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const cookie = require('cookie');

// In-memory matchmaking queue: [{ userId, username, socketId }]
const matchmakingQueue = [];

// In-memory game timers: { roomId: timerInterval }
const gameTimers = {};

// Helper: pick a random problem from DB
const pickRandomProblem = async () => {
    const count = await Problem.countDocuments();
    if (count === 0) return null;
    const skip = Math.floor(Math.random() * count);
    return Problem.findOne().skip(skip);
};

// Helper: generate 6-char unique room ID
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Helper: authenticate socket from cookie token
const authenticateSocket = async (socket) => {
    try {
        const rawCookie = socket.handshake.headers.cookie || '';
        const cookies = cookie.parse(rawCookie);
        const token = cookies.token;
        if (!token) throw new Error('No token');
        const payload = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findById(payload._id);
        if (!user) throw new Error('User not found');
        return user;
    } catch {
        return null;
    }
};

// Helper: finish a game (time-up or both submitted)
const finishGame = async (io, roomId) => {
    // Clear any running timer
    if (gameTimers[roomId]) {
        clearInterval(gameTimers[roomId]);
        delete gameTimers[roomId];
    }

    const game = await Game.findOne({ roomId });
    if (!game || game.status === 'finished') return;

    // Determine winner by score, then by earliest submission
    let winner = null;
    if (game.players.length === 2) {
        const [p1, p2] = game.players;
        if (p1.score > p2.score) {
            winner = p1.userId;
        } else if (p2.score > p1.score) {
            winner = p2.userId;
        } else if (p1.submittedAt && p2.submittedAt) {
            winner = p1.submittedAt < p2.submittedAt ? p1.userId : p2.userId;
        } else if (p1.submittedAt) {
            winner = p1.userId;
        } else if (p2.submittedAt) {
            winner = p2.userId;
        }
    }

    game.status = 'finished';
    game.finishedAt = new Date();
    game.winner = winner;
    await game.save();

    const results = {
        players: game.players.map(p => ({
            userId: p.userId,
            username: p.username,
            score: p.score,
            testcasesPassed: p.testcasesPassed,
            totalTestcases: p.totalTestcases,
            submittedAt: p.submittedAt,
        })),
        winner,
        finishedAt: game.finishedAt,
    };

    io.to(roomId).emit('game:finished', results);
};

// Helper: start the countdown timer for a room
const startGameTimer = (io, roomId, durationSeconds) => {
    if (gameTimers[roomId]) return; // already running
    let remaining = durationSeconds;
    gameTimers[roomId] = setInterval(async () => {
        remaining--;
        io.to(roomId).emit('game:tick', { remaining });
        if (remaining <= 0) {
            await finishGame(io, roomId);
        }
    }, 1000);
};

const initGameSocket = (io) => {
    // Middleware: authenticate every socket connection
    io.use(async (socket, next) => {
        const user = await authenticateSocket(socket);
        if (!user) {
            return next(new Error('Authentication failed'));
        }
        socket.user = user;
        next();
    });

    io.on('connection', (socket) => {
        const user = socket.user;
        console.log(`[Game Socket] Connected: ${user.firstName} (${socket.id})`);

        // ─────────────────────────────────────────────
        // MATCHMAKING: Join random queue
        // ─────────────────────────────────────────────
        socket.on('game:find-match', async () => {
            // Remove stale entries for this user
            const staleIdx = matchmakingQueue.findIndex(e => e.userId.toString() === user._id.toString());
            if (staleIdx !== -1) matchmakingQueue.splice(staleIdx, 1);

            if (matchmakingQueue.length === 0) {
                // Enqueue this player
                matchmakingQueue.push({
                    userId: user._id,
                    username: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
                    socketId: socket.id,
                });
                socket.emit('game:queued', { message: 'Looking for an opponent...' });
            } else {
                // Match with first in queue
                const opponent = matchmakingQueue.shift();

                // Pick a problem
                const problem = await pickRandomProblem();

                // Generate unique roomId
                let roomId = generateRoomId();
                while (await Game.findOne({ roomId })) roomId = generateRoomId();

                const game = await Game.create({
                    roomId,
                    roomType: 'random',
                    duration: 600,
                    problem: problem ? problem._id : null,
                    status: 'active',
                    startedAt: new Date(),
                    players: [
                        {
                            userId: opponent.userId,
                            username: opponent.username,
                            socketId: opponent.socketId,
                        },
                        {
                            userId: user._id,
                            username: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
                            socketId: socket.id,
                        },
                    ],
                });

                // Join both sockets to the room
                socket.join(roomId);
                const opponentSocket = io.sockets.get(opponent.socketId);
                if (opponentSocket) opponentSocket.join(roomId);

                const payload = {
                    roomId,
                    duration: 600,
                    problem: problem
                        ? {
                              _id: problem._id,
                              title: problem.title,
                              description: problem.description,
                              difficulty: problem.difficulty,
                              tags: problem.tags,
                              visibleTestCases: problem.visibleTestCases,
                              startCode: problem.startCode,
                          }
                        : null,
                    players: game.players.map(p => ({
                        userId: p.userId,
                        username: p.username,
                    })),
                };

                io.to(roomId).emit('game:matched', payload);
                startGameTimer(io, roomId, 600);
            }
        });

        // ─────────────────────────────────────────────
        // CANCEL MATCHMAKING
        // ─────────────────────────────────────────────
        socket.on('game:cancel-match', () => {
            const idx = matchmakingQueue.findIndex(e => e.userId.toString() === user._id.toString());
            if (idx !== -1) matchmakingQueue.splice(idx, 1);
            socket.emit('game:cancelled');
        });

        // ─────────────────────────────────────────────
        // JOIN PRIVATE ROOM
        // ─────────────────────────────────────────────
        socket.on('game:join-room', async ({ roomId }) => {
            try {
                const game = await Game.findOne({ roomId: roomId.toUpperCase() });
                if (!game) return socket.emit('game:error', { message: 'Room not found' });
                if (game.status === 'finished') return socket.emit('game:error', { message: 'Game already finished' });

                socket.join(roomId.toUpperCase());

                // Update socketId for this player
                const player = game.players.find(p => p.userId.toString() === user._id.toString());
                if (player) {
                    player.socketId = socket.id;
                    await game.save();
                }

                socket.emit('game:room-joined', {
                    roomId: game.roomId,
                    status: game.status,
                    players: game.players.map(p => ({ userId: p.userId, username: p.username })),
                });

                // Notify room
                io.to(game.roomId).emit('game:player-joined', {
                    username: user.firstName,
                    playerCount: game.players.length,
                });

                // If 2 players and room is active with a problem, start timer
                if (game.status === 'active' && game.startedAt) {
                    const elapsed = Math.floor((Date.now() - game.startedAt.getTime()) / 1000);
                    const remaining = Math.max(0, game.duration - elapsed);
                    startGameTimer(io, game.roomId, remaining);
                }
            } catch (err) {
                socket.emit('game:error', { message: err.message });
            }
        });

        // ─────────────────────────────────────────────
        // HOST STARTS THE PRIVATE ROOM
        // ─────────────────────────────────────────────
        socket.on('game:start-room', async ({ roomId, duration }) => {
            try {
                const game = await Game.findOne({ roomId: roomId.toUpperCase() });
                if (!game) return socket.emit('game:error', { message: 'Room not found' });
                if (game.status !== 'waiting') return socket.emit('game:error', { message: 'Game already started' });
                if (game.players.length < 2) return socket.emit('game:error', { message: 'Need 2 players to start' });

                // Confirm host is first player
                if (game.players[0].userId.toString() !== user._id.toString()) {
                    return socket.emit('game:error', { message: 'Only the host can start the game' });
                }

                const problem = await pickRandomProblem();
                const gameDuration = duration || game.duration;

                game.status = 'active';
                game.startedAt = new Date();
                game.duration = gameDuration;
                game.problem = problem ? problem._id : null;
                await game.save();

                const payload = {
                    roomId: game.roomId,
                    duration: gameDuration,
                    problem: problem
                        ? {
                              _id: problem._id,
                              title: problem.title,
                              description: problem.description,
                              difficulty: problem.difficulty,
                              tags: problem.tags,
                              visibleTestCases: problem.visibleTestCases,
                              startCode: problem.startCode,
                          }
                        : null,
                    players: game.players.map(p => ({ userId: p.userId, username: p.username })),
                };

                io.to(game.roomId).emit('game:started', payload);
                startGameTimer(io, game.roomId, gameDuration);
            } catch (err) {
                socket.emit('game:error', { message: err.message });
            }
        });

        // ─────────────────────────────────────────────
        // CODE SYNC (live opponent progress indicator)
        // ─────────────────────────────────────────────
        socket.on('game:code-update', async ({ roomId, code, language }) => {
            try {
                const game = await Game.findOne({ roomId: roomId.toUpperCase() });
                if (!game || game.status !== 'active') return;

                const player = game.players.find(p => p.userId.toString() === user._id.toString());
                if (player) {
                    player.code = code;
                    player.language = language || player.language;
                    await game.save();
                }

                // Broadcast code length as progress to opponent only
                socket.to(roomId.toUpperCase()).emit('game:opponent-progress', {
                    userId: user._id,
                    codeLength: code.length,
                    language,
                });
            } catch {}
        });

        // ─────────────────────────────────────────────
        // SUBMIT SOLUTION
        // ─────────────────────────────────────────────
        socket.on('game:submit', async ({ roomId, code, language, testcasesPassed, totalTestcases, score }) => {
            try {
                const game = await Game.findOne({ roomId: roomId.toUpperCase() });
                if (!game || game.status !== 'active') return;

                const player = game.players.find(p => p.userId.toString() === user._id.toString());
                if (!player) return;

                player.code = code;
                player.language = language || player.language;
                player.submitted = true;
                player.submittedAt = new Date();
                player.score = score || testcasesPassed || 0;
                player.testcasesPassed = testcasesPassed || 0;
                player.totalTestcases = totalTestcases || 0;
                await game.save();

                // Notify room of submission
                io.to(game.roomId).emit('game:player-submitted', {
                    userId: user._id,
                    username: player.username,
                    testcasesPassed: player.testcasesPassed,
                    totalTestcases: player.totalTestcases,
                    score: player.score,
                });

                // If both players submitted, finish the game
                const allSubmitted = game.players.every(p => p.submitted);
                if (allSubmitted) {
                    await finishGame(io, game.roomId);
                }
            } catch (err) {
                socket.emit('game:error', { message: err.message });
            }
        });

        // ─────────────────────────────────────────────
        // DISCONNECT
        // ─────────────────────────────────────────────
        socket.on('disconnecting', () => {
            // Notify any active room this player was in
            // (We don't auto-finish; opponent gets a notification so they can decide)
            socket.rooms.forEach(roomId => {
                if (roomId !== socket.id) {
                    socket.to(roomId).emit('game:opponent-disconnected', {
                        username: user.firstName,
                    });
                }
            });
        });

        socket.on('disconnect', () => {
            console.log(`[Game Socket] Disconnected: ${user.firstName} (${socket.id})`);

            // Remove from matchmaking queue
            const idx = matchmakingQueue.findIndex(e => e.socketId === socket.id);
            if (idx !== -1) matchmakingQueue.splice(idx, 1);
        });
    });
};

module.exports = initGameSocket;
