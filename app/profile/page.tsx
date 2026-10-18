"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
export default function Profile() {
  const [p, setP] = useState<any>(null); const [loggedOut, setLoggedOut] = useState(false);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return setLoggedOut(true);
      const { data: prof } = await supabase.from("profiles").select("username,email,created_at,premium_until,free_until").eq("id", data.session.user.id).maybeSingle();
      setP({ userId: data.session.user.id, ...prof });
    })();
  }, []);
  if (loggedOut) return <div className="max-w-md mx-auto mt-20 text-center"><Link href="/login?next=/profile" className="bg-brand px-6 py-2.5 rounded-lg font-semibold">Login</Link></div>;
  if (!p) return <div className="max-w-md mx-auto mt-20 text-white/60">Loading…</div>;
  const active = (t?: string) => !!t && Date.parse(t) > Date.now();
  const status = active(p.premium_until) ? `Premium till ${new Date(p.premium_until).toLocaleString()}` : active(p.free_until) ? `Free access till ${new Date(p.free_until).toLocaleString()}` : "Free access nahi hai";
  return (<div className="max-w-md mx-auto mt-20 bg-zinc-900 border border-white/10 rounded-xl p-8 space-y-3 text-sm">
    <h1 className="text-xl font-bold mb-2">Profile</h1>
    <div><span className="text-white/50">Username:</span> {p.username || "-"}</div>
    <div><span className="text-white/50">Email:</span> {p.email}</div>
    <div><span className="text-white/50">User ID:</span> <span className="font-mono break-all select-all">{p.userId}</span></div>
    <div><span className="text-white/50">Joined:</span> {p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}</div>
    <div><span className="text-white/50">Status:</span> {status}</div>
    <div className="flex gap-3 pt-4">
      <Link href="/key" className="bg-brand px-5 py-2 rounded-lg font-semibold">Get Key</Link>
      <button onClick={async () => { await supabase.auth.signOut(); location.href = "/"; }} className="bg-white/10 px-5 py-2 rounded-lg">Logout</button></div>
  </div>);
}
