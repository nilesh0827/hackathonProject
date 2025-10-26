import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function EmployeePage() {
  const { user } = await getSessionUser();
  const needsCompletion = !user?.department || !user?.joiningDate;
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Employee</h1>
      {needsCompletion ? (
        <Card className="mb-6">
          <CardContent className="p-4 text-sm">
            Your profile is incomplete. Please
            {" "}
            <Link href="/employee/complete-profile" className="underline">complete your profile</Link>
            {" "}
            to continue.
          </CardContent>
        </Card>
      ) : null}
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Access your onboarding resources and profile.
      </p>
      <nav className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/profile"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Profile
        </Link>
        <Link
          href="/employee/onboarding-plan"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Onboarding Plan
        </Link>
        <Link
          href="/tutorials"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Tutorials
        </Link>
        <Link
          href="/qa"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Ask the Knowledge Base
        </Link>
        <Link
          href="/employee/resources"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Resources
        </Link>
      </nav>
    </div>
  );
}


