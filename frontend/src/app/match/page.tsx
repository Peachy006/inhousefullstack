"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type WinMethod = "POINTS" | "SUBMISSION" | "DECISION" | null;

interface Fighter {
    name: string;
    points: number;
}

interface SavedModalProps {
    onNextMatch: () => void;
    onFightOrder: () => void;
    onBracket: () => void;
    onClose: () => void;
}

function SavedModal({ onNextMatch, onFightOrder, onBracket, onClose }: SavedModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#2a2a2a] border border-white/10 rounded-2xl p-10 flex flex-col items-center gap-5 w-[420px] shadow-2xl">
                <div className="w-16 h-16 rounded-full border-2 border-green-400 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-white text-2xl font-bold tracking-wide">Saved</p>
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={onNextMatch}
                        className="w-full bg-[#2979ff] hover:bg-[#1a5fd4] text-white font-bold py-3 rounded-lg tracking-widest text-sm transition-colors"
                    >
                        GO TO NEXT MATCH
                    </button>
                    <button
                        onClick={onFightOrder}
                        className="w-full bg-[#444] hover:bg-[#555] text-white font-semibold py-3 rounded-lg tracking-widest text-sm transition-colors"
                    >
                        BACK TO FIGHTORDER
                    </button>
                    <button
                        onClick={onBracket}
                        className="w-full bg-[#444] hover:bg-[#555] text-white font-semibold py-3 rounded-lg tracking-widest text-sm transition-colors"
                    >
                        BACK TO BRACKET
                    </button>
                    <button onClick={onClose} className="text-white/40 hover:text-white/70 text-sm mt-1 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function WinByPanel({
    selectedWinner,
    fighter,
    onSelect,
}: {
    selectedWinner: WinMethod;
    fighter: Fighter;
    onSelect: (method: WinMethod) => void;
}) {
    const methods: WinMethod[] = ["POINTS", "SUBMISSION", "DECISION"];

    return (
        <div className="border border-white/10 rounded overflow-hidden" style={{ width: 320 }}>
            <div className="text-center text-white font-black text-[9px] tracking-[0.3em] py-1 bg-[#a93226]">
                WON BY
            </div>
            <div className="bg-[#1e1e1e] flex">
                {methods.map((m) => (
                    <button
                        key={m}
                        onClick={() => onSelect(selectedWinner === m ? null : m)}
                        className={`flex-1 text-[9px] tracking-widest font-bold py-2 transition-all border-r border-white/10 last:border-r-0 ${
                            selectedWinner === m ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>
        </div>
    );
}

function MatchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const matchId = searchParams.get("matchId") || "unknown";
    const bracketName = searchParams.get("bracketName") || "";
    const redName = searchParams.get("red") || "FIGHTER RED";
    const blueName = searchParams.get("blue") || "FIGHTER BLUE";

    const [matchTime, setMatchTime] = useState(300);
    const [isRunning, setIsRunning] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [winnerMethod, setWinnerMethod] = useState<{ red: WinMethod; blue: WinMethod }>({
        red: null,
        blue: null,
    });

    const [fighters, setFighters] = useState<{ red: Fighter; blue: Fighter }>({
        red: { name: redName, points: 0 },
        blue: { name: blueName, points: 0 },
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const tick = useCallback(() => {
        setMatchTime((t) => {
            if (t <= 0) {
                setIsRunning(false);
                return 0;
            }
            return t - 1;
        });
    }, []);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(tick, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, tick]);

    const fmtTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const adjustScore = (side: "red" | "blue", delta: number) => {
        setFighters((prev) => ({
            ...prev,
            [side]: { ...prev[side], points: Math.max(0, prev[side].points + delta) },
        }));
    };

    const adjustTime = (delta: number) => setMatchTime((t) => Math.max(0, t + delta));
    const resetTimer = () => {
        setIsRunning(false);
        setMatchTime(300);
    };

    const getWinnerLabel = (side: "red" | "blue") => {
        const method = winnerMethod[side];
        const other = side === "red" ? "blue" : "red";
        if (!method || winnerMethod[other]) return null;
        return `WINNER BY ${method}`;
    };

    const saveAndGoToFightOrder = async () => {
        const winner =
            winnerMethod.red && !winnerMethod.blue ? "red"
            : winnerMethod.blue && !winnerMethod.red ? "blue"
            : null;
        const method = winner ? winnerMethod[winner] : null;

        await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                matchId,
                result: { finished: true, winner, winMethod: method },
            }),
        });

        router.push("/fightorder");
    };

    return (
        <div className="min-h-screen w-screen bg-[#2c2c2c] flex flex-col font-mono select-none overflow-hidden">
            {showSaved && (
                <SavedModal
                    onNextMatch={() => setShowSaved(false)}
                    onFightOrder={saveAndGoToFightOrder}
                    onBracket={() => setShowSaved(false)}
                    onClose={() => setShowSaved(false)}
                />
            )}

            <div className="flex flex-1">
                {/* Left panel */}
                <div className="flex-1 flex flex-col">
                    {/* Red fighter */}
                    <div className="flex-1 flex flex-col justify-center px-10 py-8 border-b border-white/10 bg-[#2c2c2c]">
                        <span
                            className="text-white font-black tracking-wider leading-none"
                            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }}
                        >
                            {fighters.red.name}
                        </span>
                        <div className="flex gap-2 text-white/30 text-xs tracking-[0.2em] mt-2 mb-6" />

                        {getWinnerLabel("red") && (
                            <div className="inline-block bg-[#b7950b] text-white text-[10px] tracking-[0.2em] font-black px-3 py-1 rounded self-start mb-3">
                                {getWinnerLabel("red")}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <span className="text-white/25 text-[10px] tracking-widest">POINTS</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => adjustScore("red", -1)}
                                    className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                                >
                                    −
                                </button>
                                <span className="text-white text-3xl font-black w-12 text-center tabular-nums">
                                    {fighters.red.points}
                                </span>
                                <button
                                    onClick={() => adjustScore("red", 1)}
                                    className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                                >
                                    +
                                </button>
                            </div>
                            <WinByPanel
                                selectedWinner={winnerMethod.red}
                                fighter={fighters.red}
                                onSelect={(m) => setWinnerMethod((w) => ({ ...w, red: m }))}
                            />
                        </div>
                    </div>

                    {/* Blue fighter */}
                    <div className="flex-1 flex flex-col justify-center px-10 py-8 bg-[#303030]">
                        <span
                            className="text-white font-black tracking-wider leading-none"
                            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }}
                        >
                            {fighters.blue.name}
                        </span>
                        <div className="flex gap-2 text-white/30 text-xs tracking-[0.2em] mt-2 mb-6" />

                        {getWinnerLabel("blue") && (
                            <div className="inline-block bg-[#b7950b] text-white text-[10px] tracking-[0.2em] font-black px-3 py-1 rounded self-start mb-3">
                                {getWinnerLabel("blue")}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <span className="text-white/25 text-[10px] tracking-widest">POINTS</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => adjustScore("blue", -1)}
                                    className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                                >
                                    −
                                </button>
                                <span className="text-white text-3xl font-black w-12 text-center tabular-nums">
                                    {fighters.blue.points}
                                </span>
                                <button
                                    onClick={() => adjustScore("blue", 1)}
                                    className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                                >
                                    +
                                </button>
                            </div>
                            <WinByPanel
                                selectedWinner={winnerMethod.blue}
                                fighter={fighters.blue}
                                onSelect={(m) => setWinnerMethod((w) => ({ ...w, blue: m }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Right score panel */}
                <div className="flex flex-col w-72">
                    <div className="flex-1 flex items-center justify-center bg-[#8b0000]">
                        <span className="text-white font-black text-[130px] leading-none tabular-nums">
                            {fighters.red.points}
                        </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-[#003580]">
                        <span className="text-white font-black text-[130px] leading-none tabular-nums">
                            {fighters.blue.points}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="bg-[#222] border-t border-white/10 flex items-center justify-between px-6 py-3 gap-6">
                <div className="flex items-center gap-4 shrink-0">
                    <div className="bg-white text-black font-black text-base px-4 py-2 rounded tracking-wider">
                        {matchId.toUpperCase()}
                    </div>
                    <div className="text-white/40 text-[11px] tracking-widest">{bracketName}</div>
                </div>

                <div className="flex gap-2 shrink-0">
                    <button className="bg-white/10 hover:bg-white/15 text-white text-[10px] tracking-widest px-3 py-2 rounded transition-colors">
                        UNDO
                    </button>
                    <button className="bg-white/10 hover:bg-white/15 text-white text-[10px] tracking-widest px-3 py-2 rounded transition-colors">
                        SWITCH SIDES
                    </button>
                    <button
                        onClick={() => setShowSaved(true)}
                        className="bg-[#1a3a1a] hover:bg-[#2a4a2a] text-green-400 text-[10px] tracking-widest px-4 py-2 rounded border border-green-900 transition-colors"
                    >
                        SAVE
                    </button>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => adjustTime(-30)}
                        className="text-white/35 hover:text-white text-xs transition-colors w-8 text-center"
                    >
                        −30
                    </button>
                    <button
                        onClick={() => adjustTime(-1)}
                        className="text-white/35 hover:text-white text-xs transition-colors w-6 text-center"
                    >
                        −1
                    </button>

                    <button
                        onClick={() => setIsRunning((r) => !r)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0 ${
                            isRunning ? "bg-red-700 hover:bg-red-800" : "bg-white/10 hover:bg-white/20"
                        }`}
                    >
                        {isRunning ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    <span
                        className={`font-black text-5xl tracking-widest tabular-nums leading-none ${
                            matchTime === 0 ? "text-red-400" : "text-[#b7950b]"
                        }`}
                    >
                        {fmtTime(matchTime)}
                    </span>

                    <button
                        onClick={() => adjustTime(1)}
                        className="text-white/35 hover:text-white text-xs transition-colors w-6 text-center"
                    >
                        +1
                    </button>
                    <button
                        onClick={() => adjustTime(30)}
                        className="text-white/35 hover:text-white text-xs transition-colors w-8 text-center"
                    >
                        +30
                    </button>
                    <button
                        onClick={resetTimer}
                        className="text-white/35 hover:text-white text-sm transition-colors ml-1"
                    >
                        ↺
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MatchPage() {
    return (
        <Suspense>
            <MatchContent />
        </Suspense>
    );
}
