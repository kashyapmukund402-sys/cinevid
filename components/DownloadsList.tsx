"use client";
import Link from "next/link"; import { useEffect, useState } from "react"; import { publicThumb } from "@/lib/publicThumb";
type Item = { n: number; title: string; thumb: string; at: number };
export function pushDownload(item: Omit<Item, "at">) {
  try {
    const raw = localStorage.getItem("cine_downloads"); const list: Item[] = raw ? JSON.parse(raw) : [];
    const next = [{ ...item, at: Date.now() }, ...list.filter((x) => x.n !== item.n)].slice(0, 30);
    localStorage.setItem("cine_downloads", JSON.stringify(next));
  } catch {}
}
export default function DownloadsList() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("cine_downloads") ?? "[]")); } catch {} }, []);
  if (!items.length) return (<p className="text-white/40 text-sm mt-8">Your downloads will show up here once you download an episode.</p>);
  return (<div className="mt-8 space-y-3">
    {items.map((it) => (<Link key={it.n} href={`/episode/${it.n}`} className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-xl p-3 hover:border-brand/50 transition">
      <img src={it.thumb} alt="" className="w-24 aspect-video object-cover rounded-lg bg-zinc-800" />
      <div className="flex-1 min-w-0"><div className="font-medium truncate">{it.title}</div>
        <div className="text-xs text-white/40">Episode {it.n} · downloaded {new Date(it.at).toLocaleDateString()}</div></div>
      <span className="text-brand text-sm font-semibold whitespace-nowrap">Open →</span>
    </Link>))}
  </div>);
}
