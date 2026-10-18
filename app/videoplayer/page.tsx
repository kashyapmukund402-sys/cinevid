"use client";
import { useEffect, useRef, useState } from "react";
type Src = { kind: "mp4" | "hls" | "youtube"; src: string };

// Accepts only https links to direct media (mp4/webm/ogg/mov, .m3u8) or YouTube.
// Plays in the browser only; the server never fetches the URL.
function parse(input: string): { src?: Src; error?: string } {
  let u: URL;
  try { u = new URL(input.trim()); } catch { return { error: "Valid URL dalein (https://...)" }; }
  if (u.protocol !== "https:") return { error: "Sirf https:// links allowed hain" };
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com") {
    const id = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
    if (!id || !/^[\w-]{11}$/.test(id)) return { error: "YouTube video ka valid link dalein" };
    return { src: { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}` } };
  }
  const path = u.pathname.toLowerCase();
  if (/\.(mp4|webm|ogg|mov)$/.test(path)) return { src: { kind: "mp4", src: u.toString() } };
  if (/\.m3u8$/.test(path)) return { src: { kind: "hls", src: u.toString() } };
  return { error: "Ye direct video link nahi lag raha. MP4, WebM, HLS (.m3u8) ya YouTube link dalein." };
}

export default function VideoPlayerPage() {
  const [input, setInput] = useState(""); const [src, setSrc] = useState<Src | null>(null); const [err, setErr] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  function load(e: React.FormEvent) {
    e.preventDefault();
    const r = parse(input);
    if (!r.src) { setSrc(null); return setErr(r.error || "Unsupported link"); }
    setErr(""); setSrc(r.src);
  }

  // HLS: native on Safari, hls.js (free CDN, pinned version) elsewhere
  useEffect(() => {
    if (!src || src.kind !== "hls" || !videoRef.current) return;
    const v = videoRef.current; let hls: any;
    const attach = () => {
      const Hls = (window as any).Hls;
      if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = src.src; return; }
      if (Hls?.isSupported()) {
        hls = new Hls(); hls.loadSource(src.src); hls.attachMedia(v);
        hls.on(Hls.Events.ERROR, (_: any, d: any) => { if (d.fatal) setErr("Stream load nahi hua. Link check karein."); });
      } else setErr("Ye browser HLS support nahi karta");
    };
    if ((window as any).Hls) attach();
    else {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js"; s.onload = attach;
      document.body.appendChild(s);
    }
    return () => { hls?.destroy(); };
  }, [src]);

  return (<div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Video Player</h1>
      <p className="text-white/60 text-sm mt-1">MP4, WebM, HLS (.m3u8) ya YouTube link paste karein. Sirf wahi links jinke rights aapke paas hain.</p>
    </div>
    <form onSubmit={load} className="flex flex-col sm:flex-row gap-2">
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://..." className="flex-1 min-w-0 bg-zinc-900 border border-white/15 focus:border-brand rounded-lg px-4 py-3 outline-none" />
      <button className="bg-brand px-6 py-3 rounded-lg font-semibold">Play</button>
    </form>
    {err && <p className="text-red-400 text-sm">{err}</p>}
    {src && (<div className="rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl">
      {src.kind === "youtube"
        ? <iframe src={src.src} className="w-full aspect-video" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen title="YouTube video" />
        : src.kind === "mp4"
          ? <video src={src.src} controls playsInline preload="metadata" className="w-full aspect-video" onError={() => setErr("Video load nahi hua. Link ya format check karein.")} />
          : <video ref={videoRef} controls playsInline className="w-full aspect-video" />}
    </div>)}
  </div>);
}
