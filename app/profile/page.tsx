import { getSessionUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const { user } = await getSessionUser();
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      {!user ? (
        <p className="text-zinc-600 dark:text-zinc-400">No user loaded.</p>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-zinc-500">Email</dt>
                <dd className="text-sm">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Role</dt>
                <dd className="text-sm">{user.role}</dd>
              </div>
              {"department" in user && user.department ? (
                <div>
                  <dt className="text-sm text-zinc-500">Department</dt>
                  <dd className="text-sm">{user.department}</dd>
                </div>
              ) : null}
              {"joiningDate" in user && user.joiningDate ? (
                <div>
                  <dt className="text-sm text-zinc-500">Joining Date</dt>
                  <dd className="text-sm">{user.joiningDate}</dd>
                </div>
              ) : null}
              {"experienceYears" in user && typeof user.experienceYears === "number" ? (
                <div>
                  <dt className="text-sm text-zinc-500">Experience (years)</dt>
                  <dd className="text-sm">{user.experienceYears}</dd>
                </div>
              ) : null}
              {"managerEmail" in user && user.managerEmail ? (
                <div>
                  <dt className="text-sm text-zinc-500">Manager Email</dt>
                  <dd className="text-sm">{user.managerEmail}</dd>
                </div>
              ) : null}
              {"location" in user && (user as any).location ? (
                <div>
                  <dt className="text-sm text-zinc-500">Location</dt>
                  <dd className="text-sm">{(user as any).location}</dd>
                </div>
              ) : null}
              {"skills" in user && Array.isArray((user as any).skills) && (user as any).skills.length ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-zinc-500">Skills</dt>
                  <dd className="text-sm">{(user as any).skills.join(", ")}</dd>
                </div>
              ) : null}
              {"toolsAndTechnologies" in user && Array.isArray((user as any).toolsAndTechnologies) && (user as any).toolsAndTechnologies.length ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-zinc-500">Tools & Technologies</dt>
                  <dd className="text-sm">{(user as any).toolsAndTechnologies.join(", ")}</dd>
                </div>
              ) : null}
              {"industryExperience" in user && Array.isArray((user as any).industryExperience) && (user as any).industryExperience.length ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-zinc-500">Industry Experience</dt>
                  <dd className="text-sm whitespace-pre-wrap">
                    {((user as any).industryExperience as any[]).map((item: any) => {
                      if (typeof item === "string") return item;
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
                    }).join("\n")}
                  </dd>
                </div>
              ) : null}
              {"certifications" in user && Array.isArray((user as any).certifications) && (user as any).certifications.length ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-zinc-500">Certifications</dt>
                  <dd className="text-sm whitespace-pre-wrap">{(user as any).certifications.join("\n")}</dd>
                </div>
              ) : null}
              {"languages" in user && Array.isArray((user as any).languages) && (user as any).languages.length ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-zinc-500">Languages</dt>
                  <dd className="text-sm">{(user as any).languages.join(", ")}</dd>
                </div>
              ) : null}
              {"education" in user && Array.isArray((user as any).education) && (user as any).education.length ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-zinc-500">Education</dt>
                  <dd className="text-sm whitespace-pre-wrap">
                    {((user as any).education as any[]).map((item: any) => {
                      if (typeof item === "string") return item;
                      if (item && typeof item === "object") {
                        const degree = (item.degree || item.title || "").toString().trim();
                        const inst = (item.institution || item.school || "").toString().trim();
                        const dur = (item.duration || item.year || "").toString().trim();
                        const score = (item.cgpa || item.percentage || "").toString().trim();
                        const parts = [degree, inst ? `- ${inst}` : "", dur ? `(${dur})` : "", score ? `- ${score}` : ""].filter(Boolean);
                        return parts.join(" ").trim();
                      }
                      return "";
                    }).join("\n")}
                  </dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


