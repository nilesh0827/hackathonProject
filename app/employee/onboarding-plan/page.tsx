"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeOnboardingPlanPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/employee/onboarding-plan");
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error || "Failed to load plan");
        setPlan(json?.plan?.plan || null);
      } catch (e: any) {
        setError(e?.message || "Failed to load plan");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Your Onboarding Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm">Loading...</p> : null}
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          {!loading && !error ? (
            plan ? (
              <div className="rounded-md border p-3 whitespace-pre-wrap text-sm">{plan}</div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No onboarding plan available yet.</p>
            )
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}


