import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
// Called from /free/return?t=TASK_ID. Marks THAT task as returned (pending review), not completed.
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Pehle login karein" }, { status: 401 });
  const { taskId } = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(String(taskId))) return NextResponse.json({ error: "Task ID galat hai" }, { status: 400 });
  const { data: t } = await db.from("free_tasks").select("id").eq("id", taskId).eq("user_id", userId).eq("status", "started")
    .gte("created_at", new Date(Date.now() - 2 * 3600e3).toISOString()).maybeSingle();
  if (!t) return NextResponse.json({ ok: false, error: "Task nahi mila, expire ho gaya, ya already submit ho chuka hai" }, { status: 404 });
  const { error } = await db.from("free_tasks").update({ status: "returned", returned_at: new Date().toISOString() })
    .eq("id", t.id).eq("status", "started");
  if (error) return NextResponse.json({ error: "Update nahi hua" }, { status: 500 });
  return NextResponse.json({ ok: true, message: "Task submit ho gaya. Admin verification ke baad key milegi." });
}
