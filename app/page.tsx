import Link from "next/link"; import { db } from "@/lib/db"; import RankCard from "@/components/RankCard"; import RowCard from "@/components/RowCard"; import HistoryRow from "@/components/HistoryRow"; import { thumbUrl } from "@/lib/storage"; import { logView } from "@/lib/analytics";
export default async function Home() {
  await logView("/");
  const { data: all } = await db.from("episodes").select("*").eq("published", true).lte("published_at", new Date().toISOString()).order("episode_number", { ascending: false });
  const latest = all?.[0];
  const top10 = (all ?? []).slice(0, 10);

  return (<div>
    {latest && (<>
      <section className="relative w-full aspect-[3/4] sm:aspect-[16/9] md:aspect-[21/9] bg-zinc-900 overflow-hidden">
        <img src={thumbUrl(latest.thumbnail_path)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5 md:p-12 max-w-xl">
          <div className="text-brand text-xs font-extrabold tracking-[0.3em] mb-3">S E R I E S</div>
          <h1 className="font-display text-4xl md:text-6xl tracking-wide leading-none drop-shadow-lg">{latest.title}</h1>
          <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm text-white/80 font-medium">
            <span>{new Date(latest.published_at).getFullYear()}</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>Episode {latest.episode_number}</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span className="border border-white/40 px-1.5 rounded text-[10px]">HD</span>
          </div>
          <p className="text-white/70 mt-3 text-sm md:text-base line-clamp-3">{latest.description}</p>
          <div className="flex gap-3 mt-5">
            <Link href={`/episode/${latest.episode_number}`} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition">▶ Watch Now</Link>
            <Link href={`/episode/${latest.episode_number}`} className="flex items-center gap-2 bg-white/15 backdrop-blur px-6 py-3 rounded-lg font-semibold hover:bg-white/25 transition">ⓘ More Info</Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <HistoryRow />
        {top10.length > 1 && (<section className="mt-8">
          <h2 className="font-display text-2xl tracking-wide mb-4">Top Episodes This Week</h2>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x pb-2 pl-8">
            {top10.map((e, i) => <RankCard key={e.id} e={e} rank={i + 1} />)}
          </div>
        </section>)}

        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl tracking-wide">Recently Added</h2>
            <Link href="/episodes" className="text-sm text-brand hover:underline">See All Episodes →</Link>
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x pb-2">
            {(all ?? []).slice(0, 12).map((e) => <RowCard key={e.id} e={e} />)}
          </div>
        </section>

        <section className="mt-12 mb-10 rounded-xl bg-zinc-900 border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl tracking-wide">Can't find what you're looking for?</h3>
            <p className="text-white/50 text-sm mt-1">Request a video and we'll try to add it.</p>
          </div>
          <Link href="/request" className="bg-brand px-6 py-3 rounded-lg font-semibold whitespace-nowrap">Request a Video</Link>
        </section>
      </div>
    </>)}
  </div>);
}
