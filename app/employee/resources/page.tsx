"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Resource = {
  _id?: string;
  title: string;
  description?: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
  createdBy?: string;
};

export default function EmployeeResourcesPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/resources");
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error || "Failed to load");
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      }
    })();
  }, []);

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Company Resources</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <div className="rounded-md border divide-y">
            {items.length ? items.map((it) => (
              <a key={it._id || it.url} href={it.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <div>
                  <div className="text-sm font-medium">{it.title}</div>
                  {it.description ? <div className="text-xs text-zinc-600 dark:text-zinc-400">{it.description}</div> : null}
                </div>
                <div className="text-xs text-zinc-500">{Math.round(it.size / 1024)} KB</div>
              </a>
            )) : (
              <div className="p-3 text-sm text-zinc-600 dark:text-zinc-400">No resources available yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


