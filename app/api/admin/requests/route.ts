import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { isAdmin } from "@/lib/session";
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, admin_response } = await req.json();
  const valid = ["pending", "reviewing", "approved", "rejected", "completed"];
  if (!valid.includes(status)) return NextResponse.json({ error: "Bad status" }, { status: 400 });
  await db.from("video_requests").update({ status, admin_response: admin_response ?? "", updated_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ ok: true });
}
