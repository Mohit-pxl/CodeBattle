import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Lock, Plus, ArrowRight, Timer, Code2, Trophy,
    Loader2, ChevronRight, Copy, Check, Wifi, WifiOff,
    Zap, Shield, Clock, AlertCircle, XCircle,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import axiosClient from '../utils/axiosClient';
import { useSelector } from 'react-redux';

// ─── Socket singleton ──────────────────────────────────────────────────────────
let socket = null;
const getSocket = () => {
    if (!socket) {
        socket = io('http://localhost:3001/game', {
            withCredentials: true,
            autoConnect: false,
        });
    }
    return socket;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const difficultyColor = {
    easy: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const LANGUAGE_MODES = { cpp: 'cpp', java: 'java', python3: 'python' };

// ─── Component ─────────────────────────────────────────────────────────────────
export default function GamesPage() {
    const user = useSelector(s => s.auth?.user);

    // UI State
    const [gameState, setGameState] = useState('lobby'); // lobby | matching | ingame | results
    const [error, setError] = useState('');
    const [connected, setConnected] = useState(false);

    // Lobby state
    const [roomId, setRoomId] = useState('');
    const [generatedRoomId, setGeneratedRoomId] = useState('');
    const [selectedDuration, setSelectedDuration] = useState(600);
    const [copied, setCopied] = useState(false);
    const [roomLoading, setRoomLoading] = useState(false);

    // In-game state
    const [gameData, setGameData] = useState(null);     // { roomId, duration, problem, players }
    const [gameTime, setGameTime] = useState(600);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [opponentProgress, setOpponentProgress] = useState(null); // { codeLength }
    const [mySubmission, setMySubmission] = useState(null);
    const [opponentSubmission, setOpponentSubmission] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Results state
    const [results, setResults] = useState(null);

    const codeRef = useRef(code);
    codeRef.current = code;
    const languageRef = useRef(language);
    languageRef.current = language;
    const gameRoomRef = useRef(null);

    // ── Connect Socket ─────────────────────────────────────────────────────────
    useEffect(() => {
        const s = getSocket();
        s.connect();

        s.on('connect', () => setConnected(true));
        s.on('disconnect', () => setConnected(false));
        s.on('connect_error', () => setConnected(false));

        // Matchmaking events
        s.on('game:queued', () => setGameState('matching'));
        s.on('game:cancelled', () => setGameState('lobby'));

        // Room joined (private)
        s.on('game:room-joined', ({ roomId, players }) => {
            gameRoomRef.current = roomId;
            setGameData(prev => ({ ...prev, roomId, players }));
        });

        s.on('game:player-joined', ({ username, playerCount }) => {
            setError('');
        });

        // Game starting (both random match & private start)
        const handleGameStart = (data) => {
            gameRoomRef.current = data.roomId;
            setGameData(data);
            setGameTime(data.duration);
            setGameState('ingame');
            setMySubmission(null);
            setOpponentSubmission(null);
            setOpponentProgress(null);
            setError('');
            // Pre-fill start code
            if (data.problem?.startCode?.length) {
                const entry = data.problem.startCode.find(s => s.language === languageRef.current)
                    || data.problem.startCode[0];
                if (entry) setCode(entry.initialCode);
            }
        };
        s.on('game:matched', handleGameStart);
        s.on('game:started', handleGameStart);

        // Live timer from server
        s.on('game:tick', ({ remaining }) => setGameTime(remaining));

        // Opponent progress
        s.on('game:opponent-progress', ({ codeLength }) => {
            setOpponentProgress({ codeLength });
        });

        // Submission events
        s.on('game:player-submitted', ({ userId, testcasesPassed, totalTestcases, score }) => {
            // Determine if it's me or opponent
            const isMine = user && userId === user._id;
            const sub = { testcasesPassed, totalTestcases, score };
            if (isMine) setMySubmission(sub);
            else setOpponentSubmission(sub);
        });

        // Game finished
        s.on('game:finished', (data) => {
            setResults(data);
            setGameState('results');
            gameRoomRef.current = null;
        });

        // Opponent disconnected
        s.on('game:opponent-disconnected', ({ username }) => {
            setError(`${username} disconnected from the battle.`);
        });

        // Errors
        s.on('game:error', ({ message }) => {
            setError(message);
            setRoomLoading(false);
        });

        return () => {
            s.off('connect');
            s.off('disconnect');
            s.off('connect_error');
            s.off('game:queued');
            s.off('game:cancelled');
            s.off('game:room-joined');
            s.off('game:player-joined');
            s.off('game:matched');
            s.off('game:started');
            s.off('game:tick');
            s.off('game:opponent-progress');
            s.off('game:player-submitted');
            s.off('game:finished');
            s.off('game:opponent-disconnected');
            s.off('game:error');
            s.disconnect();
        };
    }, [user]);

    // ── Code change → sync to server (debounced) ────────────────────────────
    const syncTimeout = useRef(null);
    const handleCodeChange = useCallback((val) => {
        setCode(val || '');
        if (!gameRoomRef.current) return;
        clearTimeout(syncTimeout.current);
        syncTimeout.current = setTimeout(() => {
            getSocket().emit('game:code-update', {
                roomId: gameRoomRef.current,
                code: val || '',
                language,
            });
        }, 800);
    }, [language]);

    // ── Matchmaking ───────────────────────────────────────────────────────────
    const handleJoinRandom = () => {
        setError('');
        getSocket().emit('game:find-match');
    };

    const handleCancelMatch = () => {
        getSocket().emit('game:cancel-match');
    };

    // ── Private Room ──────────────────────────────────────────────────────────
    const handleCreateRoom = async () => {
        setRoomLoading(true);
        setError('');
        try {
            const res = await axiosClient.post('/game/create', { duration: selectedDuration });
            const id = res.data.roomId;
            setGeneratedRoomId(id);
            // Join the socket room immediately
            getSocket().emit('game:join-room', { roomId: id });
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create room');
        } finally {
            setRoomLoading(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        if (roomId.length !== 6) return;
        setRoomLoading(true);
        setError('');
        try {
            await axiosClient.post(`/game/join/${roomId}`);
            getSocket().emit('game:join-room', { roomId });
            setGameData(prev => ({ ...prev, roomId }));
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to join room');
        } finally {
            setRoomLoading(false);
        }
    };

    const handleStartPrivateRoom = () => {
        if (!generatedRoomId) return;
        getSocket().emit('game:start-room', { roomId: generatedRoomId, duration: selectedDuration });
    };

    const handleCopyRoomId = () => {
        navigator.clipboard.writeText(generatedRoomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Language change → update start code ──────────────────────────────────
    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        if (gameData?.problem?.startCode?.length) {
            const entry = gameData.problem.startCode.find(s => s.language === lang);
            if (entry) setCode(entry.initialCode);
        }
    };

    // ── Submit Solution ───────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!gameRoomRef.current || submitting) return;
        setSubmitting(true);
        // Simulate test result (in real app this would call the judge)
        const total = gameData?.problem?.visibleTestCases?.length || 5;
        const passed = Math.floor(Math.random() * (total + 1));
        const score = Math.round((passed / total) * 100);

        getSocket().emit('game:submit', {
            roomId: gameRoomRef.current,
            code: codeRef.current,
            language,
            testcasesPassed: passed,
            totalTestcases: total,
            score,
        });

        setMySubmission({ testcasesPassed: passed, totalTestcases: total, score });
        setSubmitting(false);
    };

    // ── Back to lobby ─────────────────────────────────────────────────────────
    const handleBackToLobby = () => {
        setGameState('lobby');
        setGameData(null);
        setResults(null);
        setGeneratedRoomId('');
        setRoomId('');
        setError('');
        setCode('');
        setMySubmission(null);
        setOpponentSubmission(null);
        gameRoomRef.current = null;
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const me = gameData?.players?.find(p => user && p.userId === user._id);
    const opponent = gameData?.players?.find(p => !user || p.userId !== user._id);
    const timeWarning = gameTime <= 60 && gameTime > 0;

    // ══════════════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen pt-24 pb-12 bg-transparent text-white px-6">
            <div className="max-w-6xl mx-auto">

                {/* Connection indicator */}
                <div className="flex justify-end mb-2">
                    <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
                        connected
                            ? 'text-green-400 bg-green-400/10 border-green-400/20'
                            : 'text-red-400 bg-red-400/10 border-red-400/20'
                    }`}>
                        {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                        {connected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>

                {/* Global error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                        >
                            <AlertCircle size={16} />
                            {error}
                            <button className="ml-auto" onClick={() => setError('')}><XCircle size={16} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">

                    {/* ────────────────────── LOBBY ─────────────────────────── */}
                    {gameState === 'lobby' && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="text-center space-y-4">
                                <motion.h1
                                    className="text-5xl md:text-6xl font-black tracking-tight"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, #E63946 0%, #ff4e5c 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent',
                                    }}
                                >
                                    CODE BATTLES
                                </motion.h1>
                                <p className="text-[var(--color-slate)] text-lg max-w-2xl mx-auto">
                                    Test your coding skills against others in real-time. Join a random match or create a private room to challenge your friends.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Random Match */}
                                <motion.div
                                    whileHover={{ scale: 1.02, translateY: -5 }}
                                    className="relative group cursor-pointer"
                                    onClick={handleJoinRandom}
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[#ff4e5c] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                                    <div className="relative h-full bg-[#1A1C23] border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center space-y-6">
                                        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                                            <Users className="text-[var(--color-primary)] w-8 h-8" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold">Join Random Match</h2>
                                            <p className="text-[var(--color-slate)]">Find a random opponent and battle in a coding duel. 10 minutes on the clock.</p>
                                        </div>
                                        <button className="mt-auto flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] rounded-full font-bold group-hover:shadow-[0_0_20px_rgba(230,57,70,0.4)] transition-all">
                                            Find Match <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Private Room */}
                                <motion.div whileHover={{ scale: 1.02, translateY: -5 }} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                                    <div className="relative h-full bg-[#1A1C23] border border-white/5 rounded-2xl p-8 flex flex-col space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                <Lock className="text-blue-500 w-6 h-6" />
                                            </div>
                                            <h2 className="text-2xl font-bold">Private Room</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-[#0B0C10] rounded-xl border border-white/5 space-y-3">
                                                <p className="text-sm text-[var(--color-slate)] font-medium">Create a new room</p>

                                                {generatedRoomId ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                                            <span className="font-mono text-xl font-bold tracking-widest text-[var(--color-primary)]">
                                                                {generatedRoomId}
                                                            </span>
                                                            <button onClick={handleCopyRoomId} className="flex items-center gap-1 text-xs text-[var(--color-slate)] hover:text-white transition-colors">
                                                                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                                {copied ? 'Copied!' : 'Copy'}
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-[var(--color-slate)] text-center">Share this ID with your friend</p>

                                                        {/* Duration selector */}
                                                        <div className="space-y-2">
                                                            <p className="text-xs text-[var(--color-slate)] font-bold uppercase tracking-wider">Match Duration</p>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {[60, 300, 600, 900, 1200, 1800, 2700, 3600].map(t => (
                                                                    <button
                                                                        key={t}
                                                                        onClick={() => setSelectedDuration(t)}
                                                                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                                                                            selectedDuration === t
                                                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                                                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                                        }`}
                                                                    >
                                                                        {t >= 3600 ? `${t / 3600}h` : `${t / 60}m`}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={handleStartPrivateRoom}
                                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-blue-600/20"
                                                        >
                                                            Start Game
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={handleCreateRoom}
                                                        disabled={roomLoading}
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-sm font-semibold disabled:opacity-50"
                                                    >
                                                        {roomLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                                        Generate Room ID
                                                    </button>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-white/5" />
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-[#1A1C23] px-2 text-[var(--color-slate)]">Or</span>
                                                </div>
                                            </div>

                                            <form onSubmit={handleJoinRoom} className="space-y-3">
                                                <p className="text-sm text-[var(--color-slate)] font-medium">Join existing room</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="ENTER ROOM ID"
                                                        value={roomId}
                                                        onChange={e => setRoomId(e.target.value.toUpperCase())}
                                                        maxLength={6}
                                                        className="flex-1 bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-2.5 font-mono tracking-widest focus:border-blue-500 outline-none"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={roomId.length !== 6 || roomLoading}
                                                        className="px-4 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg hover:bg-blue-500 transition-colors"
                                                    >
                                                        {roomLoading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight />}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* ────────────────────── MATCHING ──────────────────────── */}
                    {gameState === 'matching' && (
                        <motion.div
                            key="matching"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex flex-col items-center justify-center py-20 space-y-8"
                        >
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="text-[var(--color-primary)]" size={36} />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold">Finding Opponent...</h2>
                                <p className="text-[var(--color-slate)] italic">Searching the arena for a worthy challenger...</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'You'}`} alt="You" />
                                </div>
                                <div className="text-[var(--color-primary)] font-black text-2xl">VS</div>
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-white" size={20} />
                                    </div>
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent" alt="Opponent" />
                                </div>
                            </div>
                            <button
                                onClick={handleCancelMatch}
                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    )}

                    {/* ────────────────────── IN-GAME ───────────────────────── */}
                    {gameState === 'ingame' && (
                        <motion.div
                            key="ingame"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-[calc(100vh-180px)] flex flex-col gap-4"
                        >
                            {/* Header bar */}
                            <div className="flex justify-between items-center bg-[#1A1C23] p-3 rounded-xl border border-white/5 gap-4 flex-wrap">
                                <div className="flex items-center gap-4 flex-wrap">
                                    {/* Timer */}
                                    <div className={`flex items-center gap-2 font-bold ${timeWarning ? 'text-red-400 animate-pulse' : 'text-[var(--color-primary)]'}`}>
                                        <Timer size={20} />
                                        <span className="text-2xl font-mono">{formatTime(gameTime)}</span>
                                    </div>
                                    <div className="h-6 w-px bg-white/10" />
                                    {/* Problem title */}
                                    {gameData?.problem && (
                                        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                                            <Code2 size={18} />
                                            <span className="truncate max-w-[200px]">{gameData.problem.title}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Difficulty + players */}
                                <div className="flex items-center gap-3">
                                    {gameData?.problem?.difficulty && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${difficultyColor[gameData.problem.difficulty]}`}>
                                            {gameData.problem.difficulty}
                                        </span>
                                    )}

                                    {/* Players avatars */}
                                    <div className="flex items-center gap-2">
                                        {gameData?.players?.map((p, i) => (
                                            <div key={p.userId} className="flex items-center gap-1">
                                                <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${
                                                    user && p.userId === user._id ? 'border-[var(--color-primary)]' : 'border-blue-400'
                                                }`}>
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} alt={p.username} />
                                                </div>
                                                <span className="text-xs font-semibold truncate max-w-[60px]">{p.username.split(' ')[0]}</span>
                                                {i === 0 && <span className="text-[var(--color-slate)] text-xs font-bold mx-1">vs</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Opponent progress & submission banners */}
                            <div className="flex gap-3 flex-wrap">
                                {opponentProgress !== null && !opponentSubmission && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
                                        <Shield size={12} />
                                        Opponent is coding — {opponentProgress.codeLength} chars
                                    </div>
                                )}
                                {opponentSubmission && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-400">
                                        <Check size={12} />
                                        Opponent submitted: {opponentSubmission.testcasesPassed}/{opponentSubmission.totalTestcases} passed
                                    </div>
                                )}
                                {mySubmission && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">
                                        <Check size={12} />
                                        You submitted: {mySubmission.testcasesPassed}/{mySubmission.totalTestcases} passed
                                    </div>
                                )}
                            </div>

                            {/* Main grid: problem + editor */}
                            <div className="flex-1 grid md:grid-cols-2 gap-4 min-h-0">
                                {/* Problem description */}
                                <div className="bg-[#111216] rounded-xl border border-white/5 flex flex-col overflow-hidden">
                                    <div className="p-3 border-b border-white/5 bg-[#1A1C23] font-bold text-xs tracking-wider text-slate-400">
                                        PROBLEM STATEMENT
                                    </div>
                                    <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4 text-sm">
                                        {gameData?.problem ? (
                                            <>
                                                <p className="text-white/85 leading-relaxed">{gameData.problem.description}</p>
                                                {gameData.problem.visibleTestCases?.length > 0 && (
                                                    <div className="space-y-3">
                                                        {gameData.problem.visibleTestCases.map((tc, i) => (
                                                            <div key={i} className="space-y-1">
                                                                <p className="text-xs font-bold text-slate-400">Example {i + 1}:</p>
                                                                <div className="bg-[#0B0C10] p-3 rounded-lg border border-white/5 font-mono text-xs space-y-1">
                                                                    <p><span className="text-slate-500">Input: </span>{tc.input}</p>
                                                                    <p><span className="text-slate-500">Output: </span>{tc.output}</p>
                                                                    {tc.explanation && (
                                                                        <p><span className="text-slate-500">Explanation: </span>{tc.explanation}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-[var(--color-slate)]">
                                                <Loader2 className="animate-spin mr-2" size={18} /> Loading problem…
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Code editor */}
                                <div className="bg-[#111216] rounded-xl border border-white/5 flex flex-col overflow-hidden">
                                    <div className="p-3 border-b border-white/5 bg-[#1A1C23] flex justify-between items-center">
                                        <div className="font-bold text-xs tracking-wider text-slate-400">YOUR SOLUTION</div>
                                        <select
                                            value={language}
                                            onChange={handleLanguageChange}
                                            className="bg-[#0B0C10] border border-white/10 text-xs rounded-md px-2 py-1 outline-none"
                                        >
                                            <option value="cpp">C++</option>
                                            <option value="java">Java</option>
                                            <option value="python3">Python3</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 border-b border-white/5 min-h-0">
                                        <Editor
                                            theme="vs-dark"
                                            language={LANGUAGE_MODES[language] || language}
                                            value={code}
                                            onChange={handleCodeChange}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 13,
                                                padding: { top: 12 },
                                                scrollBeyondLastLine: false,
                                            }}
                                        />
                                    </div>
                                    <div className="p-3 flex gap-3">
                                        <button
                                            disabled={!!mySubmission}
                                            onClick={handleSubmit}
                                            className="flex-1 py-2.5 bg-[var(--color-primary)] hover:bg-[#ff4e5c] disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(230,57,70,0.3)] disabled:shadow-none"
                                        >
                                            {mySubmission ? 'Submitted ✓' : submitting ? 'Submitting…' : 'Submit Solution'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ────────────────────── RESULTS ───────────────────────── */}
                    {gameState === 'results' && results && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-16 space-y-8 max-w-2xl mx-auto"
                        >
                            {/* Win/Loss indicator */}
                            {(() => {
                                const iWon = user && results.winner && results.winner.toString() === user._id?.toString();
                                return (
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                                        iWon ? 'bg-yellow-500/20 text-yellow-500' : results.winner ? 'bg-slate-700/40 text-slate-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        <Trophy size={48} />
                                    </div>
                                );
                            })()}

                            <div className="text-center space-y-1">
                                <h1 className="text-4xl font-bold italic tracking-wider">
                                    {user && results.winner?.toString() === user._id?.toString()
                                        ? '🏆 YOU WON!'
                                        : results.winner
                                            ? 'GAME OVER'
                                            : "IT'S A DRAW!"}
                                </h1>
                                <p className="text-[var(--color-slate)] text-lg">Battle complete. Here's the scoreboard.</p>
                            </div>

                            {/* Player cards */}
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {results.players?.map((p) => {
                                    const isWinner = results.winner && p.userId.toString() === results.winner.toString();
                                    const isMe = user && p.userId.toString() === user._id?.toString();
                                    return (
                                        <div key={p.userId} className={`bg-[#1A1C23] p-5 rounded-2xl border space-y-3 ${
                                            isWinner ? 'border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'border-white/5'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isWinner ? 'border-yellow-500' : 'border-white/10'}`}>
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} alt={p.username} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{p.username} {isMe && <span className="text-[var(--color-slate)] text-xs">(you)</span>}</p>
                                                    {isWinner && <p className="text-yellow-500 text-xs font-bold">🏆 Winner</p>}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-center">
                                                <div className="bg-[#0B0C10] rounded-lg p-2">
                                                    <p className="text-xs text-slate-500 font-bold uppercase">Score</p>
                                                    <p className="text-xl font-black text-[var(--color-primary)]">{p.score ?? 0}</p>
                                                </div>
                                                <div className="bg-[#0B0C10] rounded-lg p-2">
                                                    <p className="text-xs text-slate-500 font-bold uppercase">Passed</p>
                                                    <p className="text-xl font-black text-green-400">{p.testcasesPassed ?? 0}/{p.totalTestcases ?? 0}</p>
                                                </div>
                                            </div>
                                            {p.submittedAt && (
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock size={10} />
                                                    Submitted at {new Date(p.submittedAt).toLocaleTimeString()}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleBackToLobby}
                                className="px-8 py-3 bg-[var(--color-primary)] rounded-full font-bold shadow-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(230,57,70,0.4)] transition-all"
                            >
                                Back to Arena
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
