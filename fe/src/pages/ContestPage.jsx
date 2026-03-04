import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, Clock, ChevronRight, Star, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router';

const CONTESTS = [
    {
        id: 1,
        title: "Weekly Code Challenge #42",
        status: "Upcoming",
        startTime: "Mar 5, 2026, 08:00 PM",
        duration: "90 Mins",
        participants: "1.2k+",
        difficulty: "Mix",
        prize: "$500 Pool",
        gradient: "from-blue-600 to-cyan-500"
    },
    {
        id: 2,
        title: "March Algorithms Sprint",
        status: "Live",
        startTime: "Happening Now",
        duration: "120 Mins",
        participants: "3.5k+",
        difficulty: "Hard",
        prize: "Exclusive Badge",
        gradient: "from-purple-600 to-pink-500"
    },
    {
        id: 3,
        title: "Frontend Masters Duel",
        status: "Upcoming",
        startTime: "Mar 8, 2026, 10:00 AM",
        duration: "60 Mins",
        participants: "800+",
        difficulty: "Medium",
        prize: "$200 Pool",
        gradient: "from-orange-500 to-yellow-500"
    }
];

export default function ContestPage() {
    return (
        <div className="min-h-screen bg-[#0B0C10] text-white pt-24 pb-12 px-6">
            <div className="max-w-[1600px] mx-auto space-y-16">

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1C23] to-[#0B0C10] border border-white/5 p-8 md:p-16">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-[100px]"></div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold text-sm"
                            >
                                <Trophy size={16} />
                                GLOBAL LEADERBOARD LIVE
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-black leading-tight italic tracking-tighter"
                            >
                                CONQUER THE <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[#ff7e67]">ARENA</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-[var(--color-slate)] text-lg max-w-lg leading-relaxed"
                            >
                                Join thousands of developers in high-stakes coding competitions. Prove your skills, climb the ranks, and win exclusive prizes.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap gap-4"
                            >
                                <button className="px-8 py-4 bg-[var(--color-primary)] rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(230,57,70,0.3)] hover:scale-105 transition-all">
                                    REGISTER NOW
                                </button>
                                <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-lg hover:bg-white/10 transition-all flex items-center gap-2">
                                    PAST CONTESTS <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="hidden md:block"
                        >
                            <div className="relative">
                                <div className="absolute -inset-4 bg-[var(--color-primary)]/20 blur-3xl rounded-full"></div>
                                <img
                                    src="https://img.freepik.com/free-vector/modern-gaming-vibe-with-neon-lights_23-2148906566.jpg?t=st=1740925000~exp=1740928600~hmac=6b9b3e1a0b3e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5g"
                                    alt="Contest"
                                    className="relative rounded-3xl border border-white/10 shadow-2xl"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Contest Grid */}
                <div className="space-y-8">
                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold italic tracking-tight">ACTIVE & UPCOMING</h2>
                            <p className="text-[var(--color-slate)] font-medium">Don't miss out on these opportunities to shine.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10">Filter All</button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CONTESTS.map((contest, idx) => (
                            <motion.div
                                key={contest.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group relative bg-[#1A1C23] border border-white/5 rounded-3xl p-6 overflow-hidden transition-all hover:border-[var(--color-primary)]/30 shadow-2xl"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${contest.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${contest.status === 'Live' ? 'bg-green-500/20 text-green-500 animate-pulse' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {contest.status}
                                        </div>
                                        <div className="text-yellow-500">
                                            <Star size={20} fill="currentColor" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{contest.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-[var(--color-slate)] font-medium">
                                            <Calendar size={14} /> {contest.startTime}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Duration</p>
                                            <p className="font-bold flex items-center gap-1.5"><Clock size={14} /> {contest.duration}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Prize</p>
                                            <p className="font-bold text-[var(--color-primary)] flex items-center gap-1.5"><Zap size={14} /> {contest.prize}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1A1C23] bg-slate-700 overflow-hidden">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contest.id + i}`} alt="User" />
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-xs text-slate-500 font-bold">{contest.participants} Joined</span>
                                        </div>
                                        <button className="p-3 rounded-2xl bg-white/5 hover:bg-[var(--color-primary)] hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Training Section */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-r from-blue-600/10 to-transparent border border-white/5 rounded-3xl p-8 space-y-4">
                        <h3 className="text-2xl font-bold italic underline decoration-[var(--color-primary)] decoration-4 underline-offset-8">PRACTICE ARENA</h3>
                        <p className="text-[var(--color-slate)]">Practice with problems from past contests to sharpen your skills before the real thing.</p>
                        <Link to="/problems" className="inline-flex items-center gap-2 text-[var(--color-primary)] font-bold hover:underline">
                            Browse Practice Problems <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600/10 to-transparent border border-white/5 rounded-3xl p-8 space-y-4">
                        <h3 className="text-2xl font-bold italic underline decoration-blue-500 decoration-4 underline-offset-8">LEARN STRATEGIES</h3>
                        <p className="text-[var(--color-slate)]">Read our blog posts on how to optimize your time and performance during contests.</p>
                        <Link to="/discussions" className="inline-flex items-center gap-2 text-blue-400 font-bold hover:underline">
                            Read Strategy Guides <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
