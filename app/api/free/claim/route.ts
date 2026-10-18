import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getVerifiedUserId as getUserId } from "@/lib/auth";
import { getFreeSettings } from "@/lib/freeGate";
import { newAccessKey } from "@/lib/keys";
// Generates the key ONLY for a task that an admin verified. Key is shown once.
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Pehle login karein" }, { status: 401 });
  const { data: t } = await db.from("free_tasks").select("id")
    .eq("user_id", userId).eq("status", "verified").order("verified_at", { ascending: false }).limit(1).maybeSingle();
  if (!t) return NextResponse.json({ error: "Verified task nahi mila. Pehle task complete karke admin verification ka intezaar karein." }, { status: 409 });
  const s = await getFreeSettings();
  const key = newAccessKey();
  const { data, error } = await db.rpc("issue_free_key", { p_user: userId, p_task: t.id, p_hash: key.hash, p_cooldown_hours: s.cooldownHours, p_valid_hours: 24 });
  if (error) {
    const m = error.message ?? "";
    if (m.includes("COOLDOWN|")) return NextResponse.json({ error: "Free access abhi cooldown mein hai", cooldownUntil: m.split("COOLDOWN|")[1]?.trim() }, { status: 429 });
    if (m.includes("KEY_PENDING")) return NextResponse.json({ error: "Aapki ek key pehle se pending hai. Use redeem karein." }, { status: 409 });
    return NextResponse.json({ error: "Key nahi ban payi" }, { status: 409 });
  }
  return NextResponse.json({ key: key.display, validUntil: data });
}
