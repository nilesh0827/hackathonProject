import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await getSessionUser();
    if (!user || user.role !== "employee") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const plan = (user as any)?.onboardingPlan || null;
    return NextResponse.json({ plan }, { status: 200 });
  } catch (e) {
    const msg = (e as Error)?.message || "Failed to fetch onboarding plan";
    if (process.env.NODE_ENV !== "production") console.error("/api/employee/onboarding-plan error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


