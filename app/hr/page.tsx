import Link from "next/link";

export default function HRPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">HR</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Manage onboarding and help new employees get started.
      </p>
      <nav className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/hr/create-user"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Create New Employee
        </Link>
        <Link
          href="/hr/onboarding-plan"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Create Onboarding Plan
        </Link>
        <Link
          href="/hr/documents"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Add Documents
        </Link>
        <Link
          href="/hr/resources"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Manage Resources
        </Link>
        <Link
          href="/hr/tutorials"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Add Tutorials
        </Link>
        <Link
          href="/qa"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Knowledge Q&A
        </Link>
      </nav>
    </div>
  );
}


