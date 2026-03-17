import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Send, ChevronLeft, Settings, TerminalSquare, FileText, CheckCircle2, History, MessageSquare, Bot, User, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { EditorPageSkeleton } from '../components/Shimmer';

export default function EditorPage() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(t);
    }, [id]);

    // UI State
    const [leftTab, setLeftTab] = useState('description');
    const [language, setLanguage] = useState('C++');
    const [code, setCode] = useState('class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};');
    const [consoleOutput, setConsoleOutput] = useState('');
    const [showConsole, setShowConsole] = useState(false);
    const [showChatAi, setShowChatAi] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { id: 1, role: 'ai', text: 'Hello! I am your AI coding assistant. How can I help you with this problem?' }
    ]);
    const [userMessage, setUserMessage] = useState('');

    // Mock actions
    const handleRun = () => {
        setShowConsole(true);
        setConsoleOutput('Running...\n\nStatus: Accepted\nRuntime: 12 ms\nMemory: 10.4 MB\n\nTestcases passed: 3/3');
    };

    const handleSubmit = () => {
        setShowConsole(true);
        setConsoleOutput('Submitting code...\n\nSuccess!\nStatus: Accepted\nRuntime: 8 ms (Beats 95% of users with C++)\nMemory: 10.2 MB');
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!userMessage.trim()) return;

        const newMessage = { id: Date.now(), role: 'user', text: userMessage };
        setChatMessages([...chatMessages, newMessage]);
        setUserMessage('');

        // Mock AI response
        setTimeout(() => {
            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: "That's a great question! For the Two Sum problem, using a hash map is usually the most efficient approach."
            }]);
        }, 1000);
    };

    const languageMap = {
        'C++': 'cpp',
        'Java': 'java',
        'Python3': 'python',
        'JavaScript': 'javascript',
        'Go': 'go'
    };

    const boilerplates = {
        'C++': 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};',
        'Java': 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}',
        'Python3': 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ',
        'JavaScript': '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};',
        'Go': 'func twoSum(nums []int, target int) []int {\n    \n}'
    };

    // Update code when language changes
    useEffect(() => {
        if (boilerplates[language]) {
            setCode(boilerplates[language]);
        }
    }, [language]);

    if (isLoading) return <EditorPageSkeleton />;

    return (
        <div className="flex flex-col h-screen pt-20 bg-[#0B0C10] text-[var(--color-slate)]">

            {/* Top Toolbar */}
            <header className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0B0C10] z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/problems" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                        <ChevronLeft size={16} /> Back to Problems
                    </Link>
                    <div className="h-4 w-px bg-white/20"></div>
                    <span className="font-semibold text-white">Problem {id}: Two Sum</span>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#1A1C23] border border-white/10 text-sm rounded-md px-3 py-1.5 outline-none hover:border-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-colors"
                    >
                        {['C++', 'Java', 'Python3', 'JavaScript', 'Go'].map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                    <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors" title="Settings">
                        <Settings size={18} />
                    </button>
                    <div className="flex gap-2 ml-2">
                        <button
                            onClick={handleRun}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1F2128] hover:bg-[#2A2D35] text-white border border-white/5 rounded-md text-sm font-medium transition-colors"
                        >
                            <Play size={14} className="text-gray-300" /> Run
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary)] hover:bg-[#ff4e5c] text-white rounded-md text-sm font-semibold shadow-[0_0_10px_rgba(230,57,70,0.3)] transition-all"
                        >
                            <Send size={14} /> Submit
                        </button>
                    </div>
                </div>
            </header>

            {/* Split Workspace */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">

                {/* Left Pane: Content */}
                <div className="w-full md:w-1/2 flex flex-col border-r border-white/5 bg-[#0B0C10] h-1/2 md:h-full">
                    {/* Tabs */}
                    <div className="flex border-b border-white/5 bg-[#0D0E12]">
                        {[
                            { id: 'description', icon: FileText, label: 'Description' },
                            { id: 'editorial', icon: TerminalSquare, label: 'Editorial' },
                            { id: 'solution', icon: CheckCircle2, label: 'Solutions' },
                            { id: 'submissions', icon: History, label: 'Submissions' },
                            { id: 'chatai', icon: Bot, label: 'AI Chat' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === 'chatai') {
                                        setShowChatAi(true);
                                    } else {
                                        setLeftTab(tab.id);
                                    }
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${leftTab === tab.id || (tab.id === 'chatai' && showChatAi)
                                    ? 'border-[var(--color-primary)] text-white bg-white/5'
                                    : 'border-transparent text-[var(--color-slate)] hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={15} className={leftTab === tab.id ? 'text-[var(--color-primary)]' : ''} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={leftTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {leftTab === 'description' && (
                                    <div className="prose prose-invert max-w-none">
                                        <h2 className="text-2xl font-bold text-white mb-4">1. Two Sum</h2>
                                        <div className="flex gap-2 mb-6">
                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">Easy</span>
                                            <span className="px-2 py-0.5 rounded text-xs text-[var(--color-slate)] bg-white/5">Array</span>
                                            <span className="px-2 py-0.5 rounded text-xs text-[var(--color-slate)] bg-white/5">Hash Table</span>
                                        </div>
                                        <p className="mb-4">Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
                                        <p className="mb-4">You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>
                                        <p className="mb-6">You can return the answer in any order.</p>

                                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Example 1:</h3>
                                        <div className="bg-[#1A1C23] p-4 rounded-lg border border-white/5 font-mono text-sm mb-4">
                                            <p className="mb-1"><strong className="text-white">Input:</strong> nums = [2,7,11,15], target = 9</p>
                                            <p className="mb-1"><strong className="text-white">Output:</strong> [0,1]</p>
                                            <p><strong className="text-white">Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
                                        </div>

                                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Constraints:</h3>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>
                                            <li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>
                                            <li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>
                                        </ul>
                                    </div>
                                )}
                                {leftTab === 'editorial' && (
                                    <div className="text-[var(--color-slate)]">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-white">Editorial</h2>
                                        </div>
                                        <p className="mb-4">A standard naive approach would be to loop through all pairs of elements to find if they sum up to target. This takes O(n^2) time.</p>
                                        <p>A better approach uses a Hash Map to store the elements we've seen so far. As we iterate, we check if `target - current_element` exists in the map. This brings the time complexity down to O(n) and space complexity to O(n).</p>
                                    </div>
                                )}
                                {leftTab === 'solution' && (
                                    <div className="text-[var(--color-slate)]">
                                        <h2 className="text-xl font-bold text-white mb-4">Community Solutions</h2>
                                        <p>Browse highly upvoted solutions by the community here.</p>
                                    </div>
                                )}
                                {leftTab === 'submissions' && (
                                    <div className="text-[var(--color-slate)]">
                                        <h2 className="text-xl font-bold text-white mb-4">Your Submissions</h2>
                                        <p>You have no past submissions for this problem.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Pane: Editor & Console */}
                <div className="w-full md:w-1/2 flex flex-col bg-[#111216] h-1/2 md:h-full border-t md:border-t-0 border-white/5">

                    {/* Code Editor */}
                    <div className="flex-1 flex flex-col pt-2 relative">
                        <div className="flex justify-between items-center px-4 mb-2 shrink-0">
                            <span className="text-xs font-mono text-white/50">{language}</span>
                        </div>
                        <div className="flex-1 w-full h-full relative border-y border-white/5">
                            <Editor
                                defaultLanguage="cpp"
                                language={languageMap[language]}
                                theme="vs-dark"
                                value={code}
                                onChange={(val) => setCode(val)}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>
                    </div>

                    {/* Console Panel (Collapsible) */}
                    <div className={`border-t border-white/5 bg-[#0B0C10] flex flex-col transition-all duration-300 ${showConsole ? 'h-64' : 'h-10'}`}>
                        <div
                            className="flex items-center justify-between px-4 h-10 cursor-pointer hover:bg-white/5"
                            onClick={() => setShowConsole(!showConsole)}
                        >
                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <TerminalSquare size={16} className={showConsole ? 'text-[var(--color-primary)]' : ''} />
                                Console
                            </div>
                            <span className="text-xs text-white/40">{showConsole ? 'Close' : 'Open'}</span>
                        </div>

                        {showConsole && (
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-sm">
                                {consoleOutput ? (
                                    <pre className="text-green-400 whitespace-pre-wrap">{consoleOutput}</pre>
                                ) : (
                                    <div className="text-white/40 italic">Run your code to see output here.</div>
                                )}
                            </div>
                        )}
                    </div>

                </div>

                <AnimatePresence>
                    {showChatAi && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 w-full md:w-1/2 h-full bg-[#0D0E12] border-r border-white/10 z-50 flex flex-col shadow-2xl"
                        >
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1A1C23]">
                                <div className="flex items-center gap-2 font-bold text-white">
                                    <Bot className="text-[var(--color-primary)]" size={20} />
                                    AI Assist
                                </div>
                                <button onClick={() => setShowChatAi(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                                {chatMessages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}
                                    >
                                        <div className={`flex items-center gap-2 mb-1 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className={`p-1 rounded-full ${msg.role === 'ai' ? 'bg-[var(--color-primary)]/20' : 'bg-blue-500/20'}`}>
                                                {msg.role === 'ai' ? <Bot size={12} className="text-[var(--color-primary)]" /> : <User size={12} className="text-blue-400" />}
                                            </div>
                                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{msg.role}</span>
                                        </div>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'ai'
                                            ? 'bg-[var(--color-primary)]/10 text-white rounded-tl-none border border-[var(--color-primary)]/20'
                                            : 'bg-white/5 text-slate-300 rounded-tr-none border border-white/10'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#1A1C23]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={userMessage}
                                        onChange={(e) => setUserMessage(e.target.value)}
                                        placeholder="Ask AI anything..."
                                        className="w-full bg-[#0B0C10] border border-white/10 text-white text-sm rounded-lg pl-4 pr-10 py-2.5 outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-primary)] hover:scale-110 transition-transform"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
