"use client"; import { useState } from "react";
export default function RequestPage() {
  const [sent, setSent] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(ev: any) {
    ev.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(ev.target);
    const r = await fetch("/api/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(f)) });
    const j = await r.json(); setBusy(false);
    r.ok ? setSent(true) : setErr(j.error || "Something went wrong");
  }
  const c = "w-full bg-black border border-white/20 rounded-lg p-3";
  if (sent) return (<div className="max-w-md mx-auto mt-24 text-center bg-zinc-900 rounded-xl p-8 border border-white/10">
    <div className="text-4xl mb-3">✓</div>
    <h1 className="font-display text-2xl tracking-wide mb-2">Request Received</h1>
    <p className="text-white/60 text-sm">Your request has been received! Our team will review it soon.</p></div>);
  return (<form onSubmit={submit} className="max-w-lg mx-auto px-4 py-16 space-y-3">
    <h1 className="font-display text-3xl tracking-wide">Request a Video</h1>
    <p className="text-white/50 text-sm mb-4">Can't find something you're looking for? Let us know and we'll try to add it.</p>
    <input name="title" placeholder="Video title *" required className={c} />
    <textarea name="description" placeholder="Description (optional)" rows={4} className={c} />
    <input name="reference_link" placeholder="Reference link (optional)" className={c} />
    {err && <p className="text-red-400 text-sm">{err}</p>}
    <button disabled={busy} className="bg-brand disabled:opacity-40 px-8 py-3 rounded-lg font-semibold">{busy ? "Submitting…" : "Submit Request"}</button>
  </form>);
}
