import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Plus, Trash2, ChevronDown, ChevronUp, Code2,
    Eye, EyeOff, Tag, FileText, Zap, CheckCircle, AlertCircle, X,
    Edit3, LayoutDashboard, ListFilter
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const AVAILABLE_TAGS = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
    'Greedy', 'Sorting', 'Two Pointers', 'Binary Search', 'DFS',
    'BFS', 'Stack', 'Queue', 'Linked List', 'Tree', 'Graph',
    'Recursion', 'Backtracking', 'Bit Manipulation', 'Sliding Window',
];
const SUPPORTED_LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust'];

// ─── Shared Sub-components ───────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, accentColor = '#E63946' }) {
    return (
        <motion.div
            className="admin-section-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="admin-section-header">
                <Icon size={18} color={accentColor} />
                <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
            </div>
            {children}
        </motion.div>
    );
}

function TestCaseRow({ tc, index, onChange, onRemove, type }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="testcase-row">
            <div className="testcase-row-header" onClick={() => setExpanded(v => !v)}>
                <span style={{ color: '#E63946', fontWeight: 600, fontSize: '0.85rem' }}>
                    #{index + 1} — {type === 'hidden' ? '🔒 Hidden' : '👁️ Visible'}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        type="button"
                        className="icon-btn danger"
                        onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                        title="Remove"
                    >
                        <Trash2 size={14} />
                    </button>
                    {expanded ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                </div>
            </div>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <label className="field-label">Input</label>
                            <textarea
                                className="input-field code-textarea"
                                placeholder="e.g. [1, 2, 3]\n3"
                                value={tc.input}
                                onChange={e => onChange(index, 'input', e.target.value)}
                                rows={3}
                            />
                            <label className="field-label">Expected Output</label>
                            <textarea
                                className="input-field code-textarea"
                                placeholder="e.g. 6"
                                value={tc.output}
                                onChange={e => onChange(index, 'output', e.target.value)}
                                rows={2}
                            />
                            <label className="field-label">Explanation (optional)</label>
                            <textarea
                                className="input-field"
                                placeholder="Explain the test case..."
                                value={tc.explanation}
                                onChange={e => onChange(index, 'explanation', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CodeTemplateBlock({ lang, template, solution, onTemplateChange, onSolutionChange, onRemove }) {
    const [tab, setTab] = useState('template');
    return (
        <div className="code-block-card">
            <div className="code-block-header">
                <span className="lang-badge">{lang}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        type="button"
                        className={`tab-btn ${tab === 'template' ? 'active' : ''}`}
                        onClick={() => setTab('template')}
                    >
                        Template
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${tab === 'solution' ? 'active' : ''}`}
                        onClick={() => setTab('solution')}
                    >
                        Solution
                    </button>
                    <button type="button" className="icon-btn danger" onClick={onRemove} title="Remove language">
                        <X size={14} />
                    </button>
                </div>
            </div>
            {tab === 'template' ? (
                <textarea
                    className="input-field code-textarea"
                    placeholder={`// Starter template for ${lang}`}
                    value={template}
                    onChange={e => onTemplateChange(e.target.value)}
                    rows={8}
                    spellCheck={false}
                />
            ) : (
                <textarea
                    className="input-field code-textarea"
                    placeholder={`// Reference solution in ${lang}`}
                    value={solution}
                    onChange={e => onSolutionChange(e.target.value)}
                    rows={8}
                    spellCheck={false}
                />
            )}
        </div>
    );
}

// ─── Component: Create Problem ────────────────────────────────────────────────
function CreateProblem({ showToast }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        difficulty: 'Medium',
        tags: [],
        visibleTestCases: [],
        hiddenTestCases: [],
        codeBlocks: {},
    });

    const updateField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const toggleTag = (tag) => {
        setForm(f => ({
            ...f,
            tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
        }));
    };

    const addTC = (type) => {
        const key = type === 'hidden' ? 'hiddenTestCases' : 'visibleTestCases';
        setForm(f => ({ ...f, [key]: [...f[key], { input: '', output: '', explanation: '' }] }));
    };
    const removeTC = (type, idx) => {
        const key = type === 'hidden' ? 'hiddenTestCases' : 'visibleTestCases';
        setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));
    };
    const updateTC = (type, idx, field, val) => {
        const key = type === 'hidden' ? 'hiddenTestCases' : 'visibleTestCases';
        setForm(f => {
            const updated = [...f[key]];
            updated[idx] = { ...updated[idx], [field]: val };
            return { ...f, [key]: updated };
        });
    };

    const addLanguage = (lang) => {
        if (!lang || form.codeBlocks[lang]) return;
        setForm(f => ({
            ...f,
            codeBlocks: { ...f.codeBlocks, [lang]: { template: '', solution: '' } },
        }));
    };
    const removeLanguage = (lang) => {
        setForm(f => {
            const cb = { ...f.codeBlocks };
            delete cb[lang];
            return { ...f, codeBlocks: cb };
        });
    };
    const updateCode = (lang, field, val) => {
        setForm(f => ({
            ...f,
            codeBlocks: { ...f.codeBlocks, [lang]: { ...f.codeBlocks[lang], [field]: val } },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return showToast('error', 'Title is required.');
        if (!form.description.trim()) return showToast('error', 'Description is required.');
        if (form.tags.length === 0) return showToast('error', 'Select at least one tag.');
        if (form.visibleTestCases.length === 0) return showToast('error', 'Add at least one visible test case.');
        if (form.hiddenTestCases.length === 0) return showToast('error', 'Add at least one hidden test case.');
        if (Object.keys(form.codeBlocks).length === 0) return showToast('error', 'Add at least one language template.');

        console.log('Submitting problem:', JSON.stringify(form, null, 2));
        showToast('success', `Problem "${form.title}" created successfully!`);

        // Reset form on success
        setForm({ title: '', description: '', difficulty: 'Medium', tags: [], visibleTestCases: [], hiddenTestCases: [], codeBlocks: {} });
    };

    const difficultyColors = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#E63946' };

    return (
        <form className="admin-form" onSubmit={handleSubmit} autoComplete="off">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                <h2 className="text-xl font-bold text-white">Create New Problem</h2>
                <p className="text-[var(--color-slate)] text-sm">Fill in the details to publish a new algorithmic challenge.</p>
            </motion.div>

            <SectionCard icon={FileText} title="Basic Info">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                    <div>
                        <label className="field-label">Problem Title *</label>
                        <input type="text" className="input-field" placeholder="e.g. Two Sum" value={form.title} onChange={e => updateField('title', e.target.value)} />
                    </div>
                    <div>
                        <label className="field-label">Difficulty *</label>
                        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                            {DIFFICULTIES.map(d => (
                                <button key={d} type="button" className={`difficulty-btn ${form.difficulty === d ? 'selected' : ''}`} style={{ '--diff-color': difficultyColors[d] }} onClick={() => updateField('difficulty', d)}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: 16 }}>
                    <label className="field-label">Description *</label>
                    <textarea className="input-field" placeholder="Describe the problem in detail. You can use markdown." value={form.description} onChange={e => updateField('description', e.target.value)} rows={6} style={{ resize: 'vertical' }} />
                </div>
            </SectionCard>

            <SectionCard icon={Tag} title="Tags">
                <div className="tags-grid">
                    {AVAILABLE_TAGS.map(tag => (
                        <button key={tag} type="button" className={`tag-chip ${form.tags.includes(tag) ? 'selected' : ''}`} onClick={() => toggleTag(tag)}>
                            {tag}
                        </button>
                    ))}
                </div>
            </SectionCard>

            <SectionCard icon={Eye} title="Visible Test Cases" accentColor="#22c55e">
                {form.visibleTestCases.map((tc, i) => (
                    <TestCaseRow key={i} tc={tc} index={i} type="visible" onChange={(idx, field, val) => updateTC('visible', idx, field, val)} onRemove={idx => removeTC('visible', idx)} />
                ))}
                <button type="button" className="add-btn" onClick={() => addTC('visible')}><Plus size={15} /> Add Visible Test Case</button>
            </SectionCard>

            <SectionCard icon={EyeOff} title="Hidden Test Cases" accentColor="#f59e0b">
                {form.hiddenTestCases.map((tc, i) => (
                    <TestCaseRow key={i} tc={tc} index={i} type="hidden" onChange={(idx, field, val) => updateTC('hidden', idx, field, val)} onRemove={idx => removeTC('hidden', idx)} />
                ))}
                <button type="button" className="add-btn" onClick={() => addTC('hidden')}><Plus size={15} /> Add Hidden Test Case</button>
            </SectionCard>

            <SectionCard icon={Code2} title="Code Templates & Reference Solutions">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    {SUPPORTED_LANGUAGES.filter(l => !form.codeBlocks[l]).map(lang => (
                        <button key={lang} type="button" className="lang-add-btn" onClick={() => addLanguage(lang)}><Plus size={13} /> {lang}</button>
                    ))}
                </div>
                {Object.entries(form.codeBlocks).map(([lang, { template, solution }]) => (
                    <CodeTemplateBlock key={lang} lang={lang} template={template} solution={solution} onTemplateChange={val => updateCode(lang, 'template', val)} onSolutionChange={val => updateCode(lang, 'solution', val)} onRemove={() => removeLanguage(lang)} />
                ))}
            </SectionCard>

            <motion.div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="submit" className="btn-primary" style={{ padding: '12px 36px', fontSize: '1rem' }}><Zap size={16} /> Publish Problem</button>
            </motion.div>
        </form>
    );
}

// ─── Component: Update Problem ────────────────────────────────────────────────
function UpdateProblem({ showToast }) {
    const [searchId, setSearchId] = useState('');

    return (
        <div className="admin-form">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                <h2 className="text-xl font-bold text-white">Update Existing Problem</h2>
                <p className="text-[var(--color-slate)] text-sm">Search for a problem by ID or Name to edit its details.</p>
            </motion.div>

            <SectionCard icon={Edit3} title="Find Problem">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        className="input-field flex-1"
                        placeholder="Enter ID or Title..."
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <button
                        type="button"
                        className="btn-primary w-full sm:w-auto"
                        onClick={() => showToast('error', 'Mock API: Problem not found.')}
                    >
                        Search
                    </button>
                </div>
            </SectionCard>

            <div className="text-center py-12 text-[var(--color-slate)] border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <ListFilter size={48} className="mx-auto mb-4 opacity-50" />
                <p>Search for a problem to load the editor.</p>
            </div>
        </div>
    );
}

// ─── Component: Delete Problem ────────────────────────────────────────────────
function DeleteProblem({ showToast }) {
    const [searchId, setSearchId] = useState('');

    return (
        <div className="admin-form">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                <h2 className="text-xl font-bold text-white">Delete Problem</h2>
                <p className="text-[var(--color-slate)] text-sm">Permanently remove a problem from the platform. This cannot be undone.</p>
            </motion.div>

            <SectionCard icon={Trash2} title="Find & Delete Problem" accentColor="#E63946">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                    <div className="flex-1">
                        <label className="field-label text-sm mb-2 block">Problem ID *</label>
                        <input
                            type="text"
                            className="input-field w-full"
                            placeholder="Enter Problem ID to delete..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-md transition-colors h-[42px] flex items-center justify-center gap-2 w-full sm:w-auto"
                        onClick={() => {
                            if (!searchId) return showToast('error', 'Please enter a problem ID');
                            showToast('success', `Problem ${searchId} deleted successfully.`);
                            setSearchId('');
                        }}
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            </SectionCard>
        </div>
    );
}

// ─── Main Admin Page Component ────────────────────────────────────────────────
export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('create'); // 'create', 'update', 'delete'
    const [toast, setToast] = useState(null);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    return (
        <div className="admin-page min-h-screen pt-24 px-8 pb-12 flex justify-center">

            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`admin-toast ${toast.type}`}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        style={{ position: 'fixed', top: 100, right: 30, zIndex: 1000 }}
                    >
                        {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 md:gap-8">

                {/* Tabs / Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 custom-scrollbar">
                    <div className="hidden md:flex items-center gap-3 mb-6 px-4 shrink-0">
                        <Shield size={28} color="#E63946" />
                        <h1 className="text-2xl font-bold text-white m-0">Admin</h1>
                    </div>

                    {[
                        { id: 'create', icon: Plus, label: 'Create' },
                        { id: 'update', icon: Edit3, label: 'Update' },
                        { id: 'delete', icon: Trash2, label: 'Delete' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 sm:gap-3 px-4 py-2 sm:py-3 shrink-0 rounded-xl font-medium transition-all text-left ${activeTab === tab.id
                                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                                    : 'text-[var(--color-slate)] hover:bg-white/5 hover:text-white border border-transparent'
                                }`}
                        >
                            <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                            <span className="text-sm sm:text-base">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-[#111216] border border-white/5 rounded-2xl p-4 sm:p-8 min-h-[500px] shadow-2xl overflow-hidden w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'create' && <CreateProblem showToast={showToast} />}
                            {activeTab === 'update' && <UpdateProblem showToast={showToast} />}
                            {activeTab === 'delete' && <DeleteProblem showToast={showToast} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
