"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/useUser";

type SafeUser = {
  name?: string;
  role?: string;
  experienceYears?: number;
  skills?: string[];
  toolsAndTechnologies?: string[];
  industryExperience?: string[];
};

export default function TutorialsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const inputJson = useMemo(() => {
    const payload = {
      name: user?.name || "",
      position: (user?.role === "employee" ? "Software Developer" : user?.role) || "Employee",
      role: user?.role || "Employee",
      experience: user?.experienceYears ?? 0,
      skillSet: user?.skills || [],
      toolsAndTechnologies: user?.toolsAndTechnologies || [],
      industryExperience: user?.industryExperience || [],
    };
    return JSON.stringify(payload, null, 2);
  }, [user]);

  async function callTutorials() {
    try {
      setLoading(true);
      setError(null);
      setResponseText("");
      const endpoint = process.env.NEXT_PUBLIC_TUTORIALS_API_URL || "https://hackathon-agentic.finconsgroup.com/api/v1/run/ddd944c7-ca36-4a13-83f9-94e2cbeabba1";
      const apiKey = process.env.NEXT_PUBLIC_QA_API_KEY || process.env.QA_API_KEY || "";
      const payload = {
        output_type: "chat",
        input_type: "text",
        tweaks: {
          "TextInput-A36k2": {
            input_value: inputJson,
          },
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
      if (!r.ok) throw new Error(json?.error || "Tutorials API failed");
      let content = "";
      try {
        content =
          json?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
          json?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message ||
          json?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
          "";
      } catch {}
      if (!content) content = JSON.stringify(json ?? {}, null, 2);
      setResponseText(content);
    } catch (e: any) {
      setError(e?.message || "Failed to call tutorials API");
    } finally {
      setLoading(false);
    }
  }

  function renderWithLinks(text: string) {
    const urlRegex = /https?:\/\/[^\s)]+/g;
    const lines = text.split(/\n/);
    const elements: React.ReactNode[] = [];
    lines.forEach((line, lineIdx) => {
      let match: RegExpExecArray | null;
      let lastIndex = 0;
      while ((match = urlRegex.exec(line)) !== null) {
        const [url] = match;
        const start = match.index;
        if (start > lastIndex) {
          elements.push(<span key={`t-${lineIdx}-${lastIndex}`}>{line.slice(lastIndex, start)}</span>);
        }
        elements.push(
          <a
            key={`a-${lineIdx}-${start}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 dark:text-blue-400"
          >
            {url}
          </a>
        );
        lastIndex = start + url.length;
      }
      if (lastIndex < line.length) {
        elements.push(<span key={`t-${lineIdx}-end`}>{line.slice(lastIndex)}</span>);
      }
      if (lineIdx < lines.length - 1) elements.push(<br key={`br-${lineIdx}`} />);
    });
    return elements;
  }

  return (
    <div className="min-h-[calc(100vh-60px)] p-4 md:p-8 flex items-stretch justify-center">
      <Card className="w-full max-w-3xl flex flex-col">
        <CardHeader>
          <CardTitle>Personalized Tutorials</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Intentionally not printing user data */}
          <div className="flex gap-2">
            <Button onClick={callTutorials} disabled={loading}>{loading ? "Generating..." : "Generate Tutorials"}</Button>
            {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          </div>
          {responseText ? (
            <div className="rounded-md border p-3 h-64 overflow-auto whitespace-pre-wrap text-sm">
              {renderWithLinks(responseText)}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

 
