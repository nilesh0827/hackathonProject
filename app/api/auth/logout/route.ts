import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const redirectUrl = new URL("/", req.url);
  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set("session", "", { path: "/", httpOnly: true, maxAge: 0 });
  return res;
}


