import { db } from "@/lib/db"; import Card from "@/components/Card"; import { logView } from "@/lib/analytics";
export const metadata = { title: "All Episodes" };
export default async function AllEpisodes({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await logView("/episodes");
  const q = ((await searchParams).q ?? "").replace(/[,()%]/g, "").trim();
  const { data: all } = await db.from("episodes").select("*").eq("published", true).lte("published_at", new Date().toISOString()).order("episode_number", { ascending: false });
  const list = (all ?? []).filter((e) => !q || String(e.episode_number) === q || e.title.toLowerCase().includes(q.toLowerCase()));
  return (<div className="max-w-6xl mx-auto px-4 py-8">
    <h1 className="font-display text-3xl tracking-wide mb-6">All Episodes</h1>
    <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Search by number or title" className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3" /><button className="bg-brand px-5 rounded-lg">Search</button></form>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">{list.map((e) => <Card key={e.id} e={e} />)}</div>
    {!list.length && <p className="text-white/50 mt-6">No episodes found.</p>}
  </div>);
}
