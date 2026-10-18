"use client";
import { useState } from "react";
export default function AdminLogin() {
  const [err, setErr] = useState("");
  async function s(e: any) { e.preventDefault(); const f = new FormData(e.target);
    const r = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(f)) });
    r.ok ? (location.href = "/admin") : setErr((await r.json()).error); }
  return (<form onSubmit={s} className="max-w-sm mx-auto mt-24 p-6 bg-zinc-900 rounded-xl space-y-3">
    <h1 className="text-xl font-bold">Admin Login</h1>
    <input name="email" type="email" placeholder="Email" required className="w-full bg-black border border-white/20 rounded-lg p-3" />
    <input name="password" type="password" placeholder="Password" required className="w-full bg-black border border-white/20 rounded-lg p-3" />
    {err && <p className="text-red-400 text-sm">{err}</p>}<button className="w-full bg-brand rounded-lg py-3 font-semibold">Login</button></form>);
}
