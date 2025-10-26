"use client";

import { useState } from "react";
import { useUser } from "@/lib/useUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChangePasswordPage() {
  const { refresh } = useUser();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    fetch("/api/employee/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "Failed");
        await refresh();
        window.location.href = "/employee/complete-profile";
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Set your password</CardTitle>
          <CardDescription>Please set a new password to continue onboarding.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">New password</label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="confirm" className="text-sm font-medium leading-none">Confirm password</label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {error ? <p className="text-sm text-red-600 dark:text-red-400 mr-auto">{error}</p> : null}
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save & Continue"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


