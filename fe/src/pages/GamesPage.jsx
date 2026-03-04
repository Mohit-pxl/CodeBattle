import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Plus, ArrowRight, Timer, Code2, Trophy, Loader2, ChevronRight } from 'lucide-react';
import Editor from '@monaco-editor/react';

export default function GamesPage() {
    const [gameState, setGameState] = useState('lobby'); // lobby, matching, ingame, results
    const [roomId, setRoomId] = useState('');
    const [generatedRoomId, setGeneratedRoomId] = useState('');
    const [matchTimer, setMatchTimer] = useState(0);
    const [gameTime, setGameTime] = useState(600); // Current match time
    const [selectedDuration, setSelectedDuration] = useState(600); // 10 minutes default

    // Lobby Logic
    const handleJoinRandom = () => {
        setGameState('matching');
        setMatchTimer(3);
        const timer = setInterval(() => {
            setMatchTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setGameState('ingame');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleCreateRoom = () => {
        const id = Math.random().toString(36).substring(2, 8).toUpperCase();
        setGeneratedRoomId(id);
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (roomId.length === 6) {
            setGameState('ingame');
        }
    };

    // Game Logic
    useEffect(() => {
        let timer;
        if (gameState === 'ingame') {
            timer = setInterval(() => {
                setGameTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setGameState('results');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameState]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-transparent text-white px-6">
            <div className="max-w-6xl mx-auto">

                <AnimatePresence mode="wait">
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
                                {/* Random Match Card */}
                                <motion.div
                                    whileHover={{ scale: 1.02, translateY: -5 }}
                                    className="relative group cursor-pointer"
                                    onClick={handleJoinRandom}
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[#ff4e5c] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                    <div className="relative h-full bg-[#1A1C23] border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center space-y-6">
                                        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                                            <Users className="text-[var(--color-primary)] w-8 h-8" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold">Join Random Match</h2>
                                            <p className="text-[var(--color-slate)]">Find a random opponent and battle in a coding duel.</p>
                                        </div>
                                        <button className="mt-auto flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] rounded-full font-bold group-hover:shadow-[0_0_20px_rgba(230,57,70,0.4)] transition-all">
                                            Find Match <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Private Room Card */}
                                <motion.div
                                    whileHover={{ scale: 1.02, translateY: -5 }}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
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
                                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                                        <span className="font-mono text-xl font-bold tracking-widest text-[var(--color-primary)]">{generatedRoomId}</span>
                                                        <button
                                                            onClick={handleCreateRoom}
                                                            className="text-xs text-[var(--color-slate)] hover:text-white"
                                                        >
                                                            Regenerate
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={handleCreateRoom}
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-sm font-semibold"
                                                    >
                                                        <Plus size={16} /> Generate Room ID
                                                    </button>
                                                )}

                                                {generatedRoomId && (
                                                    <div className="space-y-3 pt-2">
                                                        <p className="text-xs text-[var(--color-slate)] font-bold uppercase tracking-wider">Set Match Duration</p>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {[60, 300, 600, 900, 1200, 1800, 2700, 3600].map((time) => (
                                                                <button
                                                                    key={time}
                                                                    onClick={() => setSelectedDuration(time)}
                                                                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${selectedDuration === time
                                                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                                        }`}
                                                                >
                                                                    {time >= 3600 ? `${time / 3600}h` : `${time / 60}m`}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setGameTime(selectedDuration);
                                                                setGameState('ingame');
                                                            }}
                                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-blue-600/20"
                                                        >
                                                            Start Game
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-white/5"></div>
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
                                                        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                                        maxLength={6}
                                                        className="flex-1 bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-2.5 font-mono tracking-widest focus:border-blue-500 outline-none"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={roomId.length !== 6}
                                                        className="px-4 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg hover:bg-blue-500 transition-colors"
                                                    >
                                                        <ChevronRight />
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'matching' && (
                        <motion.div
                            key="matching"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex flex-col items-center justify-center py-20 space-y-8"
                        >
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                                    {matchTimer}
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold">Finding Opponent...</h2>
                                <p className="text-[var(--color-slate)] italic">Matching you with a pro coder...</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" alt="User" />
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center text-[var(--color-primary)] font-bold">VS</div>
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-white" size={20} />
                                    </div>
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent" alt="Opponent" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'ingame' && (
                        <motion.div
                            key="ingame"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-[calc(100vh-180px)] flex flex-col gap-6"
                        >
                            <div className="flex justify-between items-center bg-[#1A1C23] p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold">
                                        <Timer size={20} />
                                        <span className="text-2xl font-mono">{formatTime(gameTime)}</span>
                                    </div>
                                    <div className="h-6 w-px bg-white/10"></div>
                                    <div className="flex items-center gap-2 text-blue-400 font-semibold">
                                        <Code2 size={20} />
                                        Problem: Longest Substring Without Repeating Characters
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-bold uppercase">Medium</span>
                                    <div className="px-4 py-1.5 bg-[#0B0C10] rounded-lg border border-white/5 text-sm font-medium">
                                        Points: <span className="text-[var(--color-primary)]">150</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 grid md:grid-cols-2 gap-6 min-h-0">
                                {/* Problem Description */}
                                <div className="bg-[#111216] rounded-xl border border-white/5 flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-white/5 bg-[#1A1C23] font-bold text-sm">DESCRIPTION</div>
                                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                                        <p className="text-white/80 leading-relaxed">
                                            Given a string <code className="text-[var(--color-primary)]">s</code>, find the length of the <strong>longest substring</strong> without repeating characters.
                                        </p>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-slate-400">Example 1:</p>
                                                <div className="bg-[#0B0C10] p-3 rounded-lg border border-white/5 font-mono text-sm">
                                                    <p><span className="text-slate-500">Input:</span> s = "abcabcbb"</p>
                                                    <p><span className="text-slate-500">Output:</span> 3</p>
                                                    <p><span className="text-slate-500">Explanation:</span> The answer is "abc", with the length of 3.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-slate-400">Constraints:</p>
                                                <ul className="list-disc pl-5 text-sm space-y-1 text-slate-400">
                                                    <li>0 &lt;= s.length &lt;= 5 * 10^4</li>
                                                    <li>s consists of English letters, digits, symbols and spaces.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Code Editor */}
                                <div className="bg-[#111216] rounded-xl border border-white/5 flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-white/5 bg-[#1A1C23] flex justify-between items-center">
                                        <div className="font-bold text-sm">YOUR SOLUTION</div>
                                        <select className="bg-[#0B0C10] border border-white/10 text-xs rounded-md px-2 py-1 outline-none">
                                            <option>C++</option>
                                            <option>Java</option>
                                            <option>Python3</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 border-b border-white/5">
                                        <Editor
                                            theme="vs-dark"
                                            defaultLanguage="cpp"
                                            defaultValue={`class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};`}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                padding: { top: 16 }
                                            }}
                                        />
                                    </div>
                                    <div className="p-4 flex gap-3">
                                        <button className="flex-1 py-2.5 bg-[#1A1C23] hover:bg-[#252831] border border-white/10 rounded-lg text-sm font-bold transition-colors">
                                            Run Testcases
                                        </button>
                                        <button className="flex-1 py-2.5 bg-[var(--color-primary)] hover:bg-[#ff4e5c] rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(230,57,70,0.3)]">
                                            Submit Solution
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 space-y-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                <Trophy size={48} />
                            </div>
                            <div className="text-center space-y-2">
                                <h1 className="text-4xl font-bold italic tracking-wider">GAME OVER</h1>
                                <p className="text-[var(--color-slate)] text-lg">Time's up! Here's how you performed.</p>
                            </div>
                            <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
                                <div className="bg-[#1A1C23] p-6 rounded-2xl border border-white/5 text-center space-y-1">
                                    <p className="text-xs text-slate-500 font-bold uppercase">Rank</p>
                                    <p className="text-3xl font-black text-white">#1</p>
                                </div>
                                <div className="bg-[#1A1C23] p-6 rounded-2xl border border-white/5 text-center space-y-1">
                                    <p className="text-xs text-slate-500 font-bold uppercase">Points</p>
                                    <p className="text-3xl font-black text-[var(--color-primary)]">+25</p>
                                </div>
                                <div className="bg-[#1A1C23] p-6 rounded-2xl border border-white/5 text-center space-y-1">
                                    <p className="text-xs text-slate-500 font-bold uppercase">Correct</p>
                                    <p className="text-3xl font-black text-green-500">8/10</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setGameState('lobby')}
                                className="px-8 py-3 bg-[var(--color-primary)] rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
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
