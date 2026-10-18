"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
type FreeStatus = { task: { id: string; status: string } | null; shrinkUrl: string | null; cooldownUntil: string | null };

// Same server flow as the video gate: task -> Shrink -> admin verify -> claim key -> redeem.
// Every step is enforced on the server; this component only displays state.
export default function FreeKeyPanel({ onAccessGranted }: { onAccessGranted?: () => void }) {
  const [fs, setFs] = useState<FreeStatus | null>(null);
  const [newKey, setNewKey] = useState(""); const [keyInput, setKeyInput] = useState("");
  const [err, setErr] = useState(""); const [info, setInfo] = useState(""); const [busy, setBusy] = useState(false);

  async function authed(path: string, init: RequestInit = {}) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return fetch(path, { ...init, headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) } });
  }
  const loadFree = async () => { const r = await authed("/api/free/status"); setFs(await r.json()); };
  useEffect(() => { loadFree(); }, []);

  async function startTask() {
    setBusy(true); setErr(""); setInfo("");
    const r = await authed("/api/free/task", { method: "POST" });
    const j = await r.json(); setBusy(false);
    if (!r.ok) return setErr(j.error || "Task shuru nahi hua");
    if (j.status === "started" && j.shrinkUrl) { window.location.href = j.shrinkUrl; return; }
    setInfo("Aapka task pehle se chal raha hai."); loadFree();
  }
  async function claimKey() {
    setBusy(true); setErr("");
    const r = await authed("/api/free/claim", { method: "POST" });
    const j = await r.json(); setBusy(false);
    if (r.ok) { setNewKey(j.key); loadFree(); } else setErr(j.error || "Key nahi mili");
  }
  async function redeem() {
    setBusy(true); setErr("");
    const r = await authed("/api/access/redeem", { method: "POST", body: JSON.stringify({ key: keyInput }) });
    const j = await r.json(); setBusy(false);
    if (r.ok) { setKeyInput(""); setNewKey(""); setInfo(`Access active till ${new Date(j.expiresAt).toLocaleString()}`); onAccessGranted?.(); loadFree(); }
    else setErr(j.error || "Failed");
  }

  const btn = "bg-brand disabled:opacity-40 px-6 py-2.5 rounded-lg font-semibold";
  const cooling = fs?.cooldownUntil && Date.parse(fs.cooldownUntil) > Date.now();
  const task = fs?.task?.status;
  return (<div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-4">
    <h2 className="font-semibold text-lg">Free 24-Hour Key</h2>
    {!fs ? <p className="text-white/50 text-sm">Loading…</p>
     : cooling ? <p className="text-sm text-white/70">Agla free key: {new Date(fs.cooldownUntil!).toLocaleString()} ke baad.</p>
     : task === "returned" ? (<div className="space-y-3"><p className="text-sm text-white/70">Task submit ho gaya. Verification pending hai.</p>
        <button onClick={loadFree} className="bg-white/10 px-5 py-2 rounded-lg text-sm">Refresh status</button></div>)
     : task === "verified" ? (newKey ? null : <button onClick={claimKey} disabled={busy} className={btn}>Get my key</button>)
     : task === "started" ? <button onClick={startTask} disabled={busy} className={btn}>Continue to task</button>
     : <button onClick={startTask} disabled={busy} className={btn}>{busy ? "Ruko…" : "Generate Free Key"}</button>}

    {newKey && (<div>
      <div className="font-mono text-lg tracking-wider bg-black rounded-lg px-4 py-3 select-all break-all">{newKey}</div>
      <div className="flex gap-2 mt-2">
        <button onClick={() => navigator.clipboard?.writeText(newKey)} className="text-sm bg-white/10 px-4 py-2 rounded-lg">Copy</button>
        <button onClick={() => setKeyInput(newKey)} className="text-sm bg-brand px-4 py-2 rounded-lg font-semibold">Use this key</button></div>
      <p className="text-xs text-white/50 mt-2">Key sirf ek baar dikhti hai aur 24 ghante mein redeem karni hai.</p></div>)}

    <div className="flex gap-2">
      <input value={keyInput} onChange={(e) => setKeyInput(e.target.value.toUpperCase())} placeholder="CINE-XXXXX-XXXXX-XXXXX-XXXXX"
        className="flex-1 min-w-0 bg-black border border-white/20 rounded-lg px-4 py-2.5 font-mono text-sm focus:border-brand outline-none" />
      <button onClick={redeem} disabled={busy || keyInput.length < 10} className="bg-white/10 disabled:opacity-40 px-5 rounded-lg font-semibold">Redeem</button>
    </div>
    {err && <p className="text-red-400 text-sm">{err}</p>}
    {info && <p className="text-white/70 text-sm">{info}</p>}
  </div>);
}
