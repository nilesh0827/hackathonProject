"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export default function QAPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hi! Ask me anything about your company docs and policies.",
    createdAt: Date.now(),
  }]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed, createdAt: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const controller = new AbortController();
    fetch("/api/qa/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: trimmed, name: "User", sessionId: "user_1" }),
      signal: controller.signal,
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "Failed");
        const d = json?.data;
        let content = "";
        try {
          // Prefer: outputs[0].outputs[0].results.message.text
          content =
            d?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
            d?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message ||
            d?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
            "";
        } catch {}
        if (!content) content = JSON.stringify(d ?? {}, null, 2);
        const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content, createdAt: Date.now() };
        setMessages((prev) => [...prev, assistantMsg]);
      })
      .catch((e) => {
        const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: `Error: ${e.message}`, createdAt: Date.now() };
        setMessages((prev) => [...prev, assistantMsg]);
      });
  }

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  return (
    <div className="min-h-[calc(100vh-60px)] p-4 md:p-8 flex items-stretch justify-center">
      <Card className="w-full max-w-3xl flex flex-col">
        <CardHeader>
          <CardTitle>Knowledge Base Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div ref={listRef} className="h-[50vh] overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[80%] rounded-lg bg-zinc-900 text-zinc-50 px-3 py-2 text-sm"
                        : "max-w-[80%] rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm"
                    }
                  >
                    {m.role === "assistant"
                      ? (() => {
                          const cleaned = m.content
                            .replace(/^[-\s]*\*\*Answer\*\*:\s*/i, "")
                            .replace(/^\*\*Answer\*\*:\s*/i, "");
                          const lines = cleaned
                            .split(/\n+/)
                            .map((l) => l.trim())
                            .filter(Boolean);
                          const bulletLines = lines.filter((l) => l.startsWith("- ") || l.startsWith("* "));
                          if (bulletLines.length > 0) {
                            return (
                              <ul className="list-disc pl-5 space-y-1">
                                {bulletLines.map((b, i) => (
                                  <li key={i}>{b.replace(/^[-*]\s+/, "")}</li>
                                ))}
                              </ul>
                            );
                          }
                          return lines.map((line, idx) => (
                            <p key={idx} className="whitespace-pre-wrap">
                              {line}
                            </p>
                          ));
                        })()
                      : m.content.split("\n").map((line, idx) => (
                          <p key={idx} className="whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="question" className="text-sm font-medium">Ask a question</label>
            <Textarea
              id="question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. What is the leave policy for new hires?"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  sendMessage();
                }
              }}
            />
            <div className="flex justify-end">
              <Button onClick={sendMessage} disabled={!canSend}>Send</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


