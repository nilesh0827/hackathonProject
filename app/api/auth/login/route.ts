import { NextResponse } from "next/server";
import { usersFindOne } from "@/lib/astra";
import { verifyPassword } from "@/lib/crypto";
import { signSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").toLowerCase().trim();
    const password = String(body?.password || "");
    if (!email || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

    const user = await usersFindOne({ email });
    if (!user?.passwordHash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signSession({ userId: user._id!, role: user.role, email: user.email, name: user.name });
    const isEmployee = user.role === "employee";
    const needsCompletion = isEmployee && (user.mustChangePassword === true);
    const res = NextResponse.json({ id: user._id, role: user.role, needsCompletion }, { status: 200 });
    res.cookies.set("session", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch (e) {
    const msg = (e as Error)?.message || "Login failed";
    if (process.env.NODE_ENV !== "production") console.error("/api/auth/login error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


