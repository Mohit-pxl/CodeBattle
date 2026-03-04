import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Code2, Users, Target } from 'lucide-react';

const features = [
    {
        icon: <Code2 size={32} color="var(--color-primary)" />,
        title: "Extensive Problem Library",
        description: "Practice with thousands of algorithms and data structures questions asked by top tech companies."
    },
    {
        icon: <Trophy size={32} color="var(--color-primary)" />,
        title: "Weekly Contests",
        description: "Compete globally in real-time, improve your rating, and climb the leaderboard."
    },
    {
        icon: <Target size={32} color="var(--color-primary)" />,
        title: "Mock Interviews",
        description: "Simulate real interview environments with peers to build confidence under pressure."
    },
    {
        icon: <Users size={32} color="var(--color-primary)" />,
        title: "Active Community",
        description: "Discuss solutions, write articles, and connect with developers who share your passion."
    }
];

export default function FeaturesSection() {
    return (
        <section className="px-[8%] py-20 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-5xl text-[var(--color-white)] mb-4">
                    Everything you need to <span className="text-[var(--color-primary)]">succeed</span>
                </h2>
                <p className="text-[1.2rem] text-[var(--color-slate)] max-w-[600px] mx-auto leading-relaxed">
                    Whether you are a beginner learning to code or an expert preparing for an interview, Codebattle has the tools.
                </p>
            </div>

            <div className="grid gap-8 max-w-[1200px] mx-auto"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="glass-panel p-8 flex flex-col gap-4 bg-[rgba(31,40,51,0.4)]"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[rgba(230,57,70,0.1)] flex items-center justify-center">
                            {feature.icon}
                        </div>
                        <h3 className="text-2xl text-[var(--color-white)]">{feature.title}</h3>
                        <p className="text-[var(--color-slate)] leading-relaxed text-[0.95rem]">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
