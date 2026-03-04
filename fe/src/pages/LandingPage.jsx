import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MockTerminal from '../components/MockTerminal';
import FeaturesSection from '../components/FeaturesSection';
import { LandingPageSkeleton } from '../components/Shimmer';

export default function LandingPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

    if (isLoading) return <LandingPageSkeleton />;

    return (
        <div>
            {/* Hero Section */}
            <div className="flex flex-wrap min-h-screen pt-20 relative items-center">
                {/* Left Content */}
                <div className="flex-[1_1_500px] px-[8%] py-12 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="mb-6">
                            <h1 className="text-[4.5rem] leading-[1.1] font-extrabold">
                                <motion.span
                                    animate={{
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                    }}
                                    transition={{
                                        duration: 6,
                                        ease: "linear",
                                        repeat: Infinity
                                    }}
                                    style={{
                                        display: 'inline-block',
                                        backgroundImage: 'linear-gradient(270deg, var(--color-white) 0%, #ff8a98 25%, var(--color-primary) 50%, #ff8a98 75%, var(--color-white) 100%)',
                                        backgroundSize: '200% auto',
                                        color: 'transparent',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 4px 12px rgba(230, 57, 70, 0.4))'
                                    }}
                                >
                                    Build & <br /> Dominate.
                                </motion.span>
                            </h1>
                        </div>

                        <p className="text-[1.25rem] text-[var(--color-slate)] mb-8 max-w-[480px] leading-relaxed">
                            Elevate your engineering skills in an immersive 3D environment.
                            Write logic, solve complex problems, and rise through the ranks.
                        </p>

                        <div className="glass-panel p-6 max-w-[480px] mb-12 border-l-4 border-[var(--color-primary)]">
                            <h3 className="text-[1.2rem] text-[var(--color-white)] mb-3">Why Codebattle?</h3>
                            <p className="text-[var(--color-slate)] text-[0.95rem] leading-relaxed">
                                We combine competitive programming with interactive games and real-time chat. Join contests, prepare for interviews, and connect with top developers worldwide.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Right Hero Visual / Mock Terminal */}
                <div className="flex-[1_1_500px] px-[8%] py-12 relative flex items-center justify-center">
                    <MockTerminal />
                </div>
            </div>

            {/* Features Section */}
            <FeaturesSection />
        </div>
    );
}
