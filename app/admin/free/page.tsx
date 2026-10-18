"use client";
import { useEffect, useState } from "react";
export default function FreeAdmin() {
  const [tasks, setTasks] = useState<any[]>([]); const [shrink, setShrink] = useState(""); const [cd, setCd] = useState(24);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function load() {
    const r = await fetch("/api/admin/free-tasks?status=returned"); if (!r.ok) return setMsg("Unauthorized");
    const j = await r.json(); setTasks(j.tasks); setShrink(j.settings.shrinkUrl ?? ""); setCd(j.settings.cooldownHours);
  }
  useEffect(() => { load(); }, []);
  async function decide(id: string, action: "verify" | "reject") {
    setBusy(true); const r = await fetch("/api/admin/free-tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action }) });
    const j = await r.json(); setBusy(false); setMsg(r.ok ? `Task ${action === "verify" ? "verified" : "rejected"}` : j.error); load();
  }
  async function save() {
    setBusy(true); const r = await fetch("/api/admin/free-settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ shrink_url: shrink, cooldown_hours: cd }) });
    const j = await r.json(); setBusy(false); setMsg(r.ok ? "Settings saved" : j.error);
  }
  return (<div className="max-w-3xl space-y-8">
    <section className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-4">
      <h2 className="font-semibold">Shrink Earn settings</h2>
      <input value={shrink} onChange={(e) => setShrink(e.target.value)} placeholder="https://shrinkearn-link..." className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 font-mono text-sm" />
      <label className="block text-sm text-white/70">Cooldown after free access ends (hours)
        <input type="number" min={0} max={168} value={cd} onChange={(e) => setCd(Number(e.target.value))} className="ml-2 w-24 bg-black border border-white/20 rounded-lg px-3 py-1.5" /></label>
      <button onClick={save} disabled={busy} className="bg-brand disabled:opacity-40 px-6 py-2.5 rounded-lg font-semibold">Save</button>
    </section>
    <section className="bg-zinc-900 border border-white/10 rounded-xl p-6">
      <h2 className="font-semibold mb-1">Returned tasks waiting for verification</h2>
      <p className="text-xs text-white/50 mb-4">Shrink dashboard mein check karein ki is user ka task sach mein complete hua. Verify karne se hi key banegi.</p>
      {msg && <p className="text-sm text-white/70 mb-3">{msg}</p>}
      {!tasks.length && <p className="text-white/50 text-sm">Koi pending task nahi.</p>}
      <div className="space-y-2">{tasks.map((t) => (<div key={t.id} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 rounded-lg p-3">
        <div className="text-sm"><div className="font-mono break-all">{t.email || t.user_id}</div>
          <div className="text-white/50 text-xs">Returned: {t.returned_at ? new Date(t.returned_at).toLocaleString() : "-"}</div></div>
        <div className="flex gap-2">
          <button disabled={busy} onClick={() => decide(t.id, "verify")} className="bg-green-600 disabled:opacity-40 px-4 py-2 rounded-lg text-sm font-semibold">Verify</button>
          <button disabled={busy} onClick={() => decide(t.id, "reject")} className="bg-white/10 disabled:opacity-40 px-4 py-2 rounded-lg text-sm">Reject</button>
        </div></div>))}</div>
    </section>
  </div>);
}
