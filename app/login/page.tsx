"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
function LoginForm() {
  const sp = useSearchParams(); const router = useRouter();
  const next = sp.get("next") || "/";
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return setErr(error.message.includes("Email not confirmed") ? "Pehle email verify karein (inbox check karein)." : "Email ya password galat hai.");
    router.push(next);
  }
  return (<form onSubmit={submit} className="max-w-sm mx-auto mt-20 bg-zinc-900 border border-white/10 rounded-xl p-8 space-y-4">
    <h1 className="text-2xl font-bold">Login</h1>
    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5" />
    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5" />
    {err && <p className="text-red-400 text-sm">{err}</p>}
    <button disabled={busy} className="w-full bg-brand disabled:opacity-40 py-2.5 rounded-lg font-semibold">{busy ? "Ruko…" : "Login"}</button>
    <div className="flex justify-between text-sm text-white/60">
      <Link href="/reset-password?mode=request" className="hover:text-white">Password bhool gaye?</Link>
      <Link href={`/register?next=${encodeURIComponent(next)}`} className="hover:text-white">Register</Link></div>
  </form>);
}
export default function Login() { return <Suspense><LoginForm /></Suspense>; }
