"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HRCreateUserPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("employee");
  const [startDate, setStartDate] = useState("");
  const [position, setPosition] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showCreds, setShowCreds] = useState(false);
  const [copied, setCopied] = useState(false);

  function generateTempPassword() {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setTempPassword(pwd);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetch("/api/hr/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email,
        department,
        role,
        position,
        joiningDate: startDate,
        experienceYears: undefined,
        password: tempPassword,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed");
        setShowCreds(true);
      })
      .catch((e) => alert(e.message));
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Employee</CardTitle>
          <CardDescription>HR only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium leading-none"
                >
                  Full name
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none"
                >
                  Work email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="department"
                  className="text-sm font-medium leading-none"
                >
                  Department
                </label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="role"
                  className="text-sm font-medium leading-none"
                >
                  Role
                </label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="position"
                  className="text-sm font-medium leading-none"
                >
                  Position
                </label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Software Developer"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="startDate"
                  className="text-sm font-medium leading-none"
                >
                  Start date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="tempPassword"
                  className="text-sm font-medium leading-none"
                >
                  Temporary password
                </label>
                <div className="flex gap-2">
                  <Input
                    id="tempPassword"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="generate or set manually"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateTempPassword}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {showCreds ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowCreds(false)}
        >
          <div
            className="w-full max-w-md bg-background rounded-md shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Employee Credentials</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Share these with the employee securely.
              </p>
            </div>
            <div className="p-4 grid gap-3">
              <div>
                <div className="text-xs text-zinc-500">Username (Email)</div>
                <Input readOnly value={email} />
              </div>
              <div>
                <div className="text-xs text-zinc-500">Temporary Password</div>
                <Input readOnly value={tempPassword} />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `Email: ${email}\nPassword: ${tempPassword}`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch {}
                }}
              >
                {copied ? "Copied!" : "Copy both"}
              </Button>
              <Button type="button" onClick={() => setShowCreds(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
