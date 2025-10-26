import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { usersFindOne } from "@/lib/astra";
import type { AnyUser } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { user } = await getSessionUser();
    if (!user || user.role !== "hr") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const qRaw = (searchParams.get("q") || "").trim();
    const qLower = qRaw.toLowerCase();
    // Astra Data API does not support complex queries here in our helper; for demo
    // we just try exact match by email first, then by name if provided
    let results: AnyUser[] = [] as any;
    if (qRaw.includes("@")) {
      // emails are normalized to lowercase in our app
      const u = await usersFindOne({ email: qLower });
      if (u) results = [u as AnyUser];
    } else if (qRaw) {
      // match exact name (case-sensitive, as stored)
      const u = await usersFindOne({ name: qRaw });
      if (u) results = [u as AnyUser];
    }
    const safe = results.map((u) => {
      const { passwordHash, ...rest } = (u as any) || {};
      return rest;
    });
    return NextResponse.json({ users: safe }, { status: 200 });
  } catch (e) {
    const msg = (e as Error)?.message || "Failed to search users";
    if (process.env.NODE_ENV !== "production") console.error("/api/hr/users error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


