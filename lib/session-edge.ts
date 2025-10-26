type SessionPayload = {
  userId: string;
  role: "hr" | "employee";
  email: string;
  name: string;
  exp: number; // epoch seconds
};

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (base64Url.length % 4)) % 4);
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function verifySessionEdge(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secret = process.env.SESSION_SECRET || "dev-secret-change";
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const data = `${h}.${p}`;
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(data));
    const sigB64u = uint8ArrayToBase64Url(new Uint8Array(sigBuf));
    if (sigB64u !== s) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(p))) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}



