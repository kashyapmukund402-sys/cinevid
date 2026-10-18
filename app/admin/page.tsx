import { db } from "@/lib/db"; import Actions from "@/components/Actions";
export default async function Dash() {
  const { data } = await db.from("episodes").select("*").order("episode_number", { ascending: false }); const l = data ?? [];
  const pubd = l.filter((e) => e.published).length;
  const stats = [["Total videos", l.length], ["Published", pubd], ["Drafts", l.length - pubd], ["Latest", l.find((e) => e.published)?.episode_number ?? "-"]];
  return (<div><h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">{stats.map(([k, v]) => <div key={k as string} className="bg-zinc-900 rounded-xl p-4"><div className="text-white/50 text-xs">{k}</div><div className="text-2xl font-bold">{v}</div></div>)}</div>
    <table className="w-full text-sm"><thead className="text-left text-white/50"><tr><th>Episode</th><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>{l.map((e) => <tr key={e.id} className="border-t border-white/10"><td className="py-3">{e.episode_number}</td><td>{e.title}</td>
        <td>{e.published ? "Published" : "Draft"}</td><td>{new Date(e.published_at).toLocaleDateString()}</td><td><Actions e={e} /></td></tr>)}</tbody></table></div>);
}
