import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Link as LinkIcon, Edit2, LogOut, Code2, Award, Zap, History, Activity, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../authSlice';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

export default function ProfilePage() {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState([]);
    const [solvedCount, setSolvedCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const [subsRes, solvedRes] = await Promise.all([
                    axiosClient.get('/submission/user'),
                    axiosClient.get('/problem/problemSolvedByUser'),
                ]);
                setSubmissions(Array.isArray(subsRes.data) ? subsRes.data : []);
                setSolvedCount(Array.isArray(solvedRes.data) ? solvedRes.data.length : 0);
            } catch (err) {
                console.error('Failed to fetch profile data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [user, isAuthenticated, navigate]);

    if (!isAuthenticated || !user) {
        return null;
    }

    // Compute language proficiency from real submissions
    const languageStats = (() => {
        if (!Array.isArray(submissions) || submissions.length === 0) return [];
        const langMap = {};
        submissions.forEach(sub => {
            if (!sub?.language) return;
            const lang = sub.language;
            if (!langMap[lang]) langMap[lang] = { total: 0, accepted: 0 };
            langMap[lang].total++;
            if (sub.status === 'accepted') langMap[lang].accepted++;
        });

        const colorMap = {
            'javascript': 'bg-[#ffca28]',
            'c++': 'bg-blue-500',
            'java': 'bg-orange-500',
            'python': 'bg-yellow-500',
        };
        const nameMap = {
            'javascript': 'JavaScript',
            'c++': 'C++',
            'java': 'Java',
            'python': 'Python',
        };

        return Object.entries(langMap)
            .map(([lang, { total, accepted }]) => ({
                name: nameMap[lang] || lang,
                level: total > 0 ? Math.round((accepted / total) * 100) : 0,
                color: colorMap[lang] || 'bg-gray-500',
                total,
                accepted,
            }))
            .sort((a, b) => b.total - a.total);
    })();

    const displayName = user.firstName || 'User';
    const displayEmail = user.emailId || 'user@example.com';

    const stats = [
        { label: 'Solved', value: solvedCount.toString(), icon: Code2, color: 'text-green-400' },
        { label: 'Contests', value: '0', icon: Award, color: 'text-yellow-400' },
        { label: 'Points', value: (solvedCount * 10).toString(), icon: Zap, color: 'text-blue-400' },
        { label: 'Submits', value: submissions.length.toString(), icon: History, color: 'text-purple-400' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0C10] pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Sidebar: User Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#111216] rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-orange-500"></div>

                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[#ff4e5c] p-1 shadow-[0_0_20px_rgba(230,57,70,0.3)]">
                                        <div className="w-full h-full rounded-[14px] bg-[#111216] flex items-center justify-center overflow-hidden">
                                            <User size={48} className="text-white/80" />
                                        </div>
                                    </div>
                                    <button className="absolute -bottom-1 -right-1 p-2 bg-[#1A1C23] border border-white/10 rounded-lg text-white/60 hover:text-[var(--color-primary)] transition-colors shadow-lg">
                                        <Edit2 size={14} />
                                    </button>
                                </div>

                                <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
                                <p className="text-[var(--color-slate)] text-sm mb-4">@{displayName.toLowerCase()}</p>

                                <div className="w-full space-y-3 py-4 border-y border-white/5">
                                    <div className="flex items-center gap-3 text-sm text-[var(--color-slate)]">
                                        <Mail size={16} />
                                        <span>{displayEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-[var(--color-slate)]">
                                        <MapPin size={16} />
                                        <span>San Francisco, CA</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-[var(--color-slate)] hover:text-white transition-colors cursor-pointer">
                                        <LinkIcon size={16} />
                                        <span>github.com/{displayName.toLowerCase()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all font-medium"
                                >
                                    <LogOut size={16} />
                                    Log Out
                                </button>
                            </div>
                        </div>

                        {/* Recent Badges */}
                        <div className="bg-[#111216] rounded-2xl border border-white/5 p-6 shadow-xl">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Award size={16} className="text-yellow-400" />
                                Recent Badges
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center" title="Problem Solver">
                                        <Zap size={18} className="text-yellow-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Stats and Activity */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-[#111216] p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-[var(--color-primary)]/30 transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <stat.icon size={20} className={stat.color} />
                                        <span className="text-xs font-bold text-[var(--color-slate)] uppercase tracking-tight">{stat.label}</span>
                                    </div>
                                    <div className="text-2xl font-black text-white">{stat.value}</div>
                                </motion.div>
                            ))}
                        </div>


                        {/* Problem Solving Progress */}
                        <div className="bg-[#111216] rounded-2xl border border-white/5 p-8 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6">Language Proficiency</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    {languageStats.length > 0 ? (
                                        languageStats.map(lang => (
                                            <div key={lang.name} className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                    <span className="text-white">{lang.name}</span>
                                                    <span className="text-[var(--color-slate)]">{lang.level}% ({lang.accepted}/{lang.total})</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${lang.level}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className={`h-full ${lang.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[var(--color-slate)] italic">No submissions yet. Start solving problems!</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                    <div className="text-center">
                                        <Code2 size={40} className="mx-auto text-white/20 mb-3" />
                                        <p className="text-sm text-[var(--color-slate)] italic">More stats coming soon...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-[#111216] rounded-2xl border border-white/5 p-8 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
                            <div className="space-y-6">
                                {Array.isArray(submissions) && submissions.length > 0 ? (
                                    submissions.slice(0, 5).map((activity, i) => (
                                        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${activity?.status === 'accepted' ? 'bg-green-500/10 group-hover:bg-green-500/20' : 'bg-red-500/10 group-hover:bg-red-500/20'}`}>
                                                    <History size={18} className={activity?.status === 'accepted' ? 'text-green-500' : 'text-red-500'} />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium group-hover:text-[var(--color-primary)] transition-colors">{activity?.problemId?.title || 'Unknown Problem'}</h4>
                                                    <p className="text-xs text-[var(--color-slate)]">
                                                        {activity?.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Unknown Date'}
                                                        {activity?.language ? ` · ${activity.language}` : ''}
                                                        {activity?.testCasesPassed !== undefined && activity?.testCasesTotal ? ` · ${activity.testCasesPassed}/${activity.testCasesTotal} passed` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                                                activity?.status === 'accepted' 
                                                    ? 'bg-green-500/10 text-green-400' 
                                                    : activity?.status === 'error' 
                                                        ? 'bg-red-500/10 text-red-400' 
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                                {activity?.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[var(--color-slate)] italic text-sm">No recent activity. Start solving!</div>
                                )}
                            </div>
                        </div>

                        {/* Consistency Calendar (Heatmap) */}
                        <div className="bg-[#111216] rounded-2xl border border-white/5 p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity size={18} className="text-[var(--color-primary)]" />
                                    Submission Consistency
                                </h3>
                                <div className="flex items-center gap-3 text-[10px] text-[var(--color-slate)] font-bold uppercase tracking-wider bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                    <span>Less</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-[3px] bg-white/5 border border-white/10"></div>
                                        <div className="w-3 h-3 rounded-[3px] bg-green-500/20"></div>
                                        <div className="w-3 h-3 rounded-[3px] bg-green-500/40"></div>
                                        <div className="w-3 h-3 rounded-[3px] bg-green-500/60"></div>
                                        <div className="w-3 h-3 rounded-[3px] bg-green-500/80"></div>
                                    </div>
                                    <span>More</span>
                                </div>
                            </div>

                            {/* Robust Heatmap Implementation */}
                            {(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                // Start from January 1st of current year
                                const year = today.getFullYear();
                                const startDate = new Date(year, 0, 1);

                                // Find the Sunday before Jan 1st to align weeks
                                const startSunday = new Date(startDate);
                                startSunday.setDate(startDate.getDate() - startDate.getDay());

                                // Create 53 weeks to cover the year
                                const months = [];
                                let currentMonth = -1;
                                const submissionMap = {};
                                if (Array.isArray(submissions)) {
                                    submissions.forEach(sub => {
                                        if (!sub || !sub.createdAt) return;
                                        const date = new Date(sub.createdAt);
                                        const dStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                                        submissionMap[dStr] = (submissionMap[dStr] || 0) + 1;
                                    });
                                }

                                for (let i = 0; i < 371; i++) {
                                    const d = new Date(startSunday);
                                    d.setDate(startSunday.getDate() + i);

                                    const m = d.getMonth();
                                    const isFuture = d > today || d.getFullYear() > year;
                                    const isOutsideYear = d.getFullYear() !== year;

                                    if (m !== currentMonth) {
                                        months.push({
                                            name: d.toLocaleString('default', { month: 'short' }),
                                            days: []
                                        });
                                        currentMonth = m;
                                    }

                                    let count = 0;
                                    if (!isFuture && !isOutsideYear) {
                                        const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                                        count = submissionMap[dStr] || 0;
                                    }

                                    const levels = ['bg-white/5', 'bg-green-500/20', 'bg-green-500/40', 'bg-green-500/60', 'bg-green-500/80'];
                                    const levelIdx = (isFuture || isOutsideYear) ? 0 : (count === 0 ? 0 : Math.min(Math.ceil(count / 2), 4));

                                    months[months.length - 1].days.push({
                                        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                        level: levels[levelIdx],
                                        count,
                                        isFuture,
                                        isOutsideYear
                                    });
                                }

                                return (
                                    <div className="flex gap-4" style={{ '--cell-size': '14px', '--cell-gap': '6px' }}>
                                        {/* Weekday Labels: Aligned to rows */}
                                        <div className="grid grid-rows-7 gap-[var(--cell-gap)] pt-[18px] text-[9px] font-bold text-[var(--color-slate)] uppercase tracking-tighter">
                                            <div className="h-[var(--cell-size)] flex items-center"></div>
                                            <div className="h-[var(--cell-size)] flex items-center">Mon</div>
                                            <div className="h-[var(--cell-size)] flex items-center"></div>
                                            <div className="h-[var(--cell-size)] flex items-center">Wed</div>
                                            <div className="h-[var(--cell-size)] flex items-center"></div>
                                            <div className="h-[var(--cell-size)] flex items-center">Fri</div>
                                            <div className="h-[var(--cell-size)] flex items-center"></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="overflow-x-auto pb-4 custom-scrollbar">
                                                <div className="flex gap-6 min-w-max">
                                                    {months.map((month, mIdx) => (
                                                        <div key={mIdx} className="space-y-2">
                                                            <div className="text-[10px] text-[var(--color-slate)] font-bold uppercase tracking-widest leading-none">
                                                                {month.name}
                                                            </div>
                                                            <div className="grid grid-rows-7 grid-flow-col gap-[var(--cell-gap)]">
                                                                {month.days.map((day, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`w-[var(--cell-size)] h-[var(--cell-size)] rounded-[2px] ${day.level} border border-green-500/5 hover:border-white/40 transition-all cursor-pointer shadow-sm ${(day.isFuture || day.isOutsideYear) ? 'opacity-20' : ''}`}
                                                                        title={`${day.date}${day.isFuture ? ' (Future)' : day.isOutsideYear ? ' (Outside Year)' : `: ${day.count} submissions`}`}
                                                                    ></div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
