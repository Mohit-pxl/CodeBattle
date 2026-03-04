import React from 'react';

/* ── Generic skeleton block ───────────────────────────────────────────────── */
export function SkeletonBlock({ className = '' }) {
    return <div className={`skeleton ${className}`} />;
}

/* ── Problems list row skeleton ──────────────────────────────────────────── */
export function ProblemRowSkeleton() {
    return (
        <div className="flex items-center p-4 bg-[#111216] border border-white/5 rounded-xl gap-4">
            {/* status icon placeholder */}
            <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />

            {/* text info */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <SkeletonBlock className="h-5 w-3/5 rounded-md" />
                <div className="flex gap-2">
                    <SkeletonBlock className="h-4 w-14 rounded" />
                    <SkeletonBlock className="h-4 w-20 rounded" />
                    <SkeletonBlock className="h-4 w-16 rounded" />
                </div>
            </div>

            {/* chevron placeholder */}
            <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
        </div>
    );
}

/* ── Filters panel skeleton ──────────────────────────────────────────────── */
export function FiltersPanelSkeleton() {
    return (
        <div className="glass-panel p-6 flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
                {[80, 96, 100].map((w, i) => (
                    <SkeletonBlock key={i} className={`h-9 rounded-lg`} style={{ width: w }} />
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                {[70, 85, 65, 90, 75, 80].map((w, i) => (
                    <SkeletonBlock key={i} className="h-7 rounded-full" style={{ width: w }} />
                ))}
            </div>
        </div>
    );
}

/* ── Editor page skeleton ────────────────────────────────────────────────── */
export function EditorPageSkeleton() {
    return (
        <div className="flex h-screen pt-16 gap-0">
            {/* Left pane - problem statement */}
            <div className="w-[420px] flex-shrink-0 border-r border-white/10 p-6 flex flex-col gap-5 overflow-hidden">
                <SkeletonBlock className="h-8 w-2/3 rounded-md" />
                <div className="flex gap-2">
                    <SkeletonBlock className="h-6 w-16 rounded" />
                    <SkeletonBlock className="h-6 w-20 rounded" />
                </div>
                <div className="flex flex-col gap-3 mt-2">
                    {[100, 90, 80, 95, 70, 85, 60].map((pct, i) => (
                        <SkeletonBlock key={i} className="h-4 rounded" style={{ width: `${pct}%` }} />
                    ))}
                </div>
                <div className="mt-4 flex flex-col gap-3">
                    <SkeletonBlock className="h-24 w-full rounded-lg" />
                    <SkeletonBlock className="h-24 w-full rounded-lg" />
                </div>
            </div>

            {/* Right pane - editor */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                    <SkeletonBlock className="h-8 w-28 rounded-md" />
                    <SkeletonBlock className="h-8 w-20 rounded-md" />
                    <div className="ml-auto flex gap-2">
                        <SkeletonBlock className="h-8 w-20 rounded-md" />
                        <SkeletonBlock className="h-8 w-20 rounded-md" />
                    </div>
                </div>
                {/* Code area */}
                <div className="flex-1 p-4 flex flex-col gap-2">
                    {[60, 80, 55, 70, 40, 90, 65, 50, 75, 45].map((pct, i) => (
                        <SkeletonBlock key={i} className="h-4 rounded" style={{ width: `${pct}%`, marginLeft: i > 1 && i < 7 ? 32 : 0 }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Landing page hero skeleton ──────────────────────────────────────────── */
export function LandingPageSkeleton() {
    return (
        <div className="flex flex-wrap min-h-screen pt-20 items-center px-[8%] gap-12">
            <div className="flex-[1_1_400px] flex flex-col gap-6">
                <SkeletonBlock className="h-20 w-4/5 rounded-xl" />
                <SkeletonBlock className="h-20 w-3/5 rounded-xl" />
                <SkeletonBlock className="h-5 w-full rounded" />
                <SkeletonBlock className="h-5 w-5/6 rounded" />
                <SkeletonBlock className="h-28 w-full rounded-2xl mt-2" />
            </div>
            <div className="flex-[1_1_400px]">
                <SkeletonBlock className="h-80 w-full rounded-2xl" />
            </div>
        </div>
    );
}
