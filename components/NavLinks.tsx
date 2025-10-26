"use client";

import { useUser } from "@/lib/useUser";

export default function NavLinks() {
  const { user } = useUser();
  return (
    <nav className="flex gap-4 text-sm">
      <a href="/" className="hover:underline">Home</a>
      <a href="/profile" className="hover:underline">Profile</a>
      {user ? (
        <form method="post" action="/api/auth/logout">
          <button className="hover:underline" type="submit">Logout</button>
        </form>
      ) : (
        <a href="/login" className="hover:underline">Login</a>
      )}
    </nav>
  );
}


