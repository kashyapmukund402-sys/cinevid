import { NextResponse } from "next/server";
export async function POST(req: Request) { const r = NextResponse.redirect(new URL("/login", req.url), 303); r.cookies.delete("adm"); return r; }
