"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type UserLite = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  joiningDate?: string;
  position?: string;
};

export default function OnboardingPlanPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<UserLite[]>([]);
  const [selected, setSelected] = useState<UserLite | null>(null);
  const [goals, setGoals] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  async function searchUsers() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const r = await fetch(`/api/hr/users?q=${encodeURIComponent(query.trim())}`);
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Search failed");
      setResults(Array.isArray(json.users) ? json.users : []);
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  }

  const selectedSummary = useMemo(() => {
    if (!selected) return "";
    const date = selected.joiningDate ? new Date(selected.joiningDate).toDateString() : "N/A";
    const pos = selected.position ? ` • ${selected.position}` : "";
    return `${selected.name || ""} (${selected.email || ""})${pos} - Start: ${date}`;
  }, [selected]);

  async function createPlan() {
    if (!selected || !goals.trim()) return;
    try {
      setCreating(true);
      setError(null);
      setApiResponse("");
      const endpoint = process.env.NEXT_PUBLIC_ONBOARDING_API_URL || "https://hackathon-agentic.finconsgroup.com/api/v1/run/f3d9fceb-2beb-4558-8052-f23f80611b45";
      const apiKey = process.env.NEXT_PUBLIC_QA_API_KEY || process.env.QA_API_KEY || "";
      const payload = {
        output_type: "chat",
        input_type: "text",
        tweaks: {
          "TextInput-11LvN": { input_value: selected.name || "" },
          "TextInput-k0UJ8": { input_value: goals },
          "TextInput-2Wq1f": { input_value: selected.position || "" },
          "TextInput-OJOhn": { input_value: selected.joiningDate || "" },
        },
        session_id: "user_1",
      } as const;

      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Onboarding plan API failed");
      let content = "";
      try {
        content =
          json?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
          json?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message ||
          json?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
          "";
      } catch {}
      if (!content) content = JSON.stringify(json ?? {}, null, 2);
      setApiResponse(content);
    } catch (e: any) {
      setError(e?.message || "Failed to create plan");
    } finally {
      setCreating(false);
    }
  }

  async function approvePlan() {
    if (!selected || !apiResponse.trim()) return;
    try {
      setSaving(true);
      setSavedMsg("");
      setError(null);
      const r = await fetch("/api/hr/onboarding-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected.email, plan: apiResponse }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Failed to save plan");
      setSavedMsg("Plan approved and saved.");
    } catch (e: any) {
      setError(e?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Create Onboarding Plan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <label htmlFor="q" className="text-sm font-medium leading-none">Search Employee (name or email)</label>
            <div className="flex gap-2">
              <Input id="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="john or john@company.com" />
              <Button type="button" onClick={searchUsers} disabled={searching}>{searching ? "Searching..." : "Search"}</Button>
            </div>
            {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
            {results.length ? (
              <div className="rounded-md border divide-y">
                {results.map((u) => (
                  <button
                    key={(u as any)._id || u.email}
                    className={`w-full text-left p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 ${selected?.email === u.email ? "bg-zinc-50 dark:bg-zinc-900" : ""}`}
                    onClick={() => setSelected(u)}
                  >
                    <div className="text-sm font-medium">{u.name || u.email}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">{u.email} {u.joiningDate ? `• Start: ${u.joiningDate}` : ""}</div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">Selected Employee</label>
            <Input readOnly value={selectedSummary} placeholder="No employee selected" />
          </div>

          <div className="grid gap-2">
            <label htmlFor="goals" className="text-sm font-medium leading-none">Onboarding Goals</label>
            <Textarea id="goals" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder={"List goals or paste a paragraph of the plan"} />
          </div>

          <div className="flex justify-end gap-2">
            <div className="mr-auto">
              {savedMsg ? <p className="text-sm text-green-700 dark:text-green-400">{savedMsg}</p> : null}
            </div>
            <Button type="button" onClick={createPlan} disabled={!selected || !goals.trim() || creating}>{creating ? "Creating..." : "Create Plan"}</Button>
            <Button type="button" variant="secondary" onClick={approvePlan} disabled={!selected || !apiResponse.trim() || saving}>{saving ? "Saving..." : "Approve & Save"}</Button>
          </div>

          {apiResponse ? (
            <div className="grid gap-2">
              <label htmlFor="planText" className="text-sm font-medium leading-none">Onboarding Plan (editable)</label>
              <Textarea id="planText" value={apiResponse} onChange={(e) => setApiResponse(e.target.value)} className="h-64" />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}


