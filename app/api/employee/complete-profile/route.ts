"use client";

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { usersUpdateOne } from "@/lib/astra";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const { user } = await getSessionUser();
    if (!user || user.role !== "employee")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const password = String(body?.password || "").trim();

    const fullName = String(
      body?.full_name || body?.fullName || user.name || ""
    ).trim();
    const experienceYears =
      body?.experience_years != null
        ? Number(body.experience_years)
        : undefined;
    const location = String(body?.location || "").trim() || undefined;
    const position = String(body?.position || "").trim() || undefined;
    const skills = Array.isArray(body?.skills)
      ? body.skills.map((s: any) => String(s).trim()).filter(Boolean)
      : undefined;
    const education = Array.isArray(body?.education)
      ? body.education.map((s: any) => String(s).trim()).filter(Boolean)
      : undefined;
    const toolsAndTechnologies = Array.isArray(body?.tools_and_technologies)
      ? body.tools_and_technologies
          .map((s: any) => String(s).trim())
          .filter(Boolean)
      : undefined;
    const industryExperience = Array.isArray(body?.industry_experience)
      ? body.industry_experience
          .map((s: any) => String(s).trim())
          .filter(Boolean)
      : undefined;
    const certifications = Array.isArray(body?.certifications)
      ? body.certifications.map((s: any) => String(s).trim()).filter(Boolean)
      : undefined;
    const languages = Array.isArray(body?.languages)
      ? body.languages.map((s: any) => String(s).trim()).filter(Boolean)
      : undefined;

    const update: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (fullName) update.name = fullName;
    if (location) update.location = location;
    if (position) update.position = position;
    if (experienceYears != null && !Number.isNaN(experienceYears))
      update.experienceYears = experienceYears;
    if (skills) update.skills = skills;
    if (education) update.education = education;
    if (toolsAndTechnologies)
      update.toolsAndTechnologies = toolsAndTechnologies;
    if (industryExperience) update.industryExperience = industryExperience;
    if (certifications) update.certifications = certifications;
    if (languages) update.languages = languages;

    if (password) {
      update.passwordHash = await hashPassword(password);
      update.mustChangePassword = false;
    }

    await usersUpdateOne({ email: user.email }, update);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const msg = (e as Error)?.message || "Failed to complete profile";
    if (process.env.NODE_ENV !== "production")
      console.error("/api/employee/complete-profile error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
