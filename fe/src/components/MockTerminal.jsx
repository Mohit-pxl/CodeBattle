import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const codeLines = [
    [{ text: "#include ", color: "#569cd6" }, { text: "<iostream>", color: "#ce9178" }],
    [{ text: "#include ", color: "#569cd6" }, { text: "<vector>", color: "#ce9178" }],
    [{ text: "", color: "" }],
    [{ text: "using namespace ", color: "#569cd6" }, { text: "std;", color: "#d4d4d4" }],
    [{ text: "", color: "" }],
    [{ text: "class ", color: "#569cd6" }, { text: "Solution ", color: "#4ec9b0" }, { text: "{", color: "#d4d4d4" }],
    [{ text: "public:", color: "#569cd6" }],
    [{ text: "    int ", color: "#569cd6" }, { text: "maxProfit", color: "#dcdcaa" }, { text: "(", color: "#d4d4d4" }, { text: "vector", color: "#4ec9b0" }, { text: "<", color: "#d4d4d4" }, { text: "int", color: "#569cd6" }, { text: ">& ", color: "#d4d4d4" }, { text: "prices", color: "#9cdcfe" }, { text: ") {", color: "#d4d4d4" }],
    [{ text: "        // Initialize variables to track minimum price and maximum profit", color: "#6a9955" }],
    [{ text: "        int ", color: "#569cd6" }, { text: "min_price ", color: "#9cdcfe" }, { text: "= ", color: "#d4d4d4" }, { text: "INT_MAX", color: "#b5cea8" }, { text: ";", color: "#d4d4d4" }],
    [{ text: "        int ", color: "#569cd6" }, { text: "max_profit ", color: "#9cdcfe" }, { text: "= ", color: "#d4d4d4" }, { text: "0", color: "#b5cea8" }, { text: ";", color: "#d4d4d4" }],
    [{ text: "", color: "" }],
    [{ text: "        for ", color: "#c586c0" }, { text: "(", color: "#d4d4d4" }, { text: "int ", color: "#569cd6" }, { text: "price ", color: "#9cdcfe" }, { text: ": ", color: "#d4d4d4" }, { text: "prices", color: "#9cdcfe" }, { text: ") {", color: "#d4d4d4" }],
    [{ text: "            min_price ", color: "#9cdcfe" }, { text: "= ", color: "#d4d4d4" }, { text: "min", color: "#dcdcaa" }, { text: "(", color: "#d4d4d4" }, { text: "min_price", color: "#9cdcfe" }, { text: ", ", color: "#d4d4d4" }, { text: "price", color: "#9cdcfe" }, { text: ");", color: "#d4d4d4" }],
    [{ text: "            max_profit ", color: "#9cdcfe" }, { text: "= ", color: "#d4d4d4" }, { text: "max", color: "#dcdcaa" }, { text: "(", color: "#d4d4d4" }, { text: "max_profit", color: "#9cdcfe" }, { text: ", ", color: "#d4d4d4" }, { text: "price ", color: "#9cdcfe" }, { text: "- ", color: "#d4d4d4" }, { text: "min_price", color: "#9cdcfe" }, { text: ");", color: "#d4d4d4" }],
    [{ text: "        }", color: "#d4d4d4" }],
    [{ text: "", color: "" }],
    [{ text: "        return ", color: "#c586c0" }, { text: "max_profit", color: "#9cdcfe" }, { text: ";", color: "#d4d4d4" }],
    [{ text: "    }", color: "#d4d4d4" }],
    [{ text: "};", color: "#d4d4d4" }]
];

export default function MockTerminal() {
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        const totalChars = codeLines.reduce(
            (sum, line) => sum + line.reduce((lSum, token) => lSum + token.text.length, 0) + 1,
            0
        );

        if (charCount < totalChars) {
            const timer = setTimeout(() => {
                setCharCount(prev => prev + 1);
            }, Math.random() * 20 + 10);
            return () => clearTimeout(timer);
        } else {
            const resetTimer = setTimeout(() => {
                setCharCount(0);
            }, 6000);
            return () => clearTimeout(resetTimer);
        }
    }, [charCount]);

    let charsToRender = charCount;
    const renderedLines = [];

    for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i];
        const renderedTokens = [];

        if (line.every(t => t.text === "")) {
            if (charsToRender >= 0) {
                renderedLines.push(<br key={i} />);
                charsToRender -= 1;
            }
            if (charsToRender < 0) break;
            continue;
        }

        let tokenAdded = false;
        for (let j = 0; j < line.length; j++) {
            const token = line[j];
            if (charsToRender >= token.text.length) {
                renderedTokens.push(<span key={j} style={{ color: token.color }}>{token.text}</span>);
                charsToRender -= token.text.length;
                tokenAdded = true;
            } else if (charsToRender > 0) {
                renderedTokens.push(<span key={j} style={{ color: token.color }}>{token.text.substring(0, charsToRender)}</span>);
                charsToRender = 0;
                tokenAdded = true;
            }
        }

        if (tokenAdded) {
            renderedLines.push(<div key={i}>{renderedTokens}</div>);
        }

        charsToRender -= 1;

        if (charsToRender < 0) break;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                scale: 1.02,
                rotateX: 2,
                rotateY: -2,
                boxShadow: '0 25px 50px rgba(230, 57, 70, 0.15)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-panel w-full max-w-[600px] mx-auto overflow-hidden rounded-xl"
            style={{
                background: 'rgba(11, 12, 16, 0.8)',
                border: '1px solid rgba(197, 198, 199, 0.1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                transformPerspective: 1000,
            }}
        >
            {/* Terminal Header */}
            <div
                className="flex items-center px-4 py-3 border-b border-[rgba(197,198,199,0.1)]"
                style={{ background: 'rgba(31, 40, 51, 0.6)' }}
            >
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="mx-auto text-[var(--color-slate)] text-[0.85rem] font-medium">
                    solution.cpp
                </div>
            </div>

            {/* Terminal Body */}
            <div
                className="p-6 font-mono text-[0.95rem] leading-relaxed text-[#d4d4d4] whitespace-pre-wrap min-h-[440px]"
            >
                {renderedLines}
                <div className="flex items-center mt-1">
                    <span style={{ color: '#569cd6' }}>~</span>
                    <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="ml-2 text-[var(--color-primary)]"
                    >
                        █
                    </motion.span>
                </div>
            </div>
        </motion.div>
    );
}
