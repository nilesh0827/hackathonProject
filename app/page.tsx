import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">Onboarding Companion</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">AI-assisted onboarding for new employees at Fincons.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/login"><Button>Login</Button></Link>
          <Link href="/register"><Button variant="outline">HR Registration</Button></Link>
        </div>
      </main>
    </div>
  );
}
