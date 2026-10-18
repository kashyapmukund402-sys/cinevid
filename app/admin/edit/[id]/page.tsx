import F from "@/components/EpisodeForm"; import { db } from "@/lib/db"; import { notFound } from "next/navigation";
export default async function P({ params }: any) { const { id } = await params; const { data } = await db.from("episodes").select("*").eq("id", id).maybeSingle(); if (!data) notFound(); return <F ep={data} />; }
