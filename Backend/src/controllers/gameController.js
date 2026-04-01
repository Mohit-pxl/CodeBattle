const Game = require('../models/game');
const Problem = require('../models/problem');

// Generate a random 6-char uppercase room ID
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// GET /game/random-problem - Fetch a random problem for the battle
const getRandomProblem = async (req, res) => {
    try {
        const count = await Problem.countDocuments();
        if (count === 0) return res.status(404).json({ message: 'No problems found' });
        const random = Math.floor(Math.random() * count);
        const problem = await Problem.findOne().skip(random).select(
            'title description difficulty tags visibleTestCases startCode'
        );
        res.status(200).json({ problem });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /game/create - Create a private room
const createRoom = async (req, res) => {
    try {
        const { duration = 600, problemId } = req.body;
        const user = req.result;

        let roomId = generateRoomId();
        // Ensure uniqueness
        while (await Game.findOne({ roomId })) {
            roomId = generateRoomId();
        }

        const game = await Game.create({
            roomId,
            roomType: 'private',
            duration,
            problem: problemId || null,
            players: [{
                userId: user._id,
                username: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
            }],
        });

        res.status(201).json({ roomId: game.roomId, message: 'Room created' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /game/join/:roomId - Join an existing private room
const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const user = req.result;

        const game = await Game.findOne({ roomId: roomId.toUpperCase() });
        if (!game) return res.status(404).json({ message: 'Room not found' });
        if (game.status !== 'waiting') return res.status(400).json({ message: 'Game already started or finished' });
        if (game.players.length >= 2) return res.status(400).json({ message: 'Room is full' });

        const alreadyIn = game.players.some(p => p.userId.toString() === user._id.toString());
        if (!alreadyIn) {
            game.players.push({
                userId: user._id,
                username: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
            });
            await game.save();
        }

        res.status(200).json({ roomId: game.roomId, message: 'Joined room' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /game/:roomId - Get room info
const getRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const game = await Game.findOne({ roomId: roomId.toUpperCase() })
            .populate('problem', 'title description difficulty tags visibleTestCases startCode')
            .populate('players.userId', 'firstName lastName');

        if (!game) return res.status(404).json({ message: 'Room not found' });
        res.status(200).json({ game });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /game/results/:roomId - Get final results
const getResults = async (req, res) => {
    try {
        const { roomId } = req.params;
        const game = await Game.findOne({ roomId: roomId.toUpperCase() })
            .populate('winner', 'firstName lastName')
            .populate('players.userId', 'firstName lastName');

        if (!game) return res.status(404).json({ message: 'Room not found' });
        if (game.status !== 'finished') return res.status(400).json({ message: 'Game not finished yet' });

        res.status(200).json({ game });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /game/history - Get user's game history
const getGameHistory = async (req, res) => {
    try {
        const userId = req.result._id;
        const games = await Game.find({
            'players.userId': userId,
            status: 'finished',
        })
        .sort({ finishedAt: -1 })
        .limit(20)
        .populate('winner', 'firstName lastName')
        .populate('problem', 'title difficulty')
        .select('roomId roomType duration players winner finishedAt');

        res.status(200).json({ games });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    getRandomProblem,
    createRoom,
    joinRoom,
    getRoom,
    getResults,
    getGameHistory,
};
