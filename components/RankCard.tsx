import Link from "next/link"; import { thumbUrl } from "@/lib/storage";
export default function RankCard({ e, rank }: { e: any; rank: number }) {
  return (<Link href={`/episode/${e.episode_number}`} className="group relative flex-shrink-0 flex items-end w-[160px] sm:w-[200px] snap-start">
    <span className="select-none font-black text-[86px] sm:text-[110px] leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.18)] group-hover:[-webkit-text-stroke:2px_#e50914] transition-all -mr-6 sm:-mr-8 z-0">
      {rank}
    </span>
    <div className="relative z-10 w-[110px] sm:w-[140px] aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 ring-1 ring-white/10 group-hover:ring-brand transition shadow-lg">
      <img src={thumbUrl(e.thumbnail_path)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
    </div>
  </Link>);
}
