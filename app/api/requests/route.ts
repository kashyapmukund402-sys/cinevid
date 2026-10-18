import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { limited } from "@/lib/session";
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "x";
  if (limited(`req:${ip}`, 5, 60 * 60e3)) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const title = String(b.title ?? "").trim().slice(0, 200);
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const row = { title, description: String(b.description ?? "").slice(0, 2000), reference_link: String(b.reference_link ?? "").slice(0, 500) };
  const { error } = await db.from("video_requests").insert(row);
  if (error) return NextResponse.json({ error: "Could not submit request" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
