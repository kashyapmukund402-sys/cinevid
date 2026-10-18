"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
function ReturnInner() {
  const sp = useSearchParams(); const taskId = sp.get("t") ?? "";
  const [msg, setMsg] = useState("Checking…"); const [ok, setOk] = useState(false);
  useEffect(() => {
    (async () => {
      if (!taskId) return setMsg("Task ID nahi mili. /key se dobara shuru karein.");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return setMsg("Pehle login karein, phir task dobara shuru karein.");
      const r = await fetch("/api/free/return", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ taskId }) });
      const j = await r.json(); setOk(r.ok && !!j.ok); setMsg(j.message || j.error || "Failed");
    })();
  }, [taskId]);
  return (<div className="max-w-md mx-auto mt-24 text-center bg-zinc-900 rounded-xl p-8 border border-white/10">
    <h1 className="text-xl font-bold mb-3">Free Access Task</h1>
    <p className={ok ? "text-green-400" : "text-white/70"}>{msg}</p>
    <p className="text-xs text-white/50 mt-3">Yeh "submitted" hai. Verification admin karega.</p>
    <Link href="/key" className="inline-block mt-6 bg-brand px-6 py-2.5 rounded-lg font-semibold">Key page</Link>
  </div>);
}
export default function FreeReturn() { return <Suspense><ReturnInner /></Suspense>; }
