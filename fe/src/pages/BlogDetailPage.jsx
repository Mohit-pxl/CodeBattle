import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Tag, ThumbsUp, MessageSquare, Eye } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { toast } from 'react-toastify';
import moment from 'moment';

export default function BlogDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await axiosClient.get(`/blog/blog/${id}`);
                setBlog(res.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load blog");
                navigate('/blog');
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen pt-28 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-[#E63946]/20 border-t-[#E63946] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-[1000px] mx-auto">
                <button 
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Blogs
                </button>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 md:p-12 border-white/5"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                            {blog.category || "General"}
                        </span>
                        <span className="text-slate-500 text-sm flex items-center gap-1.5">
                            <Clock size={14} /> {moment(blog.createdAt).format('MMMM Do YYYY')}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                        {blog.title}
                    </h1>

                    <div className="flex items-center justify-between border-b border-white/10 pb-8 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-orange-400 flex items-center justify-center text-sm font-bold text-black border border-white/10 uppercase">
                                {blog.author?.firstName?.[0] || "U"}
                            </div>
                            <div>
                                <div className="text-white font-medium">{blog.author?.firstName || "Unknown User"}</div>
                                <div className="text-slate-500 text-xs">Author</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-slate-400">
                                <ThumbsUp size={18} /> <span>{blog.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Eye size={18} /> <span>{blog.views || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none mb-12 text-slate-300">
                        {blog.content.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-4">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-8 border-t border-white/10">
                            {blog.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 text-sm text-slate-400 bg-white/5 py-1.5 px-3 rounded-lg border border-white/5">
                                    <Tag size={12} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}