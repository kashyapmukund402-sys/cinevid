import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/session";
import { cleanVideoUrl } from "@/lib/videoUrl";
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { shrink_url, cooldown_hours } = await req.json().catch(() => ({}));
  const url = cleanVideoUrl(shrink_url);
  if (!url || !url.startsWith("https://")) return NextResponse.json({ error: "Valid https Shrink link dalein" }, { status: 400 });
  const cd = Number(cooldown_hours);
  if (!Number.isInteger(cd) || cd < 0 || cd > 168) return NextResponse.json({ error: "Cooldown 0 se 168 ghante ke beech hona chahiye" }, { status: 400 });
  const { error } = await db.from("settings").update({ shrink_url: url, free_cooldown_hours: cd }).eq("id", 1);
  if (error) return NextResponse.json({ error: "Save nahi hua" }, { status: 500 });
  await db.from("admin_audit_logs").insert({ admin_label: "admin", action: "free_settings_update" });
  return NextResponse.json({ ok: true });
}
