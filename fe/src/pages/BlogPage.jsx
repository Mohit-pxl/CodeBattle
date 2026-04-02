import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Search, Plus, Filter, MessageSquare, ThumbsUp, Eye, Clock, User, Tag, X } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { toast } from 'react-toastify';
import moment from 'moment';

const MOCK_BLOGS = [
    {
        id: 1,
        title: "Deep Dive into Segment Trees",
        author: "code_ninja",
        date: "2 hours ago",
        category: "Algorithm",
        comments: 15,
        likes: 42,
        views: 320,
        tags: ["Trees", "Advanced", "Performance"]
    },
    {
        id: 2,
        title: "Understanding Dynamic Programming Optimization",
        author: "dev_alex",
        date: "5 hours ago",
        category: "Learning",
        comments: 28,
        likes: 156,
        views: 1200,
        tags: ["DP", "Optimization", "Advanced"]
    },
    {
        id: 3,
        title: "System Design for CodeBattle Platform",
        author: "hired_soon",
        date: "1 day ago",
        category: "Architecture",
        comments: 45,
        likes: 890,
        views: 5400,
        tags: ["System Design", "Architecture", "Scalability"]
    }
];

const CATEGORIES = ["All", "Algorithm", "Learning", "Architecture", "Career", "General"];

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showNewModal, setShowNewModal] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newTitle, setNewTitle] = useState("");
    const navigate = useNavigate();
    const [newCategory, setNewCategory] = useState("Algorithm");
    const [newTags, setNewTags] = useState("");
    const [newContent, setNewContent] = useState("");

    const fetchBlogs = async () => {
        try {
            const res = await axiosClient.get('/blog/allBlogs');
            setBlogs(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleCreateBlog = async (e) => {
        e.preventDefault();
        try {
            const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
            const res = await axiosClient.post('/blog/createPost', {
                title: newTitle,
                category: newCategory,
                tags,
                content: newContent
            });
            toast.success("Blog published successfully!");
            setShowNewModal(false);
            setNewTitle("");
            setNewCategory("Algorithm");
            setNewTags("");
            setNewContent("");
            fetchBlogs();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create blog");
        }
    };

    const filteredBlogs = blogs.filter(b =>
        (selectedCategory === "All" || b.category === selectedCategory) &&
        (b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.tags && b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))))
    );

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                            Community <span className="text-[var(--color-primary)]">Blogs</span>
                        </h1>
                        <p className="text-slate-400 text-lg">Read, write, and share tech & DSA notes.</p>
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl hover:scale-105 transition-transform shrink-0"
                    >
                        <Plus size={20} />
                        Write Blog
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="glass-panel p-6 mb-8 flex flex-col lg:flex-row gap-6 items-center justify-between border-white/5">
                    <div className="relative w-full lg:w-1/2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search blogs, tags, or topics..."
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

                {/* Blogs List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#E63946]/20 border-t-[#E63946] rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode='popLayout'>
                            {filteredBlogs.map((blog, idx) => (
                            <motion.div
                                key={blog._id || blog.id}
                                layout
                                onClick={() => navigate(`/blog/${blog._id || blog.id}`)}
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
                                                {blog.category}
                                            </span>
                                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                                <Clock size={12} /> {moment(blog.createdAt).fromNow()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                                            {blog.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {blog.tags && blog.tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                    <Tag size={10} /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-orange-400 flex items-center justify-center text-[10px] font-bold text-black border border-white/10 uppercase">
                                                    {blog.author?.firstName?.[0] || "U"}
                                                </div>
                                                <span className="text-sm text-slate-300 font-medium">{blog.author?.firstName || "Unknown User"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-center justify-center gap-6 md:gap-3 bg-white/5 md:px-6 py-4 rounded-2xl md:min-w-[120px] border border-white/5">
                                        <div className="flex flex-col items-center">
                                            <ThumbsUp size={18} className="text-slate-500 group-hover:text-[var(--color-primary)] transition-colors mb-1" />
                                            <span className="text-sm font-bold text-white">{blog.likes?.length || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <MessageSquare size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors mb-1" />
                                            <span className="text-sm font-bold text-white">{blog.comments}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Eye size={18} className="text-slate-500 group-hover:text-green-400 transition-colors mb-1" />
                                            <span className="text-sm font-bold text-white">{blog.views}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredBlogs.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={30} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No blogs found</h3>
                            <p className="text-slate-500">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* New Blog Modal */}
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
                                <h2 className="text-2xl font-bold text-white">Write a <span className="text-[var(--color-primary)]">Blog</span></h2>
                                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={handleCreateBlog}>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Blog Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="e.g., Understanding Segment Trees for range queries"
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)]/50 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Category</label>
                                        <select 
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)]/50 transition-all appearance-none cursor-pointer"
                                        >
                                            {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            value={newTags}
                                            onChange={(e) => setNewTags(e.target.value)}
                                            placeholder="e.g., DSA, Trees, Advanced"
                                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)]/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Content</label>
                                    <textarea
                                        rows={5}
                                        required
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
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
                                        Publish Blog
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
