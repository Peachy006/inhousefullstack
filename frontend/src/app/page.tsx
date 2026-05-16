"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const RANKS = ["white", "grey", "yellow", "orange", "green"];

interface FighterRow {
    uid: string;
    name: string;
    rank: string;
    weight: string;
    age: string;
    boy: boolean;
}

function makeUid(): string {
    return Math.random().toString(36).slice(2);
}

function emptyFighter(): FighterRow {
    return { uid: makeUid(), name: "", rank: "white", weight: "", age: "", boy: true };
}

export default function SetupPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [fighters, setFighters] = useState<FighterRow[]>(() =>
        Array.from({ length: 4 }, emptyFighter)
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (localStorage.getItem("brackets")) {
            router.replace("/fightorder");
        } else if (localStorage.getItem("pendingBrackets")) {
            router.replace("/review");
        } else {
            setReady(true);
        }
    }, [router]);

    if (!ready) return null;

    const addFighter = () => setFighters(prev => [...prev, emptyFighter()]);

    const removeFighter = (uid: string) =>
        setFighters(prev => prev.filter(f => f.uid !== uid));

    const update = (uid: string, field: keyof Omit<FighterRow, "uid">, value: string | boolean) =>
        setFighters(prev => prev.map(f => f.uid === uid ? { ...f, [field]: value } : f));

    const handleFinish = async () => {
        setError(null);

        for (const f of fighters) {
            if (!f.name.trim()) { setError("All fighters must have a name."); return; }
            const w = parseFloat(f.weight);
            if (isNaN(w) || w <= 0) { setError(`"${f.name || "A fighter"}" has an invalid weight.`); return; }
            const a = parseInt(f.age);
            if (isNaN(a) || a <= 0) { setError(`"${f.name || "A fighter"}" has an invalid age.`); return; }
        }
        if (fighters.length < 4) { setError("At least 4 fighters are required to generate brackets."); return; }

        setLoading(true);
        try {
            const payload = fighters.map(f => ({
                name: f.name.trim(),
                rank: f.rank,
                weight: parseFloat(f.weight),
                age: parseInt(f.age),
                boy: f.boy,
            }));

            const res = await fetch("http://localhost:8080/api/brackets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Backend returned ${res.status}`);

            const data: Array<{ users: Array<{ name: string }> }> = await res.json();

            const pending = data.map((b, i) => ({
                id: `b${i + 1}`,
                name: `Bracket ${i + 1}`,
                fighters: b.users.map(u => u.name),
            }));

            localStorage.setItem("pendingBrackets", JSON.stringify(pending));
            router.push("/review");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to reach backend. Is the Spring Boot server running?");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen bg-[#2c2c2c] flex flex-col font-mono select-none">
            {/* Header */}
            <div className="px-8 py-5 border-b border-white/10 bg-[#222] flex items-center justify-between">
                <h1 className="text-white font-black text-xl tracking-[0.3em]">FIGHTER SETUP</h1>
                <span className="text-white/30 text-[10px] tracking-widest">
                    {fighters.length} FIGHTER{fighters.length !== 1 ? "S" : ""} ENTERED
                </span>
            </div>

            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-6 gap-4">
                {/* Column headers */}
                <div className="grid gap-3 px-1" style={{ gridTemplateColumns: "2fr 1.4fr 0.9fr 0.7fr 90px 36px" }}>
                    {["NAME", "RANK", "WEIGHT (lbs)", "AGE", "GENDER", ""].map((h, i) => (
                        <span key={i} className="text-white/25 text-[9px] tracking-widest font-bold">{h}</span>
                    ))}
                </div>

                {/* Fighter rows */}
                <div className="flex flex-col gap-2">
                    {fighters.map((f) => (
                        <div
                            key={f.uid}
                            className="grid gap-3 items-center"
                            style={{ gridTemplateColumns: "2fr 1.4fr 0.9fr 0.7fr 90px 36px" }}
                        >
                            <input
                                type="text"
                                value={f.name}
                                onChange={e => update(f.uid, "name", e.target.value)}
                                placeholder="Fighter name"
                                className="bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20"
                            />
                            <select
                                value={f.rank}
                                onChange={e => update(f.uid, "rank", e.target.value)}
                                className="bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                            >
                                {RANKS.map(r => <option key={r} value={r}>{r.split('')[0].toUpperCase() + r.slice(1)}</option>)}
                            </select>
                            <input
                                type="number"
                                value={f.weight}
                                onChange={e => update(f.uid, "weight", e.target.value)}
                                placeholder="0.0"
                                min="0"
                                step="0.1"
                                className="bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20"
                            />
                            <input
                                type="number"
                                value={f.age}
                                onChange={e => update(f.uid, "age", e.target.value)}
                                placeholder="0"
                                min="1"
                                step="1"
                                className="bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20"
                            />
                            <button
                                onClick={() => update(f.uid, "boy", !f.boy)}
                                className={`rounded px-2 py-2 text-[9px] font-black tracking-widest border transition-colors ${
                                    f.boy
                                        ? "bg-blue-900/40 border-blue-700/50 text-blue-300"
                                        : "bg-pink-900/40 border-pink-700/50 text-pink-300"
                                }`}
                            >
                                {f.boy ? "MALE" : "FEMALE"}
                            </button>
                            <button
                                onClick={() => removeFighter(f.uid)}
                                className="text-white/20 hover:text-red-400 text-xl font-bold transition-colors text-center leading-none"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addFighter}
                    className="self-start bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white text-[10px] tracking-widest px-4 py-2 rounded transition-colors mt-1"
                >
                    + ADD FIGHTER
                </button>

                <div className="flex-1" />

                {error && (
                    <div className="text-red-400 text-[11px] tracking-wider border border-red-900/50 bg-red-900/10 rounded px-4 py-3">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleFinish}
                    disabled={loading}
                    className="bg-[#2979ff] hover:bg-[#1a5fd4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm tracking-[0.3em] py-4 rounded-lg transition-colors"
                >
                    {loading ? "GENERATING BRACKETS..." : "FINISH"}
                </button>
            </div>
        </div>
    );
}
