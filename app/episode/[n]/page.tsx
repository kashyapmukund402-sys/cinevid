import Link from "next/link"; import { notFound, redirect } from "next/navigation"; import { db } from "@/lib/db"; import Gate from "@/components/Gate"; import Card from "@/components/Card"; import ShareButton from "@/components/ShareButton"; import { thumbUrl } from "@/lib/storage"; import { logView } from "@/lib/analytics";
const pub = () => db.from("episodes").select("id,episode_number,title,description,thumbnail_path,published_at,prev_episode,next_episode").eq("published", true).lte("published_at", new Date().toISOString());
export async function generateMetadata({ params }: any) {
  const { n } = await params; const { data: e } = await pub().eq("episode_number", Number(n)).maybeSingle(); if (!e) return {};
  return { title: `Episode ${e.episode_number}: ${e.title}`, description: e.description?.slice(0, 160), openGraph: { title: e.title, description: e.description?.slice(0, 160), images: [thumbUrl(e.thumbnail_path)] } };
}
export default async function Ep({ params }: any) {
  const { n } = await params;
  if (n === "latest") { const { data } = await pub().order("episode_number", { ascending: false }).limit(1); if (!data?.[0]) notFound(); redirect(`/episode/${data[0].episode_number}`); }
  const { data: e } = await pub().eq("episode_number", Number(n)).maybeSingle(); if (!e) notFound();
  await logView(`/episode/${n}`, e.episode_number);
  const { data: all } = await pub().order("episode_number", { ascending: true });
  const nums = (all ?? []).map((x) => x.episode_number);
  const isLatest = e.episode_number === Math.max(...nums);
  const i = nums.indexOf(e.episode_number);
  const prev = e.prev_episode ?? nums[i - 1], next = e.next_episode ?? nums[i + 1];
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  return (<div>
    {/* HERO */}
    <section className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-zinc-900 overflow-hidden">
      <img src={thumbUrl(e.thumbnail_path)} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
      {isLatest && <span className="absolute top-3 left-3 bg-brand text-[10px] font-bold tracking-wide px-2.5 py-1 rounded">NEW EPISODE</span>}
    </section>

    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 mb-2">
        <span className="bg-white/10 px-2 py-0.5 rounded font-semibold">TV</span>
        <span>{new Date(e.published_at).getFullYear()}</span>
        <span className="w-1 h-1 rounded-full bg-white/30" />
        <span>{(all ?? []).length} episodes</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl tracking-wide">{e.title}</h1>

      <div className="flex flex-wrap gap-3 mt-4">
        <ShareButton url={`${siteUrl}/episode/${e.episode_number}`} title={e.title} />
      </div>

      <div className="mt-6"><Gate n={e.episode_number} title={e.title} poster={thumbUrl(e.thumbnail_path)} /></div>

      {/* EPISODE GRID (season/episode selector, in place of a fixed season dropdown) */}
      {nums.length > 1 && (<div className="mt-8">
        <h2 className="font-semibold mb-3">Episodes</h2>
        <div className="flex flex-wrap gap-2">
          {nums.map((num) => (<Link key={num} href={`/episode/${num}`}
            className={`w-11 h-11 flex items-center justify-center rounded-lg text-sm font-semibold border transition ${num === e.episode_number ? "bg-brand border-brand text-white" : "bg-zinc-900 border-white/10 text-white/70 hover:border-white/30"}`}>
            {String(num).padStart(2, "0")}
          </Link>))}
        </div>
      </div>)}

      <p className="text-white/70 mt-6 whitespace-pre-line">{e.description}</p>

      <div className="flex justify-between gap-3 mt-6">
        {prev ? <Link className="bg-zinc-900 px-5 py-3 rounded-lg" href={`/episode/${prev}`}>← Previous</Link> : <span />}
        {next ? <Link className="bg-zinc-900 px-5 py-3 rounded-lg" href={`/episode/${next}`}>Next →</Link> : <span />}
      </div>

      <h2 className="font-display text-2xl tracking-wide mt-10 mb-3">For You</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{(all ?? []).filter((x) => x.id !== e.id).slice(0, 6).map((x) => <Card key={x.id} e={x} />)}</div>
    </div>
  </div>);
}
