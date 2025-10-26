"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppUser = {
  name?: string;
  email?: string;
  role?: "hr" | "employee";
  experienceYears?: number;
  location?: string;
  skills?: string[];
  education?: string[];
  toolsAndTechnologies?: string[];
  industryExperience?: string[];
  certifications?: string[];
  languages?: string[];
};

type UserContextValue = {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const refresh = async () => {
    try {
      const r = await fetch("/api/employee/me");
      if (!r.ok) return;
      const json = await r.json();
      const u = json?.user || null;
      setUser(u);
    } catch {}
  };

  useEffect(() => { void refresh(); }, []);

  const value = useMemo(() => ({ user, setUser, refresh }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}


