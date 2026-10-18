"use client";
import { useState } from "react";
import { PLANS, PlanId } from "@/lib/plans";
export default function PremiumAdmin() {
  const [who, setWho] = useState(""); const [plan, setPlan] = useState<PlanId>("30d");
  const [msg, setMsg] = useState(""); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false);
  async function grant() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/premium", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ who, plan }) });
    const j = await r.json(); setBusy(false); setOk(r.ok);
    setMsg(r.ok ? `✓ ${PLANS[plan].label} Premium activate. Valid till ${new Date(j.premium_until).toLocaleString()}` : j.error || "Failed");
  }
  return (<div className="max-w-xl">
    <h1 className="text-2xl font-bold mb-1">Premium Users</h1>
    <p className="text-white/60 text-sm mb-6">UPI payment verify karne ke baad User ID ya email daal kar Premium activate karein. Existing premium time ke upar stack hota hai.</p>
    <div className="space-y-4 bg-zinc-900 border border-white/10 rounded-xl p-6">
      <div><label className="text-sm text-white/70">User ID ya Email</label>
        <input value={who} onChange={(e) => setWho(e.target.value)} className="w-full mt-1 bg-black border border-white/20 rounded-lg px-4 py-2.5 font-mono text-sm" /></div>
      <div><label className="text-sm text-white/70">Plan</label>
        <select value={plan} onChange={(e) => setPlan(e.target.value as PlanId)} className="w-full mt-1 bg-black border border-white/20 rounded-lg px-4 py-2.5">
          {Object.entries(PLANS).map(([id, p]) => <option key={id} value={id}>{p.label} — ₹{p.price}</option>)}
        </select></div>
      <button onClick={grant} disabled={busy || !who.trim()} className="bg-brand disabled:opacity-40 px-6 py-2.5 rounded-lg font-semibold">{busy ? "Activating…" : "Activate Premium"}</button>
      {msg && <p className={`text-sm ${ok ? "text-green-400" : "text-red-400"}`}>{msg}</p>}
    </div></div>);
}
