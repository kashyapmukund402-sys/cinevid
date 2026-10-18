import bcrypt from "bcryptjs"; import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { isAdmin } from "@/lib/session"; import { removeFiles } from "@/lib/storage"; import { cleanVideoUrl } from "@/lib/videoUrl";
const no = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const int = (v: any) => (v === "" || v == null ? null : Number.isInteger(Number(v)) ? Number(v) : NaN);
export async function POST(req: Request) { // create or update
  if (!(await isAdmin())) return no(); const b = await req.json();
  const num = int(b.episode_number), title = String(b.title ?? "").trim().slice(0, 200);
  if (!num || num < 1 || !title) return NextResponse.json({ error: "Episode number and title required" }, { status: 400 });
  if (b.pin && !/^\d{4}$/.test(b.pin)) return NextResponse.json({ error: "Password must be 4 digits" }, { status: 400 });
  const row: any = { episode_number: num, title, description: String(b.description ?? "").slice(0, 5000), published: !!b.published,
    published_at: b.published_at ? new Date(b.published_at).toISOString() : new Date().toISOString(), prev_episode: int(b.prev_episode), next_episode: int(b.next_episode), updated_at: new Date().toISOString() };
  if (b.pin) row.password_hash = await bcrypt.hash(b.pin, 10);
  let old: any = null;
  if (b.id) { old = (await db.from("episodes").select("video_path,video_url,thumbnail_path").eq("id", b.id).single()).data; }

  // VIDEO URL (replaces video file upload)
  const rawUrl = String(b.video_url ?? "").trim();
  if (rawUrl) {
    const v = cleanVideoUrl(rawUrl);
    if (!v) return NextResponse.json({ error: "Invalid Video URL. Use a full link like https://example.com/video.mp4" }, { status: 400 });
    row.video_url = v; row.video_path = null; // URL replaces any old uploaded file
  } else if (!(old && old.video_path && !old.video_url)) {
    // empty is only allowed when editing an OLD episode that still uses an uploaded file
    return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
  }
  if (b.thumbnail_path) row.thumbnail_path = b.thumbnail_path;
  if (!b.id && !row.password_hash) return NextResponse.json({ error: "4-digit password required" }, { status: 400 });

  const q = b.id ? db.from("episodes").update(row).eq("id", b.id) : db.from("episodes").insert(row);
  const { error } = await q; if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // clean up replaced files in Supabase Storage (old uploaded video, old thumbnail)
  if (old) await removeFiles(row.video_url ? old.video_path : undefined, b.thumbnail_path && old.thumbnail_path);
  return NextResponse.json({ ok: true });
}
export async function PATCH(req: Request) { // toggle publish
  if (!(await isAdmin())) return no(); const { id, published } = await req.json();
  await db.from("episodes").update({ published: !!published, updated_at: new Date().toISOString() }).eq("id", id); return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return no(); const id = new URL(req.url).searchParams.get("id")!;
  const { data: e } = await db.from("episodes").select("video_path,thumbnail_path").eq("id", id).single();
  await db.from("episodes").delete().eq("id", id); if (e) await removeFiles(e.video_path ?? undefined, e.thumbnail_path); return NextResponse.json({ ok: true });
}
