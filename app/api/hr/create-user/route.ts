import { NextResponse } from "next/server";
import { usersFindOne, usersInsertOne } from "@/lib/astra";
import { hashPassword } from "@/lib/crypto";
import type { EmployeeUser } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || body?.fullName || "").trim();
    const email = String(body?.email || "").toLowerCase().trim();
    const department = String(body?.department || "").trim() || undefined;
    const position = String(body?.position || "").trim() || undefined;
    const role: "employee" = "employee";
    const joiningDate = body?.joiningDate ? String(body.joiningDate) : undefined;
    const experienceYears = body?.experienceYears != null ? Number(body.experienceYears) : undefined;
    const tempPassword = String(body?.password || body?.tempPassword || "");

    if (!name || !email) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const existing = await usersFindOne({ email });
    if (existing) return NextResponse.json({ error: "User already exists" }, { status: 409 });

    const passwordHash = tempPassword ? await hashPassword(tempPassword) : undefined;
    const now = new Date().toISOString();
    const doc: EmployeeUser = {
      name,
      email,
      role,
      passwordHash,
      department,
      position,
      joiningDate,
      experienceYears,
      createdAt: now,
      updatedAt: now,
      // Force password change on first login
      // @ts-ignore - dynamic field for employee
      mustChangePassword: true,
    };
    const { _id } = await usersInsertOne(doc as any);
    return NextResponse.json({ id: _id }, { status: 201 });
  } catch (e) {
    const msg = (e as Error)?.message || "Create user failed";
    if (process.env.NODE_ENV !== "production") console.error("/api/hr/create-user error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


