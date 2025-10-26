import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question: string = String(body?.question || "");

    // Derive name and sessionId from session/cookies if possible
    const cookieHeader = req.headers.get("cookie") || "";
    const sessionToken = /(?:^|;\s*)session=([^;]+)/.exec(cookieHeader)?.[1];
    const sessionPayload = verifySession(sessionToken);
    const name = sessionPayload?.name || "User";

    let sessionId = /(?:^|;\s*)qa_session_id=([^;]+)/.exec(cookieHeader)?.[1] || "";
    if (!sessionId) {
      sessionId = sessionPayload ? `user_${sessionPayload.userId}` : `anon_${Math.random().toString(36).slice(2)}`;
    }

    if (!question) return NextResponse.json({ error: "Missing question" }, { status: 400 });

    const apiUrl = process.env.QA_API_URL || "https://hackathon-agentic.finconsgroup.com/api/v1/run/28044139-1000-4297-8f9c-a32a13300995";
    const apiKey = process.env.QA_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing QA_API_KEY env var" }, { status: 500 });

    const payload = {
      output_type: "chat",
      input_type: "chat",
      tweaks: {
        "ChatInput-Y06DV": { input_value: question },
        "TextInput-M5NNo": { input_value: name || "User" },
        "TextInput-YdFde": { input_value: "1" },
      },
      session_id: sessionId,
    };

    // Send key strictly as x-api-key header
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": apiKey,
    };

    const upstream = await fetch(apiUrl, { method: "POST", headers, body: JSON.stringify(payload) });
    const text = await upstream.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!upstream.ok) return NextResponse.json({ error: data?.error || data?.detail || "Upstream error" }, { status: upstream.status });

    const res = NextResponse.json({ data }, { status: 200 });
    // Persist session id for anonymous users
    if (!/qa_session_id=/.test(cookieHeader)) {
      res.cookies.set("qa_session_id", sessionId, { path: "/", sameSite: "lax" });
    }
    return res;
  } catch (e) {
    const msg = (e as Error)?.message || "QA proxy failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


