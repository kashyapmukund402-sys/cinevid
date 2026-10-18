import Link from "next/link"; import { thumbUrl } from "@/lib/storage";
export default function Card({ e }: { e: any }) {
  return (<Link href={`/episode/${e.episode_number}`} className="group block rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-brand/60 transition">
    <div className="aspect-video bg-zinc-800"><img src={thumbUrl(e.thumbnail_path)} alt="" loading="lazy" className="w-full h-full object-cover" /></div>
    <div className="p-3"><div className="text-xs text-brand font-semibold">EPISODE {e.episode_number}</div>
      <div className="font-medium truncate">{e.title}</div>
      <div className="text-xs text-white/50 mt-1">{new Date(e.published_at).toLocaleDateString()}</div>
      <div className="mt-3 text-center bg-brand rounded-lg py-2 text-sm font-semibold">Watch</div></div></Link>);
}
