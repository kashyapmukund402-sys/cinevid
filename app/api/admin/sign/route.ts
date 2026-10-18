import crypto from "crypto"; import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/session"; import { signedUpload } from "@/lib/storage";
// Video uploads removed: videos are now saved as URLs. Only thumbnails can be uploaded.
const RULES = { thumb: { ext: [".jpg", ".jpeg", ".png", ".webp"], max: 5 * 1024 ** 2 } };
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { kind, filename, size } = await req.json(); const r = RULES[kind as "thumb"]; if (!r) return NextResponse.json({ error: "Bad kind" }, { status: 400 });
  const ext = (String(filename).match(/\.[a-z0-9]+$/i)?.[0] ?? "").toLowerCase();
  if (!r.ext.includes(ext)) return NextResponse.json({ error: `Allowed: ${r.ext.join(", ")}` }, { status: 400 });
  if (!(size > 0) || size > r.max) return NextResponse.json({ error: `Max size ${r.max / 1024 ** 2}MB` }, { status: 400 });
  const path = crypto.randomUUID() + ext;
  return NextResponse.json({ path, url: await signedUpload(kind, path) });
}
