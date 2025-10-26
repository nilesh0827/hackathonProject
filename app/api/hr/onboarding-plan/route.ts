import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { usersUpdateOne } from "@/lib/astra";

export async function POST(req: Request) {
  try {
    const { user } = await getSessionUser();
    if (!user || user.role !== "hr") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const email = String(body?.email || "").toLowerCase().trim();
    const plan = String(body?.plan || "").trim();
    if (!email || !plan) return NextResponse.json({ error: "Missing email or plan" }, { status: 400 });

    const now = new Date().toISOString();
    await usersUpdateOne({ email }, { onboardingPlan: { plan, approvedAt: now, approvedBy: user.email }, updatedAt: now });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const msg = (e as Error)?.message || "Failed to save onboarding plan";
    if (process.env.NODE_ENV !== "production") console.error("/api/hr/onboarding-plan error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


