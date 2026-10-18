import Link from "next/link"; import { thumbUrl } from "@/lib/storage";
export default function RowCard({ e }: { e: any }) {
  return (<Link href={`/episode/${e.episode_number}`} className="group relative flex-shrink-0 w-[220px] sm:w-[260px] snap-start">
    <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 ring-1 ring-white/5 group-hover:ring-brand transition">
      <img src={thumbUrl(e.thumbnail_path)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center text-sm">▶</span>
      </div>
      <span className="absolute top-2 left-2 bg-black/70 text-[10px] font-semibold px-2 py-0.5 rounded">EP {e.episode_number}</span>
    </div>
    <div className="mt-2">
      <div className="text-sm font-medium truncate group-hover:text-brand transition">{e.title}</div>
      <div className="text-xs text-white/45">{new Date(e.published_at).toLocaleDateString()}</div>
    </div>
  </Link>);
}
