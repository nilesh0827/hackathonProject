import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Remove sensitive fields
    const { passwordHash, ...safe } = (user as any) || {};
    return NextResponse.json({ user: safe }, { status: 200 });
  } catch (e) {
    const msg = (e as Error)?.message || "Failed to fetch profile";
    if (process.env.NODE_ENV !== "production") console.error("/api/employee/me error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


