"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Tutorial = { _id?: string; title: string; description?: string; url?: string; content?: string };

export default function HRAddTutorialsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Tutorial[]>([]);

  async function load() {
    try {
      const r = await fetch("/api/hr/tutorials");
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Failed to load");
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    }
  }

  useEffect(() => { void load(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const r = await fetch("/api/hr/tutorials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, url, content }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Failed to add");
      setTitle(""); setDescription(""); setUrl(""); setContent("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to add");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Add Tutorials</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="t-title" className="text-sm font-medium leading-none">Title</label>
              <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <label htmlFor="t-desc" className="text-sm font-medium leading-none">Description</label>
              <Textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="t-url" className="text-sm font-medium leading-none">External URL (optional)</label>
              <Input id="t-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <label htmlFor="t-content" className="text-sm font-medium leading-none">Content (or use URL)</label>
              <Textarea id="t-content" value={content} onChange={(e) => setContent(e.target.value)} className="h-48" />
            </div>
            <div className="flex justify-end gap-2">
              {error ? <p className="text-sm text-red-600 dark:text-red-400 mr-auto">{error}</p> : null}
              <Button type="submit" disabled={loading || !title || (!url && !content)}>{loading ? "Saving..." : "Add Tutorial"}</Button>
            </div>
          </form>

          <div className="grid gap-2">
            <div className="text-sm font-medium leading-none">Existing Tutorials</div>
            <div className="rounded-md border divide-y">
              {items.length ? items.map((it) => (
                <div key={it._id || it.title} className="p-3">
                  <div className="text-sm font-medium">{it.title}</div>
                  {it.description ? <div className="text-xs text-zinc-600 dark:text-zinc-400">{it.description}</div> : null}
                  {it.url ? <a href={it.url} target="_blank" rel="noopener noreferrer" className="text-xs underline">Open link</a> : null}
                  {it.content ? <pre className="text-xs whitespace-pre-wrap mt-2">{it.content}</pre> : null}
                </div>
              )) : (
                <div className="p-3 text-sm text-zinc-600 dark:text-zinc-400">No tutorials yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


