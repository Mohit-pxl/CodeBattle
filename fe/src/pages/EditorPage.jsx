import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Send, ChevronLeft, Settings, TerminalSquare, FileText, CheckCircle2, History, MessageSquare, Bot, User, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { EditorPageSkeleton } from '../components/Shimmer';
import axiosClient from '../utils/axiosClient';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function EditorPage() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [problem, setProblem] = useState(null);
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchProblem = async () => {
            try {
                const res = await axiosClient.get(`/problem/problemById/${id}`);
                if (isMounted) {
                    setProblem(res.data);
                    if (res.data.startCode && res.data.startCode.length > 0) {
                        const initial = res.data.startCode.find(s => s.language === 'c++' || s.language === 'cpp' || s.language === 'C++');
                        if (initial) setCode(initial.initialCode);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchProblem();
        return () => { isMounted = false; };
    }, [id]);

    // UI State
    const [leftTab, setLeftTab] = useState('description');
    const [language, setLanguage] = useState('C++');
    const [code, setCode] = useState('');
    const [testResults, setTestResults] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionType, setExecutionType] = useState('run');
    
    const [showChatAi, setShowChatAi] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { id: 1, role: 'ai', text: 'Hello! I am your AI coding assistant. How can I help you with this problem?' }
    ]);
    const [userMessage, setUserMessage] = useState('');

    const handleRun = async () => {
        setLeftTab('result');
        setIsExecuting(true);
        setExecutionType('run');
        setTestResults(null);
        try {
            const res = await axiosClient.post(`/submission/run/${id}`, { code, language: languageMap[language] });
            setTestResults({ type: 'run', data: res.data });
        } catch (err) {
            setTestResults({ type: 'error', data: err.response?.data || err.message });
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSubmit = async () => {
        setLeftTab('result');
        setIsExecuting(true);
        setExecutionType('submit');
        setTestResults(null);
        try {
            const res = await axiosClient.post(`/submission/submit/${id}`, { code, language: languageMap[language] });
            const result = res.data;
            setTestResults({ type: 'submit', data: result });
            
            if (result.status === 'accepted') {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        } catch (err) {
            setTestResults({ type: 'error', data: err.response?.data || err.message });
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userMessage.trim()) return;

        const newMessage = { id: Date.now(), role: 'user', text: userMessage };
        setChatMessages(prev => [...prev, newMessage]);
        setUserMessage('');

        try {
            const res = await axiosClient.post('/ai/chat', { prompt: userMessage });
            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: res.data?.message || "I'm sorry, I couldn't process your request."
            }]);
        } catch(err) {
            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: "Error communicating with AI Assistant."
            }]);
        }
    };

    const languageMap = {
        'C++': 'c++',
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
                    <span className="font-semibold text-white truncate max-w-[200px] md:max-w-xs">{problem?.title || `Problem ${id}`}</span>
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
                            { id: 'result', icon: TerminalSquare, label: 'Test Result' },
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
                                        <h2 className="text-2xl font-bold text-white mb-4">{problem?.title || 'Problem Title'}</h2>
                                        <div className="flex gap-2 mb-6">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${problem?.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' : problem?.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} uppercase`}>
                                                {problem?.difficulty || 'Medium'}
                                            </span>
                                            {problem?.tags?.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded text-xs text-[var(--color-slate)] bg-white/5 capitalize">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="mb-6 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: problem?.description || '' }}></div>

                                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Examples:</h3>
                                        {problem?.visibleTestCases?.map((tc, idx) => (
                                            <div key={idx} className="bg-[#1A1C23] p-4 rounded-lg border border-white/5 font-mono text-sm mb-4">
                                                <p className="mb-1"><strong className="text-white">Input:</strong> {tc.input}</p>
                                                <p className="mb-1"><strong className="text-white">Output:</strong> {tc.output}</p>
                                                {tc.explanation && (
                                                    <p><strong className="text-white">Explanation:</strong> {tc.explanation}</p>
                                                )}
                                            </div>
                                        ))}
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
                                {leftTab === 'result' && (
                                    <div className="text-[var(--color-slate)]">
                                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <TerminalSquare className="text-[var(--color-primary)]" /> Execution Result
                                        </h2>
                                        
                                        {isExecuting ? (
                                            <div className="flex flex-col items-center justify-center py-20">
                                                <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                                                <p className="text-white font-medium">{executionType === 'run' ? 'Running Code...' : 'Evaluating Submission...'}</p>
                                                <p className="text-xs text-[var(--color-slate)] mt-2">Connecting to secure executing space</p>
                                            </div>
                                        ) : !testResults ? (
                                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                                <Play size={48} className="text-[var(--color-slate)] mb-4" />
                                                <p>Run or Submit your code to see results here.</p>
                                            </div>
                                        ) : testResults.type === 'error' ? (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                                                <h3 className="text-red-500 font-bold mb-2">Execution Error</h3>
                                                <pre className="text-red-400 text-sm whitespace-pre-wrap font-mono">{typeof testResults.data === 'string' ? testResults.data : JSON.stringify(testResults.data)}</pre>
                                            </div>
                                        ) : testResults.type === 'run' ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${testResults.data?.every(t => t.status_id === 3) ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                        {testResults.data?.every(t => t.status_id === 3) ? 'Accepted' : 'Failed'}
                                                    </span>
                                                    <span className="text-sm font-medium">{testResults.data?.filter(t => t.status_id === 3).length || 0} / {testResults.data?.length || 0} Testcases Passed</span>
                                                </div>
                                                
                                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {testResults.data && testResults.data.map((test, i) => (
                                                        <div key={i} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${test.status_id === 3 ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'}`}>
                                                            <div className="flex justify-between items-center mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`p-1.5 rounded-lg ${test.status_id === 3 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                                        {test.status_id === 3 ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                                                                    </div>
                                                                    <h4 className="font-bold text-white text-base">Test Case {i + 1}</h4>
                                                                </div>
                                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md ${test.status_id === 3 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                                    {test.status_id === 3 ? 'Passed' : 'Failed'}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                                                                <div className="bg-[#0B0C10] p-3.5 rounded-xl border border-white/5 flex flex-col">
                                                                    <span className="text-[10px] text-[var(--color-slate)] mb-1 uppercase tracking-widest font-bold opacity-60">Time</span>
                                                                    <span className="text-white font-semibold">{test.time || '0.000'}s</span>
                                                                </div>
                                                                <div className="bg-[#0B0C10] p-3.5 rounded-xl border border-white/5 flex flex-col">
                                                                    <span className="text-[10px] text-[var(--color-slate)] mb-1 uppercase tracking-widest font-bold opacity-60">Memory</span>
                                                                    <span className="text-white font-semibold">{test.memory || '0'} KB</span>
                                                                </div>
                                                            </div>
                                                            {(test.stderr || test.compile_output) && (
                                                                <div className="mt-4 bg-[#0B0C10] p-4 rounded-xl border border-red-500/20">
                                                                    <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-[10px] uppercase tracking-widest">
                                                                        <AlertCircle size={12} /> Error Output
                                                                    </div>
                                                                    <pre className="text-red-300 text-xs whitespace-pre-wrap font-mono leading-relaxed">{test.stderr || test.compile_output}</pre>
                                                                </div>
                                                            )}
                                                            {test.stdout && (
                                                                <div className="mt-4 bg-[#0B0C10] p-4 rounded-xl border border-white/5">
                                                                    <span className="text-[10px] text-[var(--color-slate)] mb-2 block uppercase tracking-widest font-bold opacity-60">Standard Output</span>
                                                                    <pre className="text-white/90 text-xs whitespace-pre-wrap font-mono leading-relaxed">{test.stdout}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className={`p-6 rounded-2xl border ${testResults.data.status === 'accepted' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                                    <h3 className={`text-2xl font-black mb-2 uppercase tracking-tight ${testResults.data.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {testResults.data.status}
                                                    </h3>
                                                    
                                                    <div className="grid grid-cols-3 gap-4 mt-6">
                                                        <div className="bg-[#0B0C10] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                                                            <span className="text-[10px] text-[var(--color-slate)] font-bold uppercase tracking-widest mb-1">Runtime</span>
                                                            <span className="text-[1.2rem] sm:text-xl font-bold text-white">{testResults.data.runtime || '0'}s</span>
                                                        </div>
                                                        <div className="bg-[#0B0C10] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                                                            <span className="text-[10px] text-[var(--color-slate)] font-bold uppercase tracking-widest mb-1">Memory</span>
                                                            <span className="text-[1.2rem] sm:text-xl font-bold text-white">{testResults.data.memory || '0'} KB</span>
                                                        </div>
                                                        <div className="bg-[#0B0C10] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                                                            <span className="text-[10px] text-[var(--color-slate)] font-bold uppercase tracking-widest mb-1">Testcases</span>
                                                            <span className="text-[1.2rem] sm:text-xl font-bold text-white">{testResults.data.testCasesPassed} / {testResults.data.testCasesTotal}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {testResults.data.errorMessage && (
                                                        <div className="mt-6 bg-[#0B0C10] p-4 rounded-xl border border-red-500/20 overflow-x-auto">
                                                            <span className="text-xs text-red-500 font-bold mb-2 block uppercase tracking-wider">Error Details</span>
                                                            <pre className="text-red-400 text-sm whitespace-pre-wrap font-mono uppercase">{testResults.data.errorMessage}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} colors={['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557']} />}
            </div>
        </div>
    );
}
