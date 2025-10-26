import crypto from "node:crypto";

const SALT_LEN = 16;
const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LEN);
  const N = 16384, r = 8, p = 1; // scrypt params
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, { N, r, p }, (err, dk) => {
      if (err) return reject(err);
      resolve(dk as Buffer);
    });
  });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [algo, Nstr, rstr, pstr, saltB64, hashB64] = stored.split("$");
    if (algo !== "scrypt") return false;
    const N = Number(Nstr), r = Number(rstr), p = Number(pstr);
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(password, salt, expected.length, { N, r, p }, (err, dk) => {
        if (err) return reject(err);
        resolve(dk as Buffer);
      });
    });
    return crypto.timingSafeEqual(derivedKey, expected);
  } catch {
    return false;
  }
}



