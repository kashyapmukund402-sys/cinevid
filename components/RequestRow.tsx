"use client"; import { useState } from "react"; import { useRouter } from "next/navigation";
const OPTIONS = ["pending", "reviewing", "approved", "rejected", "completed"];
export default function RequestRow({ r }: { r: any }) {
  const router = useRouter(); const [status, setStatus] = useState(r.status); const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    await fetch("/api/admin/requests", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: r.id, status }) });
    setBusy(false); router.refresh();
  }
  return (<tr className="border-t border-white/10 align-top">
    <td className="py-3 pr-3">{r.title}{r.reference_link && <div><a href={r.reference_link} target="_blank" className="text-xs text-brand hover:underline">reference link</a></div>}</td>
    <td className="py-3 pr-3 text-white/60 max-w-xs">{r.description || "—"}</td>
    <td className="py-3 pr-3 text-white/50 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
    <td className="py-3 pr-3">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-black border border-white/20 rounded-lg px-2 py-1 text-sm">
        {OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </td>
    <td className="py-3"><button onClick={save} disabled={busy || status === r.status} className="text-brand disabled:opacity-30 text-sm">{busy ? "Saving…" : "Save"}</button></td>
  </tr>);
}
