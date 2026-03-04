import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, MessageSquare, ThumbsUp, Eye, Clock, User, Tag, X } from 'lucide-react';

const MOCK_DISCUSSIONS = [
    {
        id: 1,
        title: "How to optimize Two Sum for large inputs?",
        author: "code_ninja",
        date: "2 hours ago",
        category: "Algorithm",
        comments: 15,
        likes: 42,
        views: 320,
        tags: ["Array", "Hash Map", "Performance"]
    },
    {
        id: 2,
        title: "Best resources for learning Dynamic Programming?",
        author: "dev_alex",
        date: "5 hours ago",
        category: "Learning",
        comments: 28,
        likes: 156,
        views: 1200,
        tags: ["DP", "Resources", "Beginner"]
    },
    {
        id: 3,
        title: "Interview experience with Google - SDE 1",
        author: "hired_soon",
        date: "1 day ago",
        category: "Interview",
        comments: 45,
        likes: 890,
        views: 5400,
        tags: ["Google", "SDE1", "Experience"]
    }
];

const CATEGORIES = ["All", "Algorithm", "Learning", "Interview", "Career", "General"];

export default function DiscussionPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showNewModal, setShowNewModal] = useState(false);
    const [discussions, setDiscussions] = useState(MOCK_DISCUSSIONS);

    const filteredDiscussions = discussions.filter(d =>
        (selectedCategory === "All" || d.category === selectedCategory) &&
        (d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                            Community <span className="text-[var(--color-primary)]">Discussions</span>
                        </h1>
                        <p className="text-slate-400 text-lg">Share knowledge, ask questions, and grow together.</p>
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl hover:scale-105 transition-transform shrink-0"
                    >
                        <Plus size={20} />
                        New Discussion
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="glass-panel p-6 mb-8 flex flex-col lg:flex-row gap-6 items-center justify-between border-white/5">
                    <div className="relative w-full lg:w-1/2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search discussions, tags, or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0B0C10] border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-[var(--color-primary)]/50 transition-all placeholder:text-slate-600"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
                        <Filter size={18} className="text-[var(--color-primary)] shrink-0" />
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${selectedCategory === cat
                                    ? 'bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(230,57,70,0.3)]'
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Discussions List */}
                <div className="grid gap-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredDiscussions.map((discussion, idx) => (
                            <motion.div
                                key={discussion.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-panel p-6 hover:border-[var(--color-primary)]/30 transition-all cursor-pointer group border-white/5"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                                                {discussion.category}
                                            </span>
                                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                                <Clock size={12} /> {discussion.date}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                                            {discussion.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {discussion.tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                    <Tag size={10} /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-orange-400 flex items-center justify-center text-[10px] font-bold text-black border border-white/10 uppercase">
                                                    {discussion.author[0]}
                                                </div>
                                                <span className="text-sm text-slate-300 font-medium">{discussion.author}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-center justify-center gap-6 md:gap-3 bg-white/5 md:px-6 py-4 rounded-2xl md:min-w-[120px] border border-white/5">
                                        <div className="flex flex-col items-center">
                                            <ThumbsUp size={18} className="text-slate-500 group-hover:text-[var(--color-primary)] transition-colors mb-1" />
                                            <span className="text-sm font-bold text-white">{discussion.likes}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <MessageSquare size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors mb-1" />
                                            <span className="text-sm font-bold text-white">{discussion.comments}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Eye size={18} className="text-slate-500 group-hover:text-green-400 transition-colors mb-1" />
                                            <span className="text-sm font-bold text-white">{discussion.views}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredDiscussions.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={30} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No discussions found</h3>
                            <p className="text-slate-500">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Discussion Modal */}
            <AnimatePresence>
                {showNewModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNewModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0D0E12] border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-white">Share your <span className="text-[var(--color-primary)]">Thoughts</span></h2>
                                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setShowNewModal(false); }}>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Topic Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Understanding Segment Trees for range queries"
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)]/50 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Category</label>
                                        <select className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)]/50 transition-all appearance-none cursor-pointer">
                                            {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., DSA, Trees, Advanced"
                                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)]/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Content</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Describe your topic in detail..."
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)]/50 transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewModal(false)}
                                        className="px-6 py-3 rounded-xl border border-white/10 text-slate-400 font-semibold hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary px-8 py-3 rounded-xl font-bold"
                                    >
                                        Post Discussion
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
