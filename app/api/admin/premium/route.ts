import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/session";
import { PLANS, PlanId } from "@/lib/plans";
// Admin grants Premium after verifying a UPI payment. Stacks on top of existing premium time.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { who, plan } = await req.json().catch(() => ({}));
  const p = PLANS[plan as PlanId];
  if (!p) return NextResponse.json({ error: "Plan galat hai" }, { status: 400 });
  const w = String(who ?? "").trim().toLowerCase();
  if (!w) return NextResponse.json({ error: "User ID ya email dalein" }, { status: 400 });
  let q = db.from("profiles").select("id,premium_until");
  q = w.includes("@") ? q.eq("email", w) : q.eq("id", w);
  const { data: prof } = await q.maybeSingle();
  if (!prof) return NextResponse.json({ error: "User nahi mila. User ko pehle site pe login karna hoga." }, { status: 404 });
  const base = Math.max(Date.now(), prof.premium_until ? Date.parse(prof.premium_until) : 0);
  const until = new Date(base + p.hours * 3600e3).toISOString();
  const { error } = await db.from("profiles").update({ premium_until: until, updated_at: new Date().toISOString() }).eq("id", prof.id);
  if (error) return NextResponse.json({ error: "Update nahi ho paya" }, { status: 500 });
  return NextResponse.json({ ok: true, premium_until: until });
}
