import { NextResponse } from "next/server";
import { resourcesFindMany } from "@/lib/astra";

export async function GET() {
  try {
    const items = await resourcesFindMany();
    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    const msg = (e as Error)?.message || "Failed to list resources";
    if (process.env.NODE_ENV !== "production") console.error("/api/resources error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


