import React from 'react';
import { motion } from 'framer-motion';
import { Triangle, Circle, Square, Hexagon, Octagon, Infinity as InfinityIcon } from 'lucide-react';

export default function CompanyBanner() {
    const companies = [
        { name: "TechCorp", icon: <Triangle size={24} /> },
        { name: "InnovateIO", icon: <Circle size={24} /> },
        { name: "FutureSys", icon: <Square size={24} /> },
        { name: "CloudSync", icon: <Hexagon size={24} /> },
        { name: "QuantumAI", icon: <Octagon size={24} /> },
        { name: "DevSphere", icon: <InfinityIcon size={24} /> },
    ];

    const companiesSet = (
        <>
            {companies.map((company, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 font-bold text-[1.4rem] cursor-pointer"
                    style={{
                        color: 'transparent',
                        backgroundImage: 'linear-gradient(135deg, #e0e0e0 0%, #9e9e9e 50%, #616161 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
                        transformStyle: 'preserve-3d',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #9e9e9e 100%)';
                        e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(230, 57, 70, 0.6)) drop-shadow(0 0 24px rgba(230, 57, 70, 0.3)) drop-shadow(0px 4px 8px rgba(0,0,0,0.6))';
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.05) rotateX(10deg)';
                        const icon = e.currentTarget.querySelector('svg');
                        if (icon) {
                            icon.style.stroke = 'var(--color-primary)';
                            icon.style.filter = 'drop-shadow(0 0 8px rgba(230, 57, 70, 0.8))';
                            icon.style.transform = 'translateZ(10px)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #e0e0e0 0%, #9e9e9e 50%, #616161 100%)';
                        e.currentTarget.style.filter = 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))';
                        e.currentTarget.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
                        const icon = e.currentTarget.querySelector('svg');
                        if (icon) {
                            icon.style.stroke = 'currentColor';
                            icon.style.filter = 'none';
                            icon.style.transform = 'translateZ(0)';
                        }
                    }}
                >
                    <div className="text-[#9e9e9e] transition-all duration-[400ms] flex items-center">
                        {company.icon}
                    </div>
                    <span className="tracking-wide">{company.name}</span>
                </div>
            ))}
        </>
    );

    return (
        <div
            className="relative w-full overflow-hidden py-12 bg-[var(--color-black)] border-t border-[rgba(197,198,199,0.05)] flex flex-col items-center justify-center"
        >
            {/* Smooth Glowing Light Sweep */}
            <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "linear",
                    repeatDelay: 2
                }}
                className="absolute top-0 bottom-0 w-[40%] pointer-events-none z-0"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(230, 57, 70, 0.02), rgba(230, 57, 70, 0.15), rgba(230, 57, 70, 0.02), transparent)',
                    transform: 'skewX(-25deg)',
                }}
            />

            <h3
                className="text-[var(--color-slate)] uppercase tracking-[3px] text-[0.85rem] mb-10 relative z-[1] opacity-70"
            >
                Trusted by innovative teams worldwide
            </h3>

            {/* Marquee Container */}
            <div
                className="relative w-full flex overflow-hidden z-[1]"
                style={{
                    maskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)',
                    WebkitMaskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)',
                }}
            >
                <motion.div
                    animate={{ x: ['0%', '-33.333333%'] }}
                    transition={{
                        repeat: Infinity,
                        duration: 30,
                        ease: "linear"
                    }}
                    className="flex w-max"
                >
                    <div className="flex gap-20 pr-20">{companiesSet}</div>
                    <div className="flex gap-20 pr-20">{companiesSet}</div>
                    <div className="flex gap-20 pr-20">{companiesSet}</div>
                </motion.div>
            </div>
        </div>
    );
}
