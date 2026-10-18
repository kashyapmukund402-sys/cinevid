"use client"; import Link from "next/link"; import { useRouter } from "next/navigation";
export default function Actions({ e }: { e: any }) {
  const r = useRouter();
  const toggle = async () => { await fetch("/api/admin/episode", { method: "PATCH", body: JSON.stringify({ id: e.id, published: !e.published }) }); r.refresh(); };
  const del = async () => { if (confirm(`Delete episode ${e.episode_number}? This removes its files.`)) { await fetch(`/api/admin/episode?id=${e.id}`, { method: "DELETE" }); r.refresh(); } };
  return (<div className="flex gap-3 text-sm"><Link className="text-blue-400" href={`/admin/edit/${e.id}`}>Edit</Link>
    <button onClick={toggle} className="text-yellow-400">{e.published ? "Unpublish" : "Publish"}</button><button onClick={del} className="text-red-400">Delete</button></div>);
}
