"use client";
import Link from "next/link"; import { useEffect, useState } from "react"; import { publicThumb } from "@/lib/publicThumb";
type Item = { n: number; title: string; thumb: string; at: number };
export function pushHistory(item: Omit<Item, "at">) {
  try {
    const raw = localStorage.getItem("cine_history"); const list: Item[] = raw ? JSON.parse(raw) : [];
    const next = [{ ...item, at: Date.now() }, ...list.filter((x) => x.n !== item.n)].slice(0, 20);
    localStorage.setItem("cine_history", JSON.stringify(next));
  } catch {}
}
export default function HistoryRow() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("cine_history") ?? "[]")); } catch {} }, []);
  if (!items.length) return null;
  return (<section className="mt-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-2xl tracking-wide">Continue Watching</h2>
      <button onClick={() => { localStorage.removeItem("cine_history"); setItems([]); }} className="text-xs text-white/40 hover:text-white/70">Clear</button>
    </div>
    <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x pb-2">
      {items.map((it) => (<Link key={it.n} href={`/episode/${it.n}`} className="group relative flex-shrink-0 w-[220px] sm:w-[260px] snap-start">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 ring-1 ring-white/5 group-hover:ring-brand transition">
          <img src={it.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="mt-2 text-sm font-medium truncate group-hover:text-brand transition">{it.title}</div>
      </Link>))}
    </div>
  </section>);
}
