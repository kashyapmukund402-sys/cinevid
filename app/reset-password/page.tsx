"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
function ResetForm() {
  const sp = useSearchParams(); const router = useRouter();
  const requestMode = sp.get("mode") === "request";
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function sendLink(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/reset-password` });
    setBusy(false); setMsg("Agar ye email registered hai to reset link bhej diya gaya hai.");
  }
  async function setNew(e: React.FormEvent) {
    e.preventDefault(); if (password.length < 8) return setMsg("Password kam se kam 8 characters ka ho");
    setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setBusy(false);
    if (error) return setMsg("Password update nahi hua. Link dobara request karein.");
    router.push("/login");
  }
  return (<div className="max-w-sm mx-auto mt-20 bg-zinc-900 border border-white/10 rounded-xl p-8">
    {requestMode
      ? <form onSubmit={sendLink} className="space-y-4"><h1 className="text-xl font-bold">Password reset</h1>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5" />
          <button disabled={busy} className="w-full bg-brand disabled:opacity-40 py-2.5 rounded-lg font-semibold">Reset link bhejein</button></form>
      : <form onSubmit={setNew} className="space-y-4"><h1 className="text-xl font-bold">Naya password</h1>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 8)" className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5" />
          <button disabled={busy} className="w-full bg-brand disabled:opacity-40 py-2.5 rounded-lg font-semibold">Save</button></form>}
    {msg && <p className="text-sm text-white/70 mt-4">{msg}</p>}
  </div>);
}
export default function Reset() { return <Suspense><ResetForm /></Suspense>; }
