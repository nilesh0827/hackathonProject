"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CompleteProfilePage() {
  const { refresh } = useUser();
  const [fullName, setFullName] = useState("");
  const [experienceYears, setExperienceYears] = useState<string>("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [toolsAndTechnologies, setToolsAndTechnologies] = useState<string>("");
  const [industryExperience, setIndustryExperience] = useState<string>("");
  const [certifications, setCertifications] = useState<string>("");
  const [languages, setLanguages] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parserResponse, setParserResponse] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/employee/me");
        if (!r.ok) return;
        const { user } = await r.json();
        if (!user) return;
        setFullName(user.name || "");
        setExperienceYears(user.experienceYears != null ? String(user.experienceYears) : "");
        setLocation(user.location || "");
        setSkills(Array.isArray(user.skills) ? user.skills.join(", ") : "");
        if (Array.isArray(user.education)) {
          const lines = user.education.map((item: any) => {
            if (typeof item === "string") return item.trim();
            if (item && typeof item === "object") {
              const degree = (item.degree || item.title || "").toString().trim();
              const inst = (item.institution || item.school || "").toString().trim();
              const dur = (item.duration || item.year || "").toString().trim();
              const score = (item.cgpa || item.percentage || "").toString().trim();
              const parts = [degree, inst ? `- ${inst}` : "", dur ? `(${dur})` : "", score ? `- ${score}` : ""].filter(Boolean);
              return parts.join(" ").trim();
            }
            return "";
          }).filter(Boolean);
          setEducation(lines.join("\n"));
        } else {
          setEducation("");
        }
        setToolsAndTechnologies(Array.isArray(user.toolsAndTechnologies) ? user.toolsAndTechnologies.join(", ") : "");
        if (Array.isArray(user.industryExperience)) {
          const lines = user.industryExperience.map((item: any) => {
            if (typeof item === "string") return item.trim();
            if (item && typeof item === "object") {
              const role = (item.role || item.title || item.position || "").toString().trim();
              const company = (item.company || item.organization || item.employer || "").toString().trim();
              const duration = (item.duration || (() => {
                const from = (item.from || item.start || "").toString().trim();
                const to = (item.to || item.end || "").toString().trim();
                return from || to ? `${from}${from && to ? " - " : ""}${to}` : "";
              })()).toString().trim();
              const parts = [role, company ? `at ${company}` : "", duration ? `(${duration})` : ""].filter(Boolean);
              return parts.join(" ").trim();
            }
            return "";
          }).filter(Boolean);
          setIndustryExperience(lines.join("\n"));
        } else {
          setIndustryExperience("");
        }
        setCertifications(Array.isArray(user.certifications) ? user.certifications.join("\n") : "");
        setLanguages(Array.isArray(user.languages) ? user.languages.join(", ") : "");
      } catch {}
    })();
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    fetch("/api/employee/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        experience_years: experienceYears ? Number(experienceYears) : undefined,
        location,
        skills: skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        education: education ? education.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        tools_and_technologies: toolsAndTechnologies ? toolsAndTechnologies.split(",").map((s) => s.trim()).filter(Boolean) : [],
        industry_experience: industryExperience ? industryExperience.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        certifications: certifications ? certifications.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        languages: languages ? languages.split(",").map((s) => s.trim()).filter(Boolean) : [],
      }),
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "Failed");
        await refresh();
        window.location.href = "/employee";
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function parseResumeAndAutofill() {
    if (!resumeFile) {
      alert("Please select a resume (PDF)");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setParserResponse("");
      const buffer = await resumeFile.arrayBuffer();
      // @ts-ignore - pdfjs has no bundled types here
      const pdfjsLib: any = await import("pdfjs-dist/build/pdf.mjs");
      // @ts-ignore - pdfjs has no bundled types here
      const pdfjsLib: any = await import("pdfjs-dist/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += (i > 1 ? "\n\n" : "") + content.items.map((it: any) => ("str" in it ? it.str : "")).join(" ");
      }

      const lower = text.toLowerCase();
      if (!fullName) {
        const firstLine = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)[0];
        if (firstLine) setFullName(firstLine);
      }
      if (!skills) {
        const skillMatch = lower.match(/skills?:\s*([^\n]+)/);
        if (skillMatch?.[1]) setSkills(skillMatch[1].split(/[,•]/).map((s) => s.trim()).filter(Boolean).join(", "));
      }
      if (!toolsAndTechnologies) {
        const toolsMatch = lower.match(/tools?\s*(and)?\s*technolog(?:y|ies):\s*([^\n]+)/);
        if (toolsMatch?.[2]) setToolsAndTechnologies(toolsMatch[2].split(/[,•]/).map((s) => s.trim()).filter(Boolean).join(", "));
      }
      if (!languages) {
        const langMatch = lower.match(/languages?:\s*([^\n]+)/);
        if (langMatch?.[1]) setLanguages(langMatch[1].split(/[,•]/).map((s) => s.trim()).filter(Boolean).join(", "));
      }
      if (!education) {
        const eduSection = text.split(/education/i)[1]?.split(/\n\n|experience/i)[0];
        if (eduSection) setEducation(eduSection.split(/\n/).map((s) => s.trim()).filter(Boolean).join("\n"));
      }
      if (!industryExperience) {
        const expSection = text.split(/experience/i)[1]?.split(/\n\n|projects|skills/i)[0];
        if (expSection) setIndustryExperience(expSection.split(/\n/).map((s) => s.trim()).filter(Boolean).join("\n"));
      }
      if (!certifications) {
        const certSection = text.split(/certifications?/i)[1]?.split(/\n\n|projects|skills/i)[0];
        if (certSection) setCertifications(certSection.split(/\n/).map((s) => s.trim()).filter(Boolean).join("\n"));
      }

      // Call external AI Resume Parser
      const endpoint = process.env.NEXT_PUBLIC_RESUME_API_URL || "https://hackathon-agentic.finconsgroup.com/api/v1/run/f3b1b637-648c-4f2d-961e-1fd5f60a4aa5";
      const apiKey = process.env.NEXT_PUBLIC_QA_API_KEY || process.env.QA_API_KEY || "";

      const textToBase64 = (s: string) => {
        try { return btoa(unescape(encodeURIComponent(s))); } catch { return ""; }
      };
      const filesPayload: Array<{ name: string; data: string; mime_type?: string }> = [];
      if (resumeFile) {
        // Attach original PDF as well
        const pdfBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = String(reader.result || "");
            const commaIdx = result.indexOf(",");
            resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
          };
          reader.onerror = () => reject(reader.error || new Error("Failed to read resume file"));
          reader.readAsDataURL(resumeFile);
        });
        filesPayload.push({ name: resumeFile.name, data: pdfBase64, mime_type: resumeFile.type || "application/pdf" });
      }
      // Also attach extracted text as a .txt file for flows expecting file input
      filesPayload.push({ name: "resume.txt", data: textToBase64(text), mime_type: "text/plain" });

      const payloadPrimary: any = {
        output_type: "chat",
        input_type: "text",
        tweaks: { "TextInput-TZAcL": { input_value: text } },
        session_id: "user_1",
        files: filesPayload,
      };

      async function callParser(body: any) {
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey },
          body: JSON.stringify(body),
        });
        const data = await resp.json();
        return { resp, data } as const;
      }

      let { resp, data } = await callParser(payloadPrimary);
      if (!resp.ok) {
        const msg = String(data?.error || data?.detail || "");
        const isSplitTextError = /split\s*text|no data inputs provided/i.test(msg);
        if (isSplitTextError) {
          // Retry by moving text to root input_value and keeping files
          const payloadFallback: any = {
            output_type: "chat",
            input_type: "text",
            input_value: text,
            session_id: "user_1",
            files: filesPayload,
          };
          ({ resp, data } = await callParser(payloadFallback));
        }
      }
      if (!resp.ok) throw new Error(data?.error || data?.detail || "Resume parser API failed");
      let content = "";
      try {
        content =
          data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
          data?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message ||
          data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
          "";
      } catch {}
      if (!content) content = JSON.stringify(data ?? {}, null, 2);
      setParserResponse(content);

      // Attempt to parse structured fields from the AI response and open confirm modal
      const parsed = parseProfileFromModel(content);
      if (parsed) {
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.experienceYears != null) setExperienceYears(String(parsed.experienceYears));
        if (parsed.location) setLocation(parsed.location);
        if (parsed.skills?.length) setSkills(parsed.skills.join(", "));
        if (parsed.education?.length) setEducation(parsed.education.join("\n"));
        if (parsed.toolsAndTechnologies?.length) setToolsAndTechnologies(parsed.toolsAndTechnologies.join(", "));
        if (parsed.industryExperience?.length) setIndustryExperience(parsed.industryExperience.join("\n"));
        if (parsed.certifications?.length) setCertifications(parsed.certifications.join("\n"));
        if (parsed.languages?.length) setLanguages(parsed.languages.join(", "));
        setConfirmOpen(true);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to parse resume");
    } finally {
      setLoading(false);
    }
  }

  function parseProfileFromModel(text: string): {
    fullName?: string;
    experienceYears?: number;
    location?: string;
    skills?: string[];
    education?: string[];
    toolsAndTechnologies?: string[];
    industryExperience?: string[];
    certifications?: string[];
    languages?: string[];
  } | null {
    const tryParse = (s: string) => {
      try { return JSON.parse(s); } catch { return null; }
    };
    // 1) Try whole text as JSON
    let obj: any = tryParse(text);
    // 2) Try code block
    if (!obj) {
      const m = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (m?.[1]) obj = tryParse(m[1]);
    }
    // 3) Try naive braces slice
    if (!obj) {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start >= 0 && end > start) obj = tryParse(text.slice(start, end + 1));
    }

    const result: any = {};
    const coalesce = (...vals: any[]) => vals.find((v) => v != null && v !== "");
    const toStrArr = (v: any) => Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : undefined;
    const toNum = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    if (obj && typeof obj === "object") {
      result.fullName = coalesce(obj.full_name, obj.fullName, obj.name);
      result.experienceYears = toNum(coalesce(obj.experience_years, obj.experienceYears, obj.experience));
      result.location = coalesce(obj.location, obj.city);
      result.skills = toStrArr(coalesce(obj.skills, obj.skillSet, obj.skills_list));
      // education can be array of strings or array of objects
      const eduRaw = coalesce(obj.education, obj.education_list);
      if (Array.isArray(eduRaw)) {
        const mapped = eduRaw.map((item: any) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            const degree = (item.degree || item.title || "").toString().trim();
            const inst = (item.institution || item.school || "").toString().trim();
            const dur = (item.duration || item.year || "").toString().trim();
            const parts = [degree, inst ? `- ${inst}` : "", dur ? `(${dur})` : ""].filter(Boolean);
            return parts.join(" ").trim();
          }
          return "";
        }).filter(Boolean);
        result.education = mapped.length ? mapped : undefined;
      } else {
        result.education = toStrArr(eduRaw);
      }
      result.toolsAndTechnologies = toStrArr(coalesce(obj.tools_and_technologies, obj.toolsAndTechnologies, obj.techStack));
      // industry experience can be array of strings or array of objects
      const indRaw = coalesce(obj.industry_experience, obj.industryExperience, obj.experienceDetails);
      if (Array.isArray(indRaw)) {
        const mapped = indRaw.map((item: any) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            const role = (item.role || item.title || item.position || "").toString().trim();
            const company = (item.company || item.organization || item.employer || "").toString().trim();
            const duration = (item.duration || (() => {
              const from = (item.from || item.start || "").toString().trim();
              const to = (item.to || item.end || "").toString().trim();
              return from || to ? `${from}${from && to ? " - " : ""}${to}` : "";
            })()).toString().trim();
            const parts = [role, company ? `at ${company}` : "", duration ? `(${duration})` : ""].filter(Boolean);
            return parts.join(" ").trim();
          }
          return "";
        }).filter(Boolean);
        result.industryExperience = mapped.length ? mapped : undefined;
      } else {
        result.industryExperience = toStrArr(indRaw);
      }
      result.certifications = toStrArr(coalesce(obj.certifications, obj.certifications_list));
      result.languages = toStrArr(obj.languages);
      // If we extracted anything meaningful, return it
      const hasAny = Object.keys(result).some((k) => result[k] != null && (!(result[k] instanceof Array) || result[k].length));
      if (hasAny) return result;
    }

    // 4) Fallback heuristic from plain text
    const lower = text.toLowerCase();
    const fromLine = (label: RegExp) => (lower.match(label)?.[1] || "").split(/[,•\n]/).map((s) => s.trim()).filter(Boolean);
    const skillsArr = fromLine(/skills?:\s*([^\n]+)/);
    const toolsArr = fromLine(/tools?\s*(and)?\s*technolog(?:y|ies):\s*([^\n]+)/);
    const langsArr = fromLine(/languages?:\s*([^\n]+)/);
    const expNum = Number((lower.match(/experience[^\d]*(\d{1,2})/)?.[1] || "").trim());
    const eduSection = text.split(/education/i)[1]?.split(/\n\n|experience/i)[0];
    const expSection = text.split(/experience/i)[1]?.split(/\n\n|projects|skills/i)[0];
    const certSection = text.split(/certifications?/i)[1]?.split(/\n\n|projects|skills/i)[0];
    const eduArr = eduSection ? eduSection.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
    const indArr = expSection ? expSection.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
    const certArr = certSection ? certSection.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];

    const anyHeuristic = skillsArr.length || toolsArr.length || langsArr.length || eduArr.length || indArr.length || certArr.length || Number.isFinite(expNum);
    if (anyHeuristic) {
      return {
        skills: skillsArr.length ? skillsArr : undefined,
        toolsAndTechnologies: toolsArr.length ? toolsArr : undefined,
        languages: langsArr.length ? langsArr : undefined,
        education: eduArr.length ? eduArr : undefined,
        industryExperience: indArr.length ? indArr : undefined,
        certifications: certArr.length ? certArr : undefined,
        experienceYears: Number.isFinite(expNum) ? expNum : undefined,
      };
    }
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Complete your profile</CardTitle>
          <CardDescription>Set a new password and complete your profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <label htmlFor="fullName" className="text-sm font-medium leading-none">Full name</label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="location" className="text-sm font-medium leading-none">Location</label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <label htmlFor="experienceYears" className="text-sm font-medium leading-none">Experience (years)</label>
                <Input id="experienceYears" inputMode="numeric" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="skills" className="text-sm font-medium leading-none">Skills (comma separated)</label>
                <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, SQL" />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <label htmlFor="languages" className="text-sm font-medium leading-none">Languages (comma separated)</label>
                <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Hindi" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="toolsAndTechnologies" className="text-sm font-medium leading-none">Tools & Technologies</label>
                <Input id="toolsAndTechnologies" value={toolsAndTechnologies} onChange={(e) => setToolsAndTechnologies(e.target.value)} placeholder="Git, Docker, AWS" />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="education" className="text-sm font-medium leading-none">Education (one per line)</label>
              <Textarea id="education" value={education} onChange={(e) => setEducation(e.target.value)} placeholder={"B.Tech in CSE - XYZ College\nM.Tech in AI - ABC University"} />
            </div>

            <div className="grid gap-2">
              <label htmlFor="industryExperience" className="text-sm font-medium leading-none">Industry Experience (one per line)</label>
              <Textarea id="industryExperience" value={industryExperience} onChange={(e) => setIndustryExperience(e.target.value)} placeholder={"Company A - Software Engineer (2020-2022)\nCompany B - Senior Engineer (2022-Now)"} />
            </div>

            <div className="grid gap-2">
              <label htmlFor="certifications" className="text-sm font-medium leading-none">Certifications (one per line)</label>
              <Textarea id="certifications" value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder={"AWS Certified Developer Associate\nPMP"} />
            </div>

            <div className="grid gap-2">
              <label htmlFor="resume" className="text-sm font-medium leading-none">Resume (PDF) for Auto-fill</label>
              <Input id="resume" type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={parseResumeAndAutofill} disabled={loading}>
                  {loading ? "Parsing..." : "Auto-fill using AI Resume parser"}
                </Button>
              </div>
            </div>

            {/* Hidden parser output; we do not display raw JSON */}

            <div className="flex justify-end gap-2">
              <div className="mr-auto">
                {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
              </div>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setConfirmOpen(false)}>
          <div className="w-full max-w-3xl max-h-[85vh] bg-background rounded-md shadow-lg overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b shrink-0">
              <h2 className="text-lg font-semibold">Confirm parsed details</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Review and edit before saving.</p>
            </div>
            <div className="p-4 grid gap-4 flex-1 overflow-auto">
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1">
                  <label className="text-sm">Full name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Experience (years)</label>
                  <Input value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Skills (comma separated)</label>
                <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Languages (comma separated)</label>
                <Input value={languages} onChange={(e) => setLanguages(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Tools & Technologies (comma separated)</label>
                <Input value={toolsAndTechnologies} onChange={(e) => setToolsAndTechnologies(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Education (one per line)</label>
                <Textarea value={education} onChange={(e) => setEducation(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Industry Experience (one per line)</label>
                <Textarea value={industryExperience} onChange={(e) => setIndustryExperience(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Certifications (one per line)</label>
                <Textarea value={certifications} onChange={(e) => setCertifications(e.target.value)} />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2 shrink-0">
              <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const saveRes = await fetch("/api/employee/complete-profile", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        full_name: fullName,
                        experience_years: experienceYears ? Number(experienceYears) : undefined,
                        location,
                        skills: skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
                        education: education ? education.split("\n").map((s) => s.trim()).filter(Boolean) : [],
                        tools_and_technologies: toolsAndTechnologies ? toolsAndTechnologies.split(",").map((s) => s.trim()).filter(Boolean) : [],
                        industry_experience: industryExperience ? industryExperience.split("\n").map((s) => s.trim()).filter(Boolean) : [],
                        certifications: certifications ? certifications.split("\n").map((s) => s.trim()).filter(Boolean) : [],
                        languages: languages ? languages.split(",").map((s) => s.trim()).filter(Boolean) : [],
                      }),
                    });
                    const saveJson = await saveRes.json();
                    if (!saveRes.ok) throw new Error(saveJson?.error || "Save failed");
                    setConfirmOpen(false);
                    await refresh();
                  } catch (e: any) {
                    setError(e?.message || "Failed to save");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


