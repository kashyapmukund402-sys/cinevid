import { db } from "@/lib/db";
export default async function Reach() {
  const since14 = new Date(Date.now() - 14 * 864e5).toISOString();
  const since7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const [{ count: totalViews }, { count: totalUnlocks }, { count: today }, { count: last7 }, { data: recent }, { data: episodes }] = await Promise.all([
    db.from("page_views").select("*", { count: "exact", head: true }).eq("type", "view"),
    db.from("page_views").select("*", { count: "exact", head: true }).eq("type", "unlock"),
    db.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    db.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", since7),
    db.from("page_views").select("created_at").gte("created_at", since14),
    db.from("episodes").select("episode_number,title").eq("published", true),
  ]);

  // Views per day for the last 14 days
  const days: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const count = (recent ?? []).filter((r) => { const t = new Date(r.created_at).getTime(); return t >= d.getTime() && t < next.getTime(); }).length;
    days.push({ label: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }), count });
  }
  const max = Math.max(1, ...days.map((d) => d.count));

  // Top episodes by unlock (watch) count
  const { data: unlocksByEp } = await db.from("page_views").select("episode_number").eq("type", "unlock").not("episode_number", "is", null);
  const tally = new Map<number, number>();
  (unlocksByEp ?? []).forEach((r: any) => tally.set(r.episode_number, (tally.get(r.episode_number) ?? 0) + 1));
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([num, count]) => ({ num, count, title: (episodes ?? []).find((e) => e.episode_number === num)?.title ?? `Episode ${num}` }));

  const stats = [["Page views (all time)", totalViews ?? 0], ["Video plays (all time)", totalUnlocks ?? 0], ["Views today", today ?? 0], ["Views last 7 days", last7 ?? 0]];

  return (<div>
    <h1 className="text-2xl font-bold mb-4">Reach</h1>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map(([k, v]) => <div key={k as string} className="bg-zinc-900 rounded-xl p-4"><div className="text-white/50 text-xs">{k}</div><div className="text-2xl font-bold">{v}</div></div>)}
    </div>

    <h2 className="font-semibold mb-3">Views — last 14 days</h2>
    <div className="flex items-end gap-1.5 h-32 bg-zinc-900 rounded-xl p-4 mb-8 overflow-x-auto">
      {days.map((d) => (<div key={d.label} className="flex flex-col items-center justify-end h-full flex-1 min-w-[22px]" title={`${d.label}: ${d.count}`}>
        <div className="w-full bg-brand rounded-t" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 3 : 0 }} />
        <span className="text-[9px] text-white/40 mt-1 rotate-0">{d.label.split(" ")[0]}</span>
      </div>))}
    </div>

    <h2 className="font-semibold mb-3">Most watched episodes</h2>
    {!top.length && <p className="text-white/50 text-sm">No video plays logged yet.</p>}
    {!!top.length && <table className="w-full text-sm"><thead className="text-left text-white/50"><tr><th>Episode</th><th>Title</th><th>Plays</th></tr></thead>
      <tbody>{top.map((t) => <tr key={t.num} className="border-t border-white/10"><td className="py-2">{t.num}</td><td>{t.title}</td><td>{t.count}</td></tr>)}</tbody></table>}
  </div>);
}
