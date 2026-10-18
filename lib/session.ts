import crypto from "crypto"; import { cookies } from "next/headers";
const sign = (v: string) => crypto.createHmac("sha256", process.env.SESSION_SECRET!).update(v).digest("hex");
export const makeToken = () => { const v = String(Date.now() + 7 * 864e5); return v + "." + sign(v); };
export async function isAdmin() {
  const t = (await cookies()).get("adm")?.value; if (!t) return false;
  const [v, s] = t.split("."); if (!s) return false;
  const a = Buffer.from(sign(v)), b = Buffer.from(s);
  return a.length === b.length && crypto.timingSafeEqual(a, b) && Number(v) > Date.now();
}
const m = new Map<string, { n: number; t: number }>();
// In-memory limiter. On serverless (Vercel) use Upstash Redis for a shared limiter.
export function limited(k: string, max = 5, win = 10 * 60e3) {
  const now = Date.now(), e = m.get(k);
  if (!e || now - e.t > win) { m.set(k, { n: 1, t: now }); return false; }
  return ++e.n > max;
}
