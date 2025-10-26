import { NextResponse } from "next/server";
import { usersFindOne, usersInsertOne } from "@/lib/astra";
import { hashPassword } from "@/lib/crypto";
import { signSession } from "@/lib/session";
import type { HRUser } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || body?.fullName || "").trim();
    const email = String(body?.email || "").toLowerCase().trim();
    const password = String(body?.password || "");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await usersFindOne({ email });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const doc: HRUser = {
      name,
      email,
      role: "hr",
      passwordHash,
      createdAt: now,
      updatedAt: now,
    } as HRUser;

    const { _id } = await usersInsertOne(doc as any);

    const token = signSession({ userId: _id, role: "hr", email, name });
    const res = NextResponse.json({ id: _id, role: "hr" }, { status: 201 });
    res.cookies.set("session", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch (e) {
    const msg = (e as Error)?.message || "Registration failed";
    if (process.env.NODE_ENV !== "production") console.error("/api/auth/register error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


