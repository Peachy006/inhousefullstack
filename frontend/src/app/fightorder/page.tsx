"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type WinMethod = "POINTS" | "SUBMISSION" | "DECISION" | null;

interface Match {
    id: string;
    red: string;
    blue: string;
}

interface Bracket {
    id: string;
    name: string;
    fighters: string[];
    matches: Match[];
}

interface MatchResult {
    finished: boolean;
    winner: "red" | "blue" | null;
    winMethod: WinMethod;
}

function shuffleNoConsecutive(matches: Match[]): Match[] {
    // Fisher-Yates shuffle
    const arr = [...matches];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    // Greedy pass: if consecutive matches share a fighter, swap with the
    // earliest later match that doesn't conflict with the previous match
    for (let i = 1; i < arr.length; i++) {
        const prev = arr[i - 1];
        const sharesFighter = (m: Match) =>
            m.red === prev.red || m.red === prev.blue ||
            m.blue === prev.red || m.blue === prev.blue;

        if (sharesFighter(arr[i])) {
            const swapIdx = arr.findIndex((m, idx) => idx > i && !sharesFighter(m));
            if (swapIdx !== -1) {
                [arr[i], arr[swapIdx]] = [arr[swapIdx], arr[i]];
            }
            // if no valid swap exists (unavoidable conflict), leave it in place
        }
    }

    return arr;
}

function generateRoundRobin(bracketId: string, fighters: string[]): Match[] {
    const matches: Match[] = [];
    for (let i = 0; i < fighters.length; i++) {
        for (let j = i + 1; j < fighters.length; j++) {
            matches.push({
                id: `${bracketId}_${i}_${j}`,
                red: fighters[i],
                blue: fighters[j],
            });
        }
    }
    return shuffleNoConsecutive(matches);
}

function parseJSON(text: string): Bracket[] {
    const data = JSON.parse(text);
    return data.brackets.map((b: { id: string; name: string; fighters: string[] }) => ({
        ...b,
        matches: generateRoundRobin(b.id, b.fighters),
    }));
}


export default function FightOrder() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [brackets, setBrackets] = useState<Bracket[]>([]);
    const [openBrackets, setOpenBrackets] = useState<Record<string, boolean>>({});
    const [finishedMatches, setFinishedMatches] = useState<Record<string, MatchResult>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/results")
            .then((r) => r.json())
            .then((data) => setFinishedMatches(data))
            .catch(() => {});

        const storedBrackets = localStorage.getItem("brackets");
        if (storedBrackets) {
            setBrackets(JSON.parse(storedBrackets));
            return;
        }

        // Auto-load from public/brackets.json
        fetch("/brackets.json")
            .then((r) => {
                if (!r.ok) throw new Error();
                return r.text();
            })
            .then((text) => {
                const parsed = parseJSON(text);
                setBrackets(parsed);
                localStorage.setItem("brackets", JSON.stringify(parsed));
            })
            .catch(() => {/* no file found, show empty state */});
    }, []);

    const handleFile = (file: File) => {
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsed = parseJSON(text);
                setBrackets(parsed);
                localStorage.setItem("brackets", JSON.stringify(parsed));
            } catch {
                setError("Failed to parse file — check the format and try again.");
            }
        };
        reader.readAsText(file);
    };

    const toggleBracket = (id: string) => {
        setOpenBrackets((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const goToMatch = (bracket: Bracket, match: Match) => {
        const params = new URLSearchParams({
            matchId: match.id,
            bracketName: bracket.name,
            red: match.red,
            blue: match.blue,
        });
        router.push(`/match?${params.toString()}`);
    };

    return (
        <div className="min-h-screen w-screen bg-[#2c2c2c] flex flex-col font-mono select-none">
            {/* Header */}
            <div className="px-8 py-5 border-b border-white/10 bg-[#222] flex items-center justify-between">
                <h1 className="text-white font-black text-xl tracking-[0.3em]">FIGHT ORDER</h1>
                <div className="flex items-center gap-3">
                    {error && (
                        <span className="text-red-400 text-[10px] tracking-widest">{error}</span>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                            e.target.value = "";
                        }}
                    />
                    <button
                        onClick={() => {
                            localStorage.removeItem("brackets");
                            router.push("/");
                        }}
                        className="bg-white/10 hover:bg-white/15 text-white text-[10px] tracking-widest px-4 py-2 rounded border border-white/10 transition-colors"
                    >
                        NEW SESSION
                    </button>
                    <button
                        onClick={() => {
                            fetch("/brackets.json")
                                .then((r) => {
                                    if (!r.ok) throw new Error();
                                    return r.text();
                                })
                                .then((text) => {
                                    setError(null);
                                    const parsed = parseJSON(text);
                                    setBrackets(parsed);
                                    localStorage.setItem("brackets", JSON.stringify(parsed));
                                })
                                .catch(() => setError("No brackets.json found in public/"));
                        }}
                        className="bg-white/10 hover:bg-white/15 text-white text-[10px] tracking-widest px-4 py-2 rounded border border-white/10 transition-colors"
                    >
                        RELOAD FILE
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/10 hover:bg-white/15 text-white text-[10px] tracking-widest px-4 py-2 rounded border border-white/10 transition-colors"
                    >
                        UPLOAD FILE
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {brackets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-8">
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                        <svg
                            className="w-7 h-7 text-white/20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 7h18M3 12h18M3 17h18"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white/50 text-sm tracking-widest mb-2">NO BRACKETS LOADED</p>
                        <p className="text-white/25 text-xs tracking-wider">
                            Load a JSON file to generate all matches
                        </p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#2979ff] hover:bg-[#1a5fd4] text-white font-bold text-[11px] tracking-widest px-6 py-3 rounded-lg transition-colors"
                    >
                        LOAD BRACKETS FILE
                    </button>
                    <div className="border border-white/10 rounded-lg p-4 text-left text-[10px] text-white/25 tracking-wider leading-relaxed max-w-sm">
                        <p className="text-white/40 font-bold mb-2">JSON FORMAT</p>
                        <p>{'{ "brackets": [{ "id": "b1", "name": "...", "fighters": ["..."] }] }'}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col p-6 gap-3 max-w-4xl mx-auto w-full">
                    {brackets.map((bracket) => {
                        const isOpen = openBrackets[bracket.id];
                        const doneCount = bracket.matches.filter(
                            (m) => finishedMatches[m.id]?.finished
                        ).length;
                        const allDone = doneCount === bracket.matches.length;
                        const someDone = doneCount > 0 && !allDone;

                        return (
                            <div
                                key={bracket.id}
                                className="border border-white/10 rounded-lg overflow-hidden"
                            >
                                {/* Bracket header */}
                                <button
                                    onClick={() => toggleBracket(bracket.id)}
                                    className="w-full flex items-center justify-between px-6 py-4 bg-[#1e1e1e] hover:bg-[#252525] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                allDone
                                                    ? "bg-green-400"
                                                    : someDone
                                                    ? "bg-yellow-400"
                                                    : "bg-white/20"
                                            }`}
                                        />
                                        <span className="text-white font-bold text-[11px] tracking-[0.2em]">
                                            {bracket.name}
                                        </span>
                                        <span className="text-white/20 text-[9px] tracking-widest">
                                            {bracket.fighters.length} FIGHTERS · {bracket.matches.length} MATCHES
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <span className="text-white/30 text-[10px] tracking-widest">
                                            {doneCount}/{bracket.matches.length} DONE
                                        </span>
                                        <svg
                                            className={`w-4 h-4 text-white/30 transition-transform duration-200 ${
                                                isOpen ? "rotate-180" : ""
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </button>

                                {/* Match list */}
                                {isOpen && (
                                    <div className="divide-y divide-white/5">
                                        {bracket.matches.map((match) => {
                                            const result = finishedMatches[match.id];
                                            const isDone = result?.finished;

                                            return (
                                                <button
                                                    key={match.id}
                                                    onClick={() => goToMatch(bracket, match)}
                                                    className="w-full flex items-center justify-between px-8 py-3 bg-[#282828] hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={`text-[9px] tracking-widest font-black px-2 py-0.5 rounded border ${
                                                                isDone
                                                                    ? "bg-green-900/50 text-green-400 border-green-800"
                                                                    : "bg-white/5 text-white/30 border-white/10"
                                                            }`}
                                                        >
                                                            {isDone ? "FINISHED" : "PENDING"}
                                                        </span>
                                                        <span className="text-white/80 text-sm font-bold">
                                                            {match.red}
                                                        </span>
                                                        <span className="text-white/25 text-[10px] tracking-widest">
                                                            VS
                                                        </span>
                                                        <span className="text-white/80 text-sm font-bold">
                                                            {match.blue}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                                        {isDone && result.winner && (
                                                            <span className="text-[9px] tracking-widest text-yellow-400/80 font-bold">
                                                                W:{" "}
                                                                {result.winner === "red"
                                                                    ? match.red
                                                                    : match.blue}{" "}
                                                                · {result.winMethod}
                                                            </span>
                                                        )}
                                                        <svg
                                                            className="w-4 h-4 text-white/15"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
