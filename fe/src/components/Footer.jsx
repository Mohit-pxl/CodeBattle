import React from 'react';
import { Terminal, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router';

export default function Footer() {
    return (
        <footer className="w-full px-[8%] py-12 bg-[var(--color-black)] border-t border-[rgba(197,198,199,0.1)] relative z-10">
            <div className="flex justify-between flex-wrap gap-8">
                <div className="max-w-[300px]">
                    <Link to="/" className="flex items-center gap-3 mb-4">
                        <Terminal color="#E63946" size={28} />
                        <span className="text-xl font-bold text-[var(--color-white)]">Codebattle</span>
                    </Link>
                    <p className="text-[var(--color-slate)] text-[0.9rem] leading-relaxed">
                        The ultimate platform to build your coding skills, collaborate, and compete in contests.
                    </p>
                </div>

                <div className="flex gap-12 flex-wrap">
                    <div className="flex flex-col gap-3">
                        <h4 className="text-[var(--color-white)] text-[1.1rem] mb-2">Platform</h4>
                        <Link to="/problems" className="footer-link">Problems</Link>
                        <Link to="/contest" className="footer-link">Contest</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h4 className="text-[var(--color-white)] text-[1.1rem] mb-2">Community</h4>
                        <Link to="/games" className="footer-link">Games</Link>
                        <Link to="/chat" className="footer-link">Chat</Link>
                        <Link to="/leaderboard" className="footer-link">Leaderboard</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h4 className="text-[var(--color-white)] text-[1.1rem] mb-2">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="footer-social"><Github size={20} /></a>
                            <a href="#" className="footer-social"><Twitter size={20} /></a>
                            <a href="#" className="footer-social"><Linkedin size={20} /></a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-[rgba(197,198,199,0.1)] flex justify-between text-[var(--color-slate)] text-[0.85rem] flex-wrap gap-4">
                <p>&copy; {new Date().getFullYear()} Codebattle. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link to="/privacy" className="footer-link-small">Privacy Policy</Link>
                    <Link to="/terms" className="footer-link-small">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
