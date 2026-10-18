import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { limited } from "@/lib/session";
import { FREE_HOURS } from "@/lib/plans";
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Pehle login karein" }, { status: 401 });
  if (limited(`redeem:${userId}`, 10, 15 * 60e3)) return NextResponse.json({ error: "Bahut zyada attempts. 15 minute baad try karein." }, { status: 429 });
  const normalized = String((await req.json().catch(() => ({})))?.key ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^CINE[0-9A-F]{20}$/.test(normalized)) return NextResponse.json({ error: "Key ka format galat hai" }, { status: 400 });
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  const { data, error } = await db.rpc("redeem_access_key", { p_user: userId, p_hash: hash, p_hours: FREE_HOURS });
  if (error) return NextResponse.json({ error: "Key galat hai, pehle use ho chuki hai, ya expire ho gayi hai" }, { status: 400 });
  return NextResponse.json({ ok: true, expiresAt: data });
}
