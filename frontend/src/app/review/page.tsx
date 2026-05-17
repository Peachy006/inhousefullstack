"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Match {
    id: string;
    red: string;
    blue: string;
}

interface ReviewBracket {
    id: string;
    name: string;
    fighters: string[];
}

interface SavedBracket extends ReviewBracket {
    matches: Match[];
}

function shuffleNoConsecutive(matches: Match[]): Match[] {
    const arr = [...matches];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    for (let i = 1; i < arr.length; i++) {
        const prev = arr[i - 1];
        const sharesFighter = (m: Match) =>
            m.red === prev.red || m.red === prev.blue ||
            m.blue === prev.red || m.blue === prev.blue;
        if (sharesFighter(arr[i])) {
            const swapIdx = arr.findIndex((m, idx) => idx > i && !sharesFighter(m));
            if (swapIdx !== -1) [arr[i], arr[swapIdx]] = [arr[swapIdx], arr[i]];
        }
    }
    return arr;
}

function generateRoundRobin(bracketId: string, fighters: string[]): Match[] {
    const matches: Match[] = [];
    for (let i = 0; i < fighters.length; i++) {
        for (let j = i + 1; j < fighters.length; j++) {
            matches.push({ id: `${bracketId}_${i}_${j}`, red: fighters[i], blue: fighters[j] });
        }
    }
    return shuffleNoConsecutive(matches);
}

export default function ReviewPage() {
    const router = useRouter();
    const [brackets, setBrackets] = useState<ReviewBracket[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [dragging, setDragging] = useState<{ fighter: string; fromId: string } | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [showAddFighter, setShowAddFighter] = useState(false);
    const [newFighterName, setNewFighterName] = useState("");
    const [loaded, setLoaded] = useState(false);
    const dragCounters = useRef<Record<string, number>>({});

    useEffect(() => {
        const pending = localStorage.getItem("pendingBrackets");
        if (pending) {
            setBrackets(JSON.parse(pending));
            setLoaded(true);
        } else if (localStorage.getItem("brackets")) {
            router.replace("/fightorder");
        } else {
            router.replace("/");
        }
    }, [router]);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem("pendingBrackets", JSON.stringify(brackets));
        }
    }, [brackets, loaded]);

    if (!loaded) return null;

    const moveFighter = (fighter: string, fromId: string, toId: string) => {
        if (fromId === toId) return;
        setBrackets(prev => prev.map(b => {
            if (b.id === fromId) return { ...b, fighters: b.fighters.filter(f => f !== fighter) };
            if (b.id === toId) return { ...b, fighters: [...b.fighters, fighter] };
            return b;
        }));
    };

    const handleDragStart = (fighter: string, fromId: string) => {
        setDragging({ fighter, fromId });
    };

    const handleDragEnter = (id: string) => {
        dragCounters.current[id] = (dragCounters.current[id] || 0) + 1;
        setDragOverId(id);
    };

    const handleDragLeave = (id: string) => {
        dragCounters.current[id] = (dragCounters.current[id] || 0) - 1;
        if ((dragCounters.current[id] || 0) <= 0) {
            dragCounters.current[id] = 0;
            setDragOverId(prev => (prev === id ? null : prev));
        }
    };

    const handleDrop = (toId: string) => {
        if (dragging) moveFighter(dragging.fighter, dragging.fromId, toId);
        setDragging(null);
        setDragOverId(null);
        dragCounters.current = {};
    };

    const handleDragEnd = () => {
        setDragging(null);
        setDragOverId(null);
        dragCounters.current = {};
    };

    const handleConfirm = () => {
        const nonEmpty = brackets.filter(b => b.fighters.length >= 2);
        const saved: SavedBracket[] = nonEmpty.map(b => ({
            ...b,
            matches: generateRoundRobin(b.id, b.fighters),
        }));
        localStorage.removeItem("pendingBrackets");
        localStorage.setItem("brackets", JSON.stringify(saved));
        router.push("/fightorder");
    };

    const handleBack = () => {
        localStorage.removeItem("pendingBrackets");
        router.push("/");
    };

    const handleAddEmptyBracket = () => {
        const newId = `bracket_custom_${Date.now()}`;
        setBrackets(prev => [...prev, { id: newId, name: `Bracket ${prev.length + 1}`, fighters: [] }]);
    };

    const handleAddFighter = () => {
        const name = newFighterName.trim();
        if (!name || brackets.length === 0) return;
        setBrackets(prev => prev.map((b, i) =>
            i === 0 ? { ...b, fighters: [...b.fighters, name] } : b
        ));
        setNewFighterName("");
        setShowAddFighter(false);
    };

    const totalFighters = brackets.reduce((sum, b) => sum + b.fighters.length, 0);
    const hasWarning = brackets.some(b => b.fighters.length > 0 && b.fighters.length < 4);

    return (
        <div className="min-h-screen w-screen bg-[#2c2c2c] flex flex-col font-mono select-none">
            {/* Header */}
            <div className="px-8 py-5 border-b border-white/10 bg-[#222] flex items-center justify-between gap-6">
                <div>
                    <h1 className="text-white font-black text-xl tracking-[0.3em]">BRACKET REVIEW</h1>
                    <p className="text-white/25 text-[10px] tracking-widest mt-1">
                        DRAG FIGHTERS BETWEEN BRACKETS · CLICK NAME TO RENAME · {totalFighters} FIGHTERS · {brackets.length} BRACKETS
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={handleBack}
                        className="bg-white/10 hover:bg-white/15 text-white text-[10px] tracking-widest px-4 py-2 rounded border border-white/10 transition-colors"
                    >
                        BACK TO SETUP
                    </button>
                    <button
                        onClick={handleAddEmptyBracket}
                        className="bg-white/10 hover:bg-white/15 text-white text-[10px] tracking-widest px-4 py-2 rounded border border-white/10 transition-colors"
                    >
                        + EMPTY BRACKET
                    </button>
                    <button
                        onClick={() => setShowAddFighter(true)}
                        className="bg-white/10 hover:bg-white/15 text-white text-[10px] tracking-widest px-4 py-2 rounded border border-white/10 transition-colors"
                    >
                        + ADD FIGHTER
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-[#2979ff] hover:bg-[#1a5fd4] text-white font-black text-[11px] tracking-[0.2em] px-6 py-2 rounded transition-colors"
                    >
                        CONFIRM BRACKETS
                    </button>
                </div>
            </div>

            {hasWarning && (
                <div className="mx-6 mt-4 text-yellow-400 text-[11px] tracking-wider border border-yellow-900/50 bg-yellow-900/10 rounded px-4 py-3">
                    One or more brackets have fewer than 4 fighters — consider adjusting before confirming.
                </div>
            )}

            {/* Add Fighter Modal */}
            {showAddFighter && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setShowAddFighter(false)}
                >
                    <div
                        className="bg-[#1e1e1e] border border-white/10 rounded-lg p-6 w-full max-w-sm flex flex-col gap-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-white font-black text-[13px] tracking-[0.25em]">ADD FIGHTER</h2>
                        <p className="text-white/30 text-[10px] tracking-wider">
                            Fighter will be added to <span className="text-white/60">{brackets[0]?.name}</span>
                        </p>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Fighter name"
                            value={newFighterName}
                            onChange={e => setNewFighterName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleAddFighter(); if (e.key === "Escape") setShowAddFighter(false); }}
                            className="bg-[#2c2c2c] border border-white/15 text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-white/40 placeholder-white/20"
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowAddFighter(false)}
                                className="bg-white/10 hover:bg-white/15 text-white text-[10px] tracking-widest px-4 py-2 rounded border border-white/10 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleAddFighter}
                                disabled={!newFighterName.trim()}
                                className="bg-[#2979ff] hover:bg-[#1a5fd4] disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-[10px] tracking-[0.2em] px-5 py-2 rounded transition-colors"
                            >
                                ADD
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bracket cards */}
            <div className="flex-1 p-6 flex flex-wrap gap-4 items-start content-start">
                {brackets.map(b => {
                    const isDropTarget = dragOverId === b.id && dragging?.fromId !== b.id;
                    const count = b.fighters.length;
                    const tooFew = count > 0 && count < 4;

                    return (
                        <div
                            key={b.id}
                            className={`flex flex-col rounded-lg border overflow-hidden transition-all min-w-[200px] flex-1 max-w-[300px] ${
                                isDropTarget
                                    ? "border-[#2979ff] shadow-[0_0_0_1px_#2979ff]"
                                    : "border-white/10"
                            }`}
                            style={{ background: isDropTarget ? "rgba(41,121,255,0.06)" : "#1e1e1e" }}
                            onDragOver={e => e.preventDefault()}
                            onDragEnter={() => handleDragEnter(b.id)}
                            onDragLeave={() => handleDragLeave(b.id)}
                            onDrop={() => handleDrop(b.id)}
                        >
                            {/* Card header */}
                            <div className="px-4 py-3 bg-[#222] border-b border-white/10 flex items-center justify-between gap-2 min-h-[44px]">
                                {editingId === b.id ? (
                                    <input
                                        autoFocus
                                        value={b.name}
                                        onChange={e =>
                                            setBrackets(prev =>
                                                prev.map(x => x.id === b.id ? { ...x, name: e.target.value } : x)
                                            )
                                        }
                                        onBlur={() => setEditingId(null)}
                                        onKeyDown={e => { if (e.key === "Enter") setEditingId(null); }}
                                        className="bg-transparent border-b border-white/30 text-white text-[11px] tracking-widest font-black focus:outline-none w-full"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setEditingId(b.id)}
                                        className="text-white text-[11px] tracking-widest font-black hover:text-white/60 transition-colors text-left truncate"
                                        title="Click to rename"
                                    >
                                        {b.name}
                                    </button>
                                )}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-[9px] tracking-widest font-bold ${tooFew ? "text-yellow-400" : "text-white/25"}`}>
                                        {count} fighter{count !== 1 ? "s" : ""}{tooFew ? " ⚠" : ""}
                                    </span>
                                    <button
                                        onClick={() => setBrackets(prev => prev.filter(x => x.id !== b.id))}
                                        className="text-white/20 hover:text-red-400 text-xl font-bold transition-colors leading-none"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Fighter list */}
                            <div className="flex flex-col divide-y divide-white/5 min-h-[56px]">
                                {count === 0 ? (
                                    <div className="flex-1 flex items-center justify-center py-5 text-white/15 text-[10px] tracking-widest">
                                        DROP HERE
                                    </div>
                                ) : (
                                    b.fighters.map(fighter => {
                                        const isBeingDragged =
                                            dragging?.fighter === fighter && dragging?.fromId === b.id;
                                        return (
                                            <div
                                                key={fighter}
                                                draggable
                                                onDragStart={() => handleDragStart(fighter, b.id)}
                                                onDragEnd={handleDragEnd}
                                                className={`flex items-center gap-3 px-4 py-2.5 cursor-grab active:cursor-grabbing transition-opacity select-none ${
                                                    isBeingDragged ? "opacity-25" : "hover:bg-white/5"
                                                }`}
                                            >
                                                <span className="text-white/20 text-xs pointer-events-none">⠿</span>
                                                <span className="text-white text-sm font-medium pointer-events-none flex-1">
                                                    {fighter}
                                                </span>
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setBrackets(prev => prev.map(x =>
                                                            x.id === b.id ? { ...x, fighters: x.fighters.filter(f => f !== fighter) } : x
                                                        ));
                                                    }}
                                                    onMouseDown={e => e.stopPropagation()}
                                                    className="text-white/20 hover:text-red-400 text-xl font-bold transition-colors leading-none cursor-pointer"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
