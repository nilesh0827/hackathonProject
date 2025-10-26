import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resourcesInsertOne } from "@/lib/astra";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { user } = await getSessionUser();
    if (!user || user.role !== "hr") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const title = String(form.get("title") || "").trim() || (file?.name || "Untitled");
    const description = String(form.get("description") || "").trim() || undefined;
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", "resources");
    await fs.mkdir(uploadDir, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const outPath = path.join(uploadDir, safeName);
    await fs.writeFile(outPath, buffer);
    const url = `/resources/${safeName}`;

    const now = new Date().toISOString();
    await resourcesInsertOne({
      title,
      description,
      url,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      createdAt: now,
      createdBy: (user as any).email,
    });

    return NextResponse.json({ ok: true, url }, { status: 201 });
  } catch (e) {
    const msg = (e as Error)?.message || "Upload failed";
    if (process.env.NODE_ENV !== "production") console.error("/api/resources/upload error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


