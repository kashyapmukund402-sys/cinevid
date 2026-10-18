"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { pushHistory } from "@/components/HistoryRow";
import { pushDownload } from "@/components/DownloadsList";
import { PLANS } from "@/lib/plans";

type Status = { loggedIn: boolean; tier: "premium" | "free" | "none"; expiresAt?: string | null; userId?: string };
type FreeStatus = { loggedIn: boolean; task: { id: string; status: string } | null; shrinkUrl: string | null; cooldownUntil: string | null; open: boolean };

// Sends the Supabase session token; the server verifies it and derives the user ID.
async function authed(path: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(path, { ...init, headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) } });
}

export default function Gate({ n, title, poster }: { n: number; title: string; poster: string }) {
  const [session, setSession] = useState<any>(undefined);
  const [status, setStatus] = useState<Status | null>(null);
  const [fs, setFs] = useState<FreeStatus | null>(null);
  const [url, setUrl] = useState(""); const [dl, setDl] = useState("");
  const [direct, setDirect] = useState(true); const [ext, setExt] = useState(false); const [failed, setFailed] = useState(false);
  const [err, setErr] = useState(""); const [info, setInfo] = useState(""); const [busy, setBusy] = useState(false);
  const [newKey, setNewKey] = useState(""); const [keyInput, setKeyInput] = useState("");
  const upi = process.env.NEXT_PUBLIC_UPI_ID;

  const loadStatus = async () => { const r = await authed("/api/access/status"); setStatus(await r.json()); };
  const loadFree = async () => { const r = await authed("/api/free/status"); setFs(await r.json()); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (session === undefined) return;
    if (!session) setStatus({ loggedIn: false, tier: "none" }); else loadStatus();
  }, [session]);
  useEffect(() => { if (status?.loggedIn && status.tier === "none") loadFree(); }, [status?.loggedIn, status?.tier]);

  async function unlock() {
    setBusy(true); setErr("");
    const r = await authed("/api/unlock", { method: "POST", body: JSON.stringify({ n }) });
    const j = await r.json(); setBusy(false);
    if (r.ok) { setUrl(j.url); setDl(j.downloadUrl); setDirect(j.direct !== false); setExt(!!j.external); pushHistory({ n, title, thumb: poster }); }
    else { setErr(j.error || "Failed"); if (j.code === "NO_ACCESS") loadStatus(); }
  }
  // Auto-open the video once the server confirms access
  useEffect(() => { if (status && status.tier !== "none" && !url) unlock(); /* eslint-disable-next-line */ }, [status?.tier]);

  // Step 1: create task on the server, then send the user to the Shrink link
  async function startTask() {
    setBusy(true); setErr(""); setInfo("");
    const r = await authed("/api/free/task", { method: "POST" });
    const j = await r.json(); setBusy(false);
    if (!r.ok) { setErr(j.error || "Task shuru nahi hua"); return; }
    if (j.status === "started" && j.shrinkUrl) { window.location.href = j.shrinkUrl; return; }
    setInfo("Aapka task pehle se chal raha hai."); loadFree();
  }
  // Step 2 (after admin verification): claim the one-time key
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
    if (r.ok) { setKeyInput(""); setNewKey(""); await loadStatus(); } else setErr(j.error || "Failed");
  }

  const safe = (u: string) => /^https?:\/\//i.test(u);
  const box = "rounded-xl bg-zinc-900 border border-white/10 p-6";
  const btn = "bg-brand disabled:opacity-40 px-6 py-2.5 rounded-lg font-semibold";

  if (!status) return <div className="w-full aspect-video bg-zinc-900 rounded-xl animate-pulse" />;

  // 1) Not logged in
  if (!status.loggedIn) return (
    <div className={`${box} text-center`}>
      <h3 className="font-semibold mb-2">Login karein video dekhne ke liye</h3>
      <p className="text-white/60 text-sm mb-4">Google se login karein, phir Free Access ya Premium se video khul jayega.</p>
      <a href={`/login?next=${encodeURIComponent(`/episode/${n}`)}`} className={btn}>Login / Register</a>
    </div>
  );

  // 2) Video unlocked
  if (url) return (<div>
    <div className="flex flex-wrap items-center justify-between gap-2 bg-green-600/20 text-green-400 rounded-lg px-4 py-2 mb-3 text-sm">
      <span>✓ Unlocked · {status.tier === "premium" ? "Premium" : "Free 24h"}</span>
      {status.expiresAt && <span className="text-white/60">Expires: {new Date(status.expiresAt).toLocaleString()}</span>}
    </div>
    {direct && !failed && safe(url)
      ? <video src={url} poster={poster} controls playsInline preload="metadata" onError={() => setFailed(true)} className="w-full aspect-video bg-black rounded-xl" />
      : <div className="w-full aspect-video bg-black rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center">
          {safe(url) && <a href={url} target="_blank" rel="noopener noreferrer" className="bg-brand px-8 py-3 rounded-lg font-semibold">▶ Play Video</a>}
          <p className="text-xs text-white/50">This video opens in a new tab.</p></div>}
    {dl && safe(dl) && <a href={dl} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} onClick={() => pushDownload({ n, title, thumb: poster })} className="inline-flex items-center gap-2 mt-3 text-sm text-white/70 hover:text-white">⬇ Download Episode</a>}
  </div>);

  // 3) Access confirmed, video loading
  if (status.tier !== "none") return (<div className={`${box} text-center text-white/60`}>
    {busy ? "Video load ho raha hai…" : (err || "Video load nahi hua.")}
    {!busy && <div><button onClick={unlock} className="mt-4 bg-brand px-6 py-2 rounded-lg font-semibold">Try again</button></div>}
  </div>);

  // 4) Logged in, no access
  const task = fs?.task?.status;
  const cooling = fs?.cooldownUntil && Date.parse(fs.cooldownUntil) > Date.now();
  return (<div className="space-y-4">
    <div className={box}>
      <h3 className="font-semibold">Free 24-Hour Access</h3>
      <p className="text-white/60 text-sm mt-1 mb-4">Ek short task complete karein. Admin verify karega, phir 24 ghante ki key milegi.</p>

      {cooling ? <p className="text-sm text-white/70">Agla free access: {new Date(fs!.cooldownUntil!).toLocaleString()} ke baad.</p>
       : task === "returned" ? (<div className="space-y-3">
          <p className="text-sm text-white/70">Task submit ho gaya. Verification pending hai.</p>
          <button onClick={loadFree} className="bg-white/10 px-5 py-2 rounded-lg text-sm">Refresh status</button></div>)
       : task === "verified" ? (newKey ? null : <button onClick={claimKey} disabled={busy} className={btn}>Get my key</button>)
       : task === "started" ? (<button onClick={startTask} disabled={busy} className={btn}>Continue to task</button>)
       : (<button onClick={startTask} disabled={busy} className={btn}>{busy ? "Ruko…" : "Get Free Access"}</button>)}

      {newKey && (<div className="mt-4">
        <div className="font-mono text-lg tracking-wider bg-black rounded-lg px-4 py-3 select-all break-all">{newKey}</div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => navigator.clipboard?.writeText(newKey)} className="text-sm bg-white/10 px-4 py-2 rounded-lg">Copy</button>
          <button onClick={() => setKeyInput(newKey)} className="text-sm bg-brand px-4 py-2 rounded-lg font-semibold">Use this key</button>
        </div>
        <p className="text-xs text-white/50 mt-2">Yeh key sirf ek baar dikhti hai. Save kar lein.</p>
      </div>)}

      <div className="flex gap-2 mt-5">
        <input value={keyInput} onChange={(e) => setKeyInput(e.target.value.toUpperCase())} placeholder="CINE-XXXXX-XXXXX-XXXXX-XXXXX"
          className="flex-1 min-w-0 bg-black border border-white/20 rounded-lg px-4 py-2.5 font-mono text-sm focus:border-brand outline-none" />
        <button onClick={redeem} disabled={busy || keyInput.length < 10} className="bg-white/10 disabled:opacity-40 px-5 rounded-lg font-semibold">Redeem</button>
      </div>
    </div>

    <div className={box}>
      <h3 className="font-semibold">Premium</h3>
      <p className="text-white/60 text-sm mt-1">Premium mein task ki zaroorat nahi, direct video.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {Object.entries(PLANS).map(([id, p]) => (
          <div key={id} className="rounded-lg border border-white/10 p-4">
            <div className="text-sm text-white/60">{p.label}</div>
            <div className="text-2xl font-bold">₹{p.price}</div>
          </div>))}
      </div>
      <div className="mt-4 text-sm text-white/70 space-y-1">
        <p>1. {upi ? <>UPI karein: <span className="font-mono">{upi}</span></> : "UPI ID admin se lein."}</p>
        <p>2. Payment screenshot aur neeche wali User ID admin ko bhejein.</p>
        <p>3. Admin verify karke Premium activate karega.</p>
      </div>
      {status.userId && <div className="mt-3 text-xs text-white/50">Your User ID: <span className="font-mono select-all break-all">{status.userId}</span></div>}
    </div>
    {err && <p className="text-red-400 text-sm">{err}</p>}
    {info && <p className="text-white/60 text-sm">{info}</p>}
  </div>);
}
