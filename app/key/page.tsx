"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import FreeKeyPanel from "@/components/FreeKeyPanel";
export default function KeyPage() {
  const [state, setState] = useState<"loading" | "out" | "premium" | "in">("loading");
  const [expires, setExpires] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return setState("out");
      const r = await fetch("/api/access/status", { headers: { authorization: `Bearer ${data.session.access_token}` } });
      const j = await r.json();
      if (j.tier === "premium") { setExpires(j.expiresAt); return setState("premium"); }
      setState("in");
    })();
  }, []);
  if (state === "loading") return <div className="max-w-xl mx-auto mt-20 text-white/50">Loading…</div>;
  if (state === "out") return (<div className="max-w-md mx-auto mt-20 bg-zinc-900 border border-white/10 rounded-xl p-8 text-center">
    <h1 className="text-xl font-bold mb-3">Pehle login karein</h1>
    <Link href="/login?next=/key" className="inline-block bg-brand px-6 py-2.5 rounded-lg font-semibold">Login</Link></div>);
  if (state === "premium") return (<div className="max-w-xl mx-auto mt-20 bg-zinc-900 border border-white/10 rounded-xl p-8">
    <h1 className="text-xl font-bold">Premium active hai</h1>
    <p className="text-white/70 text-sm mt-2">Premium mein key ki zaroorat nahi. Expires: {expires ? new Date(expires).toLocaleString() : "-"}</p></div>);
  return (<div className="max-w-xl mx-auto mt-20 space-y-4"><FreeKeyPanel onAccessGranted={() => setState("in")} /></div>);
}
