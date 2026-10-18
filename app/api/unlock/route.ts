import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signedRead } from "@/lib/storage";
import { logView } from "@/lib/analytics";
import { cleanVideoUrl, isDirectVideo } from "@/lib/videoUrl";
import { getUserId } from "@/lib/auth";
import { getAccess } from "@/lib/access";
// PIN removed. Access = logged-in user with active Free key or Premium. Checked on the server every time.
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Pehle Google se login karein", code: "LOGIN" }, { status: 401 });
  const access = await getAccess(userId);
  if (access.tier === "none") return NextResponse.json({ error: "Free key ya Premium lein", code: "NO_ACCESS" }, { status: 403 });

  const { n } = await req.json().catch(() => ({}));
  if (!Number.isInteger(Number(n))) return NextResponse.json({ error: "Invalid episode" }, { status: 400 });
  const { data: e } = await db.from("episodes").select("video_path,video_url").eq("episode_number", Number(n)).eq("published", true).maybeSingle();
  if (!e) return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  await logView(`/episode/${n}`, Number(n), "unlock");

  if (e.video_url) {
    const u = cleanVideoUrl(e.video_url);
    if (!u) return NextResponse.json({ error: "This episode has an invalid video link" }, { status: 500 });
    return NextResponse.json({ url: u, downloadUrl: u, direct: isDirectVideo(u), external: true, tier: access.tier, expiresAt: access.expiresAt });
  }
  if (!e.video_path) return NextResponse.json({ error: "Video not available" }, { status: 404 });
  const ext = e.video_path.match(/\.[a-z0-9]+$/i)?.[0] ?? ".mp4";
  const [url, downloadUrl] = await Promise.all([signedRead(e.video_path), signedRead(e.video_path, 3600, `episode-${n}${ext}`)]);
  return NextResponse.json({ url, downloadUrl, direct: true, external: false, tier: access.tier, expiresAt: access.expiresAt });
}
