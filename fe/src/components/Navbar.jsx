import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Activity, Menu, X, User, LogOut, ChevronDown, Settings, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../authSlice";
import codeBattleLogo from "../assets/file_0000000054cc71fa9401d452ca99cb03.png";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();

    const dispatch = useDispatch();

    const { user, isAuthenticated } = useSelector((state) => state.auth);
    console.log("AUTH STATE:", { user, isAuthenticated });

    const logout = () => {
  dispatch(logoutUser());
    };

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    return (
        <nav
            className="fixed top-0 w-full flex justify-between items-center z-[100] transition-all duration-[400ms]"
            style={{
                padding: scrolled ? '16px 48px' : '24px 48px',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
                background: scrolled ? 'rgba(11, 12, 16, 0.7)' : 'transparent',
                borderBottom: scrolled ? '1px solid rgba(230, 57, 70, 0.1)' : '1px solid transparent',
                boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.5)' : 'none',
            }}
        >
            <Link to="/" className="flex items-center gap-3">
                <img
                    src={codeBattleLogo}
                    alt="CodeBattle"
                    className="h-12 w-auto object-contain sm:h-14"
                />
                <span
                    className="text-[1.6rem] font-extrabold tracking-widest uppercase"
                    style={{
                        backgroundImage: 'linear-gradient(90deg, #FFFFFF, #C5C6C7)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        textShadow: '0 2px 10px rgba(255,255,255,0.1)',
                    }}
                >
                    Codebattle
                </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-8 items-center font-medium text-[var(--color-slate)] text-[0.95rem]">
                <Link to="/problems" className="nav-link">Problems</Link>
                <Link to="/contests" className="nav-link">Contests</Link>
                <Link to="/games" className="nav-link">Games</Link>
                <Link to="/interview" className="nav-link">Interview</Link>
                <Link to="/discussions" className="nav-link">Discussions</Link>
                <Link to="/visualizer" className="nav-link flex items-center gap-1.5 text-[var(--color-primary)]">
                    <Activity size={16} /> Visualizer
                </Link>
            </div>

            {/* Desktop Auth */}
            <div className="hidden lg:flex gap-6 items-center">
                {isAuthenticated ? (
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[#ff4e5c] flex items-center justify-center text-white shadow-lg">
                                <User size={18} />
                            </div>
                            <ChevronDown size={14} className={`text-[var(--color-slate)] transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setProfileOpen(false)}></div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-56 bg-[#111216] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2"
                                    >
                                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                                            <p className="text-sm font-bold text-white truncate">{user.username}</p>
                                            <p className="text-[10px] text-[var(--color-slate)] uppercase tracking-widest font-bold mt-0.5">{user.role}</p>
                                        </div>

                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-slate)] hover:text-white hover:bg-white/5 transition-colors">
                                            <User size={16} /> My Profile
                                        </Link>
                                        <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-slate)] hover:text-white hover:bg-white/5 transition-colors">
                                            <Settings size={16} /> Settings
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-slate)] hover:text-white hover:bg-white/5 transition-colors">
                                                <Shield size={16} /> Admin Panel
                                            </Link>
                                        )}

                                        <div className="h-px bg-white/5 my-2 mx-4"></div>

                                        <button
                                            onClick={() => { logout(); setProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut size={16} /> Log out
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="nav-link-hover font-semibold text-[var(--color-slate)]">Log in</Link>
                        <Link to="/signup" className="btn-primary text-[0.95rem] px-5 py-2.5">Sign up</Link>
                    </>
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className="lg:hidden text-white p-2 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-[#0B0C10] border-b border-white/10 p-6 flex flex-col gap-6 lg:hidden shadow-2xl">
                    <div className="flex flex-col gap-4 text-[1.1rem] font-medium text-[var(--color-slate)]">
                        <Link to="/problems" className="nav-link">Problems</Link>
                        <Link to="/contests" className="nav-link">Contests</Link>
                        <Link to="/games" className="nav-link">Games</Link>
                        <Link to="/interview" className="hover:text-white transition-colors">Interview</Link>
                        <Link to="/discussions" className="hover:text-white transition-colors">Discussions</Link>
                        <Link to="/visualizer" className="flex items-center gap-2 text-[var(--color-primary)]">
                            <Activity size={18} /> Visualizer
                        </Link>
                    </div>

                    <div className="h-px w-full bg-white/10"></div>

                    <div className="flex flex-col gap-4">
                        {isAuthenticated  ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="hover:text-white text-left font-semibold text-[var(--color-slate)]">Admin Dashboard</Link>
                                )}
                                <Link to="/profile" className="hover:text-white text-left font-semibold text-[var(--color-slate)]">Profile</Link>
                                <button onClick={logout} className="hover:text-white text-left font-semibold text-[var(--color-slate)]">Log out</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-white font-semibold text-[var(--color-slate)]">Log in</Link>
                                <Link to="/signup" className="btn-primary text-center py-3 w-full">Sign up</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
