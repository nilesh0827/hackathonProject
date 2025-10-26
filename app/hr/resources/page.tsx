"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

export default function HRResourcesPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Resource[]>([]);

  async function load() {
    try {
      const r = await fetch("/api/resources");
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Failed to load");
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    }
  }

  useEffect(() => { void load(); }, []);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    try {
      setLoading(true);
      setError(null);
      const form = new FormData();
      form.append("file", file);
      if (title) form.append("title", title);
      if (description) form.append("description", description);
      const r = await fetch("/api/resources/upload", { method: "POST", body: form });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Upload failed");
      setTitle("");
      setDescription("");
      setFile(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>HR Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={onUpload} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="res-title">Title</label>
              <Input id="res-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="res-desc">Description</label>
              <Textarea id="res-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="res-file">File</label>
              <Input id="res-file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex justify-end gap-2">
              {error ? <p className="text-sm text-red-600 dark:text-red-400 mr-auto">{error}</p> : null}
              <Button type="submit" disabled={loading || !file}>{loading ? "Uploading..." : "Upload"}</Button>
            </div>
          </form>

          <div className="grid gap-2">
            <div className="text-sm font-medium leading-none">All Resources</div>
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
                <div className="p-3 text-sm text-zinc-600 dark:text-zinc-400">No resources uploaded yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


