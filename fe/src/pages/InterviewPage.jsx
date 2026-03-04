import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Briefcase,
    ChevronRight,
    MessageSquare,
    Send,
    User,
    Bot,
    Sparkles,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Zap
} from 'lucide-react';

const ROLES = [
    { id: 'frontend', title: 'Frontend Developer', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'backend', title: 'Backend Developer', icon: Briefcase, color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'fullstack', title: 'Fullstack Engineer', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'datascience', title: 'Data Scientist', icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-400/10' },
];

const EXPERIENCE_LEVELS = ['Entry Level', 'Mid-Level', 'Senior'];

export default function InterviewPage() {
    const [step, setStep] = useState(1); // 1: Selection, 2: Interview
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedExp, setSelectedExp] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [specificRole, setSpecificRole] = useState("");
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const startInterview = () => {
        if (!selectedRole || !selectedExp) return;
        setStep(2);
        setMessages([
            {
                id: 1,
                role: 'ai',
                text: `Welcome! I'll be your AI interviewer ${companyName ? `for ${companyName}` : ''} for the ${specificRole || selectedRole.title} (${selectedExp}) position today. We'll cover technical concepts, problem-solving, and system design. \n\nLet's start with a warm-up: Can you tell me about the most challenging project you've worked on recently?`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Mock AI response
        setTimeout(() => {
            setIsTyping(false);
            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                text: getMockResponse(selectedRole.id),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 2000);
    };

    const getMockResponse = (roleId) => {
        const responses = {
            frontend: "That's interesting. Regarding that project, how did you handle state management? And if you had to optimize the initial load time, what techniques would you prioritize?",
            backend: "Great explanation. Moving to technical concepts: how would you design a rate-limiting service that handles millions of requests per second for this architecture?",
            fullstack: "I see. Let's dive deeper into the full-stack aspect. How do you ensure consistency between your frontend cache and the backend database in real-time applications?",
            datascience: "Interesting use case. How did you handle data imbalance in your training set? And which evaluation metrics were most critical for success?"
        };
        return responses[roleId] || "Excellent. Let's move on to the next question. How do you handle scalability in your typical workflow?";
    };

    return (
        <div className="min-h-screen bg-transparent relative flex flex-col pt-20 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>
            </div>

            <style>{`
                .glass-panel {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
            `}</style>
            {step === 1 ? (
                /* Selection Step */
                <div className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl w-full z-10"
                    >
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                                AI <span className="text-[var(--color-primary)]">Interview</span> Coach
                            </h1>
                            <p className="text-slate-400 text-lg">Prepare for your dream job with personalized AI mock interviews.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Role Selection */}
                            <div className="glass-panel p-8 border-white/5 bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <User size={20} className="text-[var(--color-primary)]" />
                                    Select Target Role
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {ROLES.map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => setSelectedRole(role)}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selectedRole?.id === role.id
                                                ? `bg-[var(--color-primary)]/10 border-[var(--color-primary)]/50`
                                                : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${role.bg} ${role.color}`}>
                                                    <role.icon size={20} />
                                                </div>
                                                <span className="font-semibold text-white">{role.title}</span>
                                            </div>
                                            {selectedRole?.id === role.id && <CheckCircle2 size={18} className="text-[var(--color-primary)]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Level */}
                            <div className="flex flex-col gap-8">
                                <div className="glass-panel p-8 border-white/5 bg-white/[0.02] flex-1">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Clock size={20} className="text-[var(--color-primary)]" />
                                        Experience Level
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {EXPERIENCE_LEVELS.map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setSelectedExp(level)}
                                                className={`p-4 rounded-xl border font-semibold text-left transition-all ${selectedExp === level
                                                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/50 text-white'
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/[0.08] hover:text-white'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Details */}
                                <div className="glass-panel p-8 border-white/5 bg-white/[0.02]">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Briefcase size={20} className="text-[var(--color-primary)]" />
                                        Custom Interview Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Target Company</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Google, Meta, Startup..."
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--color-primary)] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Specific Job Role</label>
                                            <input
                                                type="text"
                                                placeholder={`e.g. ${selectedRole?.title || 'Senior Software Engineer'}`}
                                                value={specificRole}
                                                onChange={(e) => setSpecificRole(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--color-primary)] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={startInterview}
                                    disabled={!selectedRole || !selectedExp}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${selectedRole && selectedExp
                                        ? 'bg-[var(--color-primary)] text-white hover:scale-[1.02] shadow-[0_10px_30px_rgba(230,57,70,0.3)]'
                                        : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
                                        }`}
                                >
                                    Start Interview
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : (
                /* Interview Interface */
                <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#1A1C23]/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-white font-bold flex items-center gap-2">
                                    {selectedRole.title} Interview
                                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-500 uppercase">{selectedExp}</span>
                                </h2>
                                <div className="flex items-center gap-1.5 text-xs text-green-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    AI Interviewer Active
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-xs font-semibold text-slate-300">
                                <Clock size={14} className="text-[var(--color-primary)]" />
                                Session: 12:45
                            </div>
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors">
                                End Interview
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 flex flex-col custom-scrollbar pb-32"
                    >
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${msg.role === 'ai' ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                        }`}>
                                        {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className={`p-4 rounded-2xl text-[0.95rem] leading-relaxed shadow-sm ${msg.role === 'ai'
                                            ? 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'
                                            : 'bg-[var(--color-primary)] text-white rounded-tr-none shadow-[0_4px_15px_rgba(230,57,70,0.2)]'
                                            }`}>
                                            {msg.text}
                                        </div>
                                        <span className={`text-[10px] font-bold text-slate-600 uppercase tracking-tighter ${msg.role === 'ai' ? 'text-left' : 'text-right'}`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                                        <Bot size={18} />
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10] to-transparent pointer-events-none z-20">
                        <div className="max-w-7xl mx-auto w-full pointer-events-auto">
                            <form
                                onSubmit={handleSendMessage}
                                className="relative flex items-center"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full bg-[#1A1C23] border border-white/10 text-white rounded-2xl py-5 pl-6 pr-24 outline-none focus:border-[var(--color-primary)]/50 transition-all shadow-2xl placeholder:text-slate-600 text-lg"
                                />
                                <div className="absolute right-3 flex items-center gap-2">
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim()}
                                        className="p-3 bg-[var(--color-primary)] text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                                    >
                                        <Send size={24} />
                                    </button>
                                </div>
                            </form>
                            <p className="text-[10px] text-center text-slate-600 mt-3 font-bold uppercase tracking-[0.2em]">
                                Practice makes perfect • AI responses are generated for demonstration
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
