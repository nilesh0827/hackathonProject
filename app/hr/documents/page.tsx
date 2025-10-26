"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HRDocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [qaResponse, setQaResponse] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);
  const [isCallingQa, setIsCallingQa] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function extractPdfText(selectedFile: File) {
    setIsParsing(true);
    setError(null);
    setExtractedText("");
    try {
      const buffer = await selectedFile.arrayBuffer();
      // @ts-ignore - module has no bundled types; we provide ambient or ignore
      const pdfjsLib: any = await import("pdfjs-dist/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      let fullText = "";
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => ("str" in item ? item.str : (item as any).toString?.() ?? ""))
          .join(" ");
        fullText += (pageNum > 1 ? "\n\n" : "") + pageText;
      }
      setExtractedText(fullText.trim());
      // Fire QA API call right after extraction
      void callQaApi(fullText.trim(), selectedFile);
    } catch (err: any) {
      setError(err?.message || "Failed to parse PDF");
    } finally {
      setIsParsing(false);
    }
  }

  function fileToBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const commaIdx = result.indexOf(",");
        resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
      };
      reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
      reader.readAsDataURL(f);
    });
  }

  async function callQaApi(text: string, originalFile: File | null) {
    setIsCallingQa(true);
    setQaResponse("");
    try {
      let filesPayload: Array<{ name: string; data: string; mime_type?: string }> = [];
      if (originalFile) {
        const base64 = await fileToBase64(originalFile);
        filesPayload.push({ name: originalFile.name, data: base64, mime_type: originalFile.type || "application/pdf" });
      }

      const payload = {
        output_type: "text",
        input_type: "text",
        tweaks: {
          "TextInput-qyIiT": {
            input_value: text,
          },
        },
        session_id: "user_1",
        files: filesPayload,
      } as const;

      const endpoint = process.env.NEXT_PUBLIC_QA_API_URL || "https://hackathon-agentic.finconsgroup.com/api/v1/run/ea1cb5a4-1720-4a61-92b5-66d6c24a43f6";
      const apiKey = process.env.NEXT_PUBLIC_QA_API_KEY || process.env.QA_API_KEY || "";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "QA API failed");
      }
      alert("Document registered successfully.");
    } catch (e: any) {
      setQaResponse("");
      setError(e?.message || "QA API call failed");
    } finally {
      setIsCallingQa(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setExtractedText("");
    setQaResponse("");
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("Only PDF parsing is supported right now.");
      return;
    }
    void extractPdfText(file);
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Add Document</CardTitle>
          <CardDescription>HR only. Provide document content and choose a type.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="document" className="text-sm font-medium leading-none">Document</label>
              <Input
                id="document"
                type="file"
                accept=".pdf"
                onChange={onFileChange}
                required
              />
              {file ? (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Selected: {file.name} ({file.size} bytes)</p>
              ) : null}
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isParsing || isCallingQa}>{isParsing ? "Extracting..." : isCallingQa ? "Saving doc..." : "Submit"}</Button>
            </div>

            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : null}

            {/* No extracted text or QA response shown for HR flow */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


