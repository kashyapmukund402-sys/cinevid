"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
function RegisterForm() {
  const sp = useSearchParams(); const next = sp.get("next") || "/";
  const [email, setEmail] = useState(""); const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState(""); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return setErr("Username 3-20 characters, sirf a-z, 0-9 aur _");
    if (password.length < 8) return setErr("Password kam se kam 8 characters ka ho");
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password,
      options: { data: { username }, emailRedirectTo: `${location.origin}/login?next=${encodeURIComponent(next)}` } });
    setBusy(false);
    if (error) return setErr(/already|registered|exists/i.test(error.message) ? "Ye email ya username pehle se use mein hai." : error.message);
    setDone(true);
  }
  if (done) return <div className="max-w-sm mx-auto mt-20 bg-zinc-900 border border-white/10 rounded-xl p-8 text-center">
    <h1 className="text-xl font-bold mb-2">Email check karein</h1>
    <p className="text-white/70 text-sm">Verification link bheja gaya hai. Verify karne ke baad login karein.</p>
    <Link href="/login" className="inline-block mt-6 bg-brand px-6 py-2.5 rounded-lg font-semibold">Login</Link></div>;
  return (<form onSubmit={submit} className="max-w-sm mx-auto mt-20 bg-zinc-900 border border-white/10 rounded-xl p-8 space-y-4">
    <h1 className="text-2xl font-bold">Register</h1>
    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5" />
    <input required value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="Username" className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5" />
    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8)" className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5" />
    {err && <p className="text-red-400 text-sm">{err}</p>}
    <button disabled={busy} className="w-full bg-brand disabled:opacity-40 py-2.5 rounded-lg font-semibold">{busy ? "Ruko…" : "Create account"}</button>
    <p className="text-sm text-white/60">Account hai? <Link href="/login" className="hover:text-white">Login</Link></p>
  </form>);
}
export default function Register() { return <Suspense><RegisterForm /></Suspense>; }
