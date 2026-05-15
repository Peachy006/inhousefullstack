import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const FILE = join(process.cwd(), "results.json");

function readResults(): Record<string, unknown> {
    try {
        return JSON.parse(readFileSync(FILE, "utf-8"));
    } catch {
        return {};
    }
}

export async function GET() {
    return Response.json(readResults());
}

export async function POST(request: Request) {
    const { matchId, result } = await request.json();
    const results = readResults();
    results[matchId] = result;
    writeFileSync(FILE, JSON.stringify(results, null, 2));
    return Response.json({ ok: true });
}
