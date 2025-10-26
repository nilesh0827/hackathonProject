import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { tutorialsInsertOne, tutorialsFindMany } from "@/lib/astra";

export async function GET() {
  try {
    const items = await tutorialsFindMany();
    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    const msg = (e as Error)?.message || "Failed to list tutorials";
    if (process.env.NODE_ENV !== "production") console.error("/api/hr/tutorials GET error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getSessionUser();
    if (!user || user.role !== "hr") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim() || undefined;
    const url = String(body?.url || "").trim() || undefined;
    const content = String(body?.content || "").trim() || undefined;
    if (!title || (!url && !content)) return NextResponse.json({ error: "Provide title and either URL or content" }, { status: 400 });
    const now = new Date().toISOString();
    await tutorialsInsertOne({ title, description, url, content, createdAt: now, createdBy: (user as any).email });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    const msg = (e as Error)?.message || "Failed to add tutorial";
    if (process.env.NODE_ENV !== "production") console.error("/api/hr/tutorials POST error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


