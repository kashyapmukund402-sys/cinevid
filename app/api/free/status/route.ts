import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { getFreeSettings } from "@/lib/freeGate";
export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ loggedIn: false });
  const { data: t } = await db.from("free_tasks").select("id,status,created_at")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: p } = await db.from("profiles").select("free_until").eq("id", userId).maybeSingle();
  const s = await getFreeSettings();
  const cooldownUntil = p?.free_until ? new Date(Date.parse(p.free_until) + s.cooldownHours * 3600e3).toISOString() : null;
  const open = t && ["started", "returned", "verified"].includes(t.status);
  return NextResponse.json({
    loggedIn: true,
    task: t ? { id: t.id, status: t.status } : null,
    shrinkUrl: t?.status === "started" ? s.shrinkUrl : null,
    cooldownUntil: cooldownUntil && Date.parse(cooldownUntil) > Date.now() ? cooldownUntil : null,
    open: !!open,
  });
}
