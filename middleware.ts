import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionEdge } from "@/lib/session-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPaths = ["/hr", "/employee", "/profile"];
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("session")?.value;
  // Edge runtime: use WebCrypto compatible verifier
  const payload = await verifySessionEdge(token);
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/hr") && payload.role !== "hr") {
    const url = req.nextUrl.clone();
    url.pathname = "/employee";
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/employee") && payload.role !== "employee") {
    const url = req.nextUrl.clone();
    url.pathname = "/hr";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hr/:path*", "/employee/:path*", "/profile"],
};


