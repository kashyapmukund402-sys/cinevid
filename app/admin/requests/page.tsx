import { db } from "@/lib/db"; import RequestRow from "@/components/RequestRow";
export default async function AdminRequests() {
  const { data } = await db.from("video_requests").select("*").order("created_at", { ascending: false });
  const list = data ?? [];
  return (<div><h1 className="text-2xl font-bold mb-4">Video Requests</h1>
    {!list.length && <p className="text-white/50">No requests yet.</p>}
    {!!list.length && <table className="w-full text-sm"><thead className="text-left text-white/50"><tr><th>Title</th><th>Description</th><th>Date</th><th>Status</th><th></th></tr></thead>
      <tbody>{list.map((r) => <RequestRow key={r.id} r={r} />)}</tbody></table>}</div>);
}
