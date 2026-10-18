import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/session";
import { getFreeSettings } from "@/lib/freeGate";
const no = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export async function GET(req: Request) {
  if (!(await isAdmin())) return no();
  const status = new URL(req.url).searchParams.get("status") ?? "returned";
  const { data: tasks } = await db.from("free_tasks").select("id,user_id,status,created_at,returned_at")
    .eq("status", status).order("returned_at", { ascending: true, nullsFirst: false }).limit(100);
  const ids = [...new Set((tasks ?? []).map((t) => t.user_id))];
  const { data: profs } = ids.length ? await db.from("profiles").select("id,email").in("id", ids) : { data: [] as any[] };
  const emailOf = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p.email]));
  return NextResponse.json({ tasks: (tasks ?? []).map((t) => ({ ...t, email: emailOf[t.user_id] ?? "" })), settings: await getFreeSettings() });
}
export async function POST(req: Request) {
  if (!(await isAdmin())) return no();
  const { id, action } = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  if (!["verify", "reject"].includes(action)) return NextResponse.json({ error: "Bad action" }, { status: 400 });
  const next = action === "verify" ? "verified" : "rejected";
  // Only a 'returned' task can be decided, and only once (guards double clicks / replays)
  const { data: t, error } = await db.from("free_tasks")
    .update({ status: next, verified_at: next === "verified" ? new Date().toISOString() : null, verified_by: "admin" })
    .eq("id", id).eq("status", "returned").select("id,user_id").maybeSingle();
  if (error || !t) return NextResponse.json({ error: "Task nahi mila ya already decide ho chuka hai" }, { status: 409 });
  await db.from("admin_audit_logs").insert({ admin_label: "admin", action: `free_task_${next}`, target_user_id: t.user_id, related_id: t.id });
  return NextResponse.json({ ok: true, status: next });
}
