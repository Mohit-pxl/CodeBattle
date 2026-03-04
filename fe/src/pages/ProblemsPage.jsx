import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { ProblemRowSkeleton, FiltersPanelSkeleton } from '../components/Shimmer';

// Mock Data
const MOCK_PROBLEMS = [
    { id: 1, title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Table'], solved: true },
    { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', tags: ['Linked List', 'Math'], solved: false },
    { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tags: ['Hash Table', 'String', 'Sliding Window'], solved: true },
    { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', tags: ['Array', 'Binary Search', 'Divide and Conquer'], solved: false },
    { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', tags: ['String', 'Dynamic Programming'], solved: false },
    { id: 6, title: 'Zigzag Conversion', difficulty: 'Medium', tags: ['String'], solved: true },
    { id: 7, title: 'Reverse Integer', difficulty: 'Medium', tags: ['Math'], solved: false },
    { id: 8, title: 'String to Integer (atoi)', difficulty: 'Medium', tags: ['String', 'Math'], solved: false },
    { id: 9, title: 'Palindrome Number', difficulty: 'Easy', tags: ['Math'], solved: true },
    { id: 10, title: 'Regular Expression Matching', difficulty: 'Hard', tags: ['String', 'Dynamic Programming', 'Recursion'], solved: false },
];

const ALL_TAGS = Array.from(new Set(MOCK_PROBLEMS.flatMap(p => p.tags))).sort();

export default function ProblemsPage() {
    const [problems, setProblems] = useState(MOCK_PROBLEMS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(t);
    }, []);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Solved', 'Unsolved'
    const [difficultyFilter, setDifficultyFilter] = useState('All'); // 'All', 'Easy', 'Medium', 'Hard'
    const [selectedTag, setSelectedTag] = useState(''); // '' means all

    const toggleSolved = (e, id) => {
        e.preventDefault(); // Prevent navigating to the editor page when clicking the circle
        setProblems(prev => prev.map(p =>
            p.id === id ? { ...p, solved: !p.solved } : p
        ));
    };

    // Derived filtered problems
    const filteredProblems = problems.filter(p => {
        let matchStatus = true;
        if (statusFilter === 'Solved') matchStatus = p.solved;
        if (statusFilter === 'Unsolved') matchStatus = !p.solved;

        let matchDifficulty = true;
        if (difficultyFilter !== 'All') matchDifficulty = p.difficulty === difficultyFilter;

        let matchTag = true;
        if (selectedTag) matchTag = p.tags.includes(selectedTag);

        return matchStatus && matchDifficulty && matchTag;
    });

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="min-h-screen pt-28 px-8 pb-12 w-full max-w-[1600px] mx-auto flex flex-col gap-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-extrabold text-white mb-2">Practice Problems</h1>
                <p className="text-[var(--color-slate)] text-lg">Enhance your skills by solving these algorithmic challenges.</p>
            </motion.div>

            {isLoading ? (
                <>
                    <FiltersPanelSkeleton />
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 6 }).map((_, i) => <ProblemRowSkeleton key={i} />)}
                    </div>
                </>
            ) : (
                <>
                    {/* Filters Section */}
                    <motion.div
                        className="glass-panel p-6 flex flex-col gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Status & Difficulty Filters */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 items-start sm:items-center">
                            <div className="flex bg-[#0B0C10] p-1 rounded-lg border border-white/5 w-full sm:w-auto overflow-x-auto">
                                {['All', 'Solved', 'Unsolved'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all text-center ${statusFilter === status
                                            ? 'bg-[var(--color-primary)] text-white shadow-lg'
                                            : 'text-[var(--color-slate)] hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

                            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => setDifficultyFilter(diff)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${difficultyFilter === diff
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white'
                                            : 'border-white/10 text-[var(--color-slate)] hover:border-white/30 hover:text-white'
                                            }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags Filter */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3">Tags & Topics</h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedTag('')}
                                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedTag === ''
                                        ? 'bg-white text-black font-semibold'
                                        : 'bg-white/5 text-[var(--color-slate)] hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    All Tags
                                </button>
                                {ALL_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedTag === tag
                                            ? 'bg-[var(--color-primary)] text-white font-semibold'
                                            : 'bg-white/5 text-[var(--color-slate)] hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Problem List */}
                    <div className="flex flex-col gap-3">
                        {filteredProblems.map((problem, i) => (
                            <motion.div
                                key={problem.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    to={`/problems/${problem.id}`}
                                    className="group flex items-center p-4 bg-[#111216] border border-white/5 rounded-xl hover:border-[var(--color-primary)]/50 hover:bg-[#15161A] transition-all"
                                >
                                    {/* Status Icon */}
                                    <div
                                        className="mr-4 cursor-pointer p-2 -ml-2 rounded-full hover:bg-white/5"
                                        onClick={(e) => toggleSolved(e, problem.id)}
                                    >
                                        {problem.solved ? (
                                            <CheckCircle2 className="text-green-500" size={24} />
                                        ) : (
                                            <Circle className="text-[var(--color-slate)] group-hover:text-white/50 transition-colors" size={24} />
                                        )}
                                    </div>

                                    {/* Problem Info */}
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="text-[1rem] sm:text-lg font-semibold text-white group-hover:text-[var(--color-primary)] transition-colors truncate">
                                            {problem.id}. {problem.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                                            <span className={`px-2.5 py-0.5 rounded text-[0.65rem] sm:text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </span>
                                            {problem.tags.map(tag => (
                                                <span key={tag} className="text-[0.65rem] sm:text-xs text-[var(--color-slate)] bg-white/5 px-2 py-0.5 rounded whitespace-nowrap">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="ml-auto flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                                            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}

                        {filteredProblems.length === 0 && (
                            <div className="py-12 text-center text-[var(--color-slate)] glass-panel border border-dashed border-white/10">
                                <p className="text-lg">No problems match your current filters.</p>
                                <button
                                    onClick={() => { setStatusFilter('All'); setDifficultyFilter('All'); setSelectedTag(''); }}
                                    className="mt-4 text-[var(--color-primary)] hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
