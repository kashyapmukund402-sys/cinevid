"use client"; import { useState } from "react"; import { useRouter } from "next/navigation";
async function up(kind: "thumb", f: File) {
  const s = await fetch("/api/admin/sign", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, filename: f.name, size: f.size }) });
  const j = await s.json(); if (!s.ok) throw new Error(j.error);
  const fd = new FormData(); fd.append("cacheControl", "3600"); fd.append("", f);
  const r = await fetch(j.url, { method: "PUT", body: fd }); if (!r.ok) throw new Error("Upload failed"); return j.path as string;
}
const validUrl = (s: string) => { try { return /^https?:$/.test(new URL(s).protocol); } catch { return false; } };
export default function EpisodeForm({ ep }: { ep?: any }) {
  const r = useRouter(); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  // Old episodes (uploaded file, no URL yet) may keep their file by leaving the URL empty.
  const legacy = !!ep && !!ep.video_path && !ep.video_url;
  async function submit(ev: any) {
    ev.preventDefault(); setBusy(true); setMsg("");
    try {
      const f = new FormData(ev.target); const body: any = Object.fromEntries(f); body.id = ep?.id; body.published = f.get("published") === "on";
      const t = f.get("thumb") as File; delete body.thumb;
      body.video_url = String(f.get("video_url") ?? "").trim();
      if (body.video_url && !validUrl(body.video_url)) throw new Error("Invalid Video URL. Enter a full link starting with http:// or https://");
      if (!body.video_url && !legacy) throw new Error("Video URL is required");
      body.download_url = String(f.get("download_url") ?? "").trim();
      if (body.download_url && !validUrl(body.download_url)) throw new Error("Invalid Download URL");
      if (t?.size) { setMsg("Uploading thumbnail…"); body.thumbnail_path = await up("thumb", t); }
      setMsg("Saving…"); const res = await fetch("/api/admin/episode", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await res.json(); if (!res.ok) throw new Error(j.error); r.push("/admin"); r.refresh();
    } catch (e: any) { setMsg("Error: " + e.message); setBusy(false); }
  }
  const c = "w-full bg-black border border-white/20 rounded-lg p-3";
  return (<form onSubmit={submit} className="max-w-xl space-y-3">
    <h1 className="text-2xl font-bold">{ep ? "Edit" : "Add"} Episode</h1>
    <input name="episode_number" type="number" min={1} defaultValue={ep?.episode_number} placeholder="Episode number" required className={c} />
    <input name="title" defaultValue={ep?.title} placeholder="Title" required className={c} />
    <textarea name="description" defaultValue={ep?.description} placeholder="Description" rows={4} className={c} />
    <label className="block text-sm">Video URL{legacy && " – leave empty to keep the current uploaded video"}<input name="video_url" type="text" inputMode="url" defaultValue={ep?.video_url ?? ""} placeholder="https://example.com/video.mp4" required={!legacy} className={c} /></label>
    <label className="block text-sm">Download link (optional, https only)<input name="download_url" type="text" inputMode="url" defaultValue={(ep as any)?.download_url ?? ""} placeholder="https://your-host.com/episode.mp4" className={c} /></label>
    <label className="block text-sm">Thumbnail (jpg/png/webp){ep && " – leave empty to keep current"}<input name="thumb" type="file" accept="image/*" className={c} /></label>
    <input name="pin" inputMode="numeric" pattern="\d{4}" maxLength={4} placeholder={ep ? "New 4-digit password (empty = keep)" : "4-digit password"} required={!ep} className={c} />
    <label className="block text-sm">Publish date<input name="published_at" type="datetime-local" defaultValue={ep ? new Date(ep.published_at).toISOString().slice(0, 16) : ""} className={c} /></label>
    <div className="flex gap-3"><input name="prev_episode" type="number" defaultValue={ep?.prev_episode ?? ""} placeholder="Previous # (optional)" className={c} /><input name="next_episode" type="number" defaultValue={ep?.next_episode ?? ""} placeholder="Next # (optional)" className={c} /></div>
    <label className="flex items-center gap-2"><input name="published" type="checkbox" defaultChecked={ep?.published ?? true} /> Published</label>
    {msg && <p className="text-sm text-yellow-300">{msg}</p>}
    <button disabled={busy} className="bg-brand disabled:opacity-40 px-8 py-3 rounded-lg font-semibold">{busy ? "Please wait…" : "Publish"}</button></form>);
}
