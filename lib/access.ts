import { db } from "./db";
export type Tier = "premium" | "free" | "none";
// Single source of truth. Expiry is checked on every call, so no cron job is needed.
// Any DB error fails CLOSED (no access).
export async function getAccess(userId: string): Promise<{ tier: Tier; expiresAt: string | null }> {
  const { data: p, error } = await db.from("profiles").select("premium_until,free_until").eq("id", userId).maybeSingle();
  if (error || !p) return { tier: "none", expiresAt: null };
  const now = Date.now();
  if (p.premium_until && Date.parse(p.premium_until) > now) return { tier: "premium", expiresAt: p.premium_until };
  if (p.free_until && Date.parse(p.free_until) > now) return { tier: "free", expiresAt: p.free_until };
  return { tier: "none", expiresAt: null };
}
