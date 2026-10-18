import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getVerifiedUserId as getUserId } from "@/lib/auth";
import { getAccess } from "@/lib/access";
import { limited } from "@/lib/session";
import { createShrinkLink } from "@/lib/shrink";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://cinevid.netlify.app";
// Creates a task and a ShrinkEarn link whose destination carries that exact task ID.
// The free key is NOT issued here; it still needs admin verification.
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Pehle login aur email verify karein" }, { status: 401 });
  if (limited(`task:${userId}`, 10, 60 * 60e3)) return NextResponse.json({ error: "Bahut zyada requests. Thodi der baad try karein." }, { status: 429 });
  const access = await getAccess(userId);
  if (access.tier === "premium") return NextResponse.json({ error: "Aap Premium par hain, task ki zaroorat nahi" }, { status: 409 });

  const { data: open } = await db.from("free_tasks").select("id,status")
    .eq("user_id", userId).in("status", ["started", "returned", "verified"])
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (open && open.status !== "started") return NextResponse.json({ taskId: open.id, status: open.status, shrinkUrl: null });

  let taskId = open?.id as string | undefined;
  if (!taskId) {
    const { data: created, error } = await db.from("free_tasks").insert({ user_id: userId, status: "started" }).select("id").single();
    if (error || !created) return NextResponse.json({ error: "Task nahi ban paya" }, { status: 500 });
    taskId = created.id;
  }

  const link = await createShrinkLink(`${SITE}/free/return?t=${taskId}`);
  if ("error" in link) {
    if (!open) await db.from("free_tasks").delete().eq("id", taskId);   // don't leave a dead task behind
    return NextResponse.json({ error: link.error }, { status: 502 });
  }
  return NextResponse.json({ taskId, status: "started", shrinkUrl: link.url });
}
