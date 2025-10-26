import crypto from "node:crypto";

type SessionPayload = {
  userId: string;
  role: "hr" | "employee";
  email: string;
  name: string;
  exp: number; // epoch seconds
};

const encoder = new TextEncoder();

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function signSession(payload: Omit<SessionPayload, "exp">, ttlSeconds = 60 * 60 * 24): string {
  const secret = process.env.SESSION_SECRET || "dev-secret-change";
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const full: SessionPayload = { ...payload, exp };
  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(full));
  const data = `${h}.${p}`;
  const sig = crypto.createHmac("sha256", encoder.encode(secret) as unknown as Buffer).update(data).digest();
  const s = base64url(sig);
  return `${data}.${s}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  try {
    const secret = process.env.SESSION_SECRET || "dev-secret-change";
    const [h, p, s] = token.split(".");
    const data = `${h}.${p}`;
    const expected = base64url(
      crypto.createHmac("sha256", encoder.encode(secret) as unknown as Buffer).update(data).digest()
    );
    if (s !== expected) return null;
    const payload = JSON.parse(Buffer.from(p, "base64").toString()) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}



