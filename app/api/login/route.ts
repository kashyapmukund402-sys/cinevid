import bcrypt from "bcryptjs"; import { NextResponse } from "next/server"; import { limited, makeToken } from "@/lib/session";
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "x";
  if (limited(`adm:${ip}`, 5, 15 * 60e3)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const { email, password } = await req.json().catch(() => ({}));
  const ok = email === process.env.ADMIN_EMAIL && typeof password === "string" && (await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!));
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("adm", makeToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 7 * 86400 });
  return res;
}
