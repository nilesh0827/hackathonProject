"use client";

import { useUser } from "@/lib/useUser";

export default function BrandLink() {
  const { user } = useUser();
  const href = !user ? "/" : user.role === "hr" ? "/hr" : "/employee";
  return (
    <a href={href} className="text-sm font-semibold">Onboarding Companion</a>
  );
}


