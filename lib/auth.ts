import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { usersFindOne } from "@/lib/astra";
import type { AnyUser } from "@/lib/types";

export async function getSessionUser(): Promise<{ user: AnyUser | null; token: string | null }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value || null;
  const payload = verifySession(token);
  if (!payload) return { user: null, token };
  const user = (await usersFindOne({ email: payload.email })) as AnyUser | null;
  return { user, token };
}



