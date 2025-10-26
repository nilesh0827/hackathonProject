import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name || `upload_${Date.now()}`;

    // Extract text from the uploaded file
    let textContent = "";
    const isPdf = /\.pdf$/i.test(fileName) || file.type === "application/pdf";
    if (isPdf) {
      try {
        // Lazy import to avoid bundling when not needed
        // Support both default and commonjs export
        const mod: any = await import("pdf-parse");
        const pdfParse = mod?.default ?? mod;
        const result = await pdfParse(buffer);
        textContent = String(result?.text || "").trim();
      } catch (err) {
        return NextResponse.json(
          { error: `PDF parsing failed. Ensure 'pdf-parse' is installed. Details: ${(err as Error)?.message || err}` },
          { status: 500 }
        );
      }
    } else {
      // Assume text-like content
      textContent = buffer.toString("utf8").trim();
    }
    if (!textContent) return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });

    const cookieHeader = req.headers.get("cookie") || "";
    const token = /(?:^|;\s*)session=([^;]+)/.exec(cookieHeader)?.[1];
    const payload = verifySession(token);
    const sessionId = payload ? `user_${payload.userId}` : `hr_${Math.random().toString(36).slice(2)}`;

    const apiUrl = process.env.QA_API_URL || "https://hackathon-agentic.finconsgroup.com/api/v1/run/ea1cb5a4-1720-4a61-92b5-66d6c24a43f6";
    const apiKey = process.env.QA_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing QA_API_KEY env var" }, { status: 500 });

    const upstreamPayload = {
      output_type: "text",
      input_type: "text",
      tweaks: {
        "TextInput-qyIiT": {
          input_value: textContent,
        },
      },
      session_id: sessionId || "user_1",
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": apiKey,
    };

    const upstream = await fetch(apiUrl, { method: "POST", headers, body: JSON.stringify(upstreamPayload) });
    const text = await upstream.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!upstream.ok) return NextResponse.json({ error: data?.error || data?.detail || "Upstream error" }, { status: upstream.status });

    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    const msg = (e as Error)?.message || "Upload call failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


