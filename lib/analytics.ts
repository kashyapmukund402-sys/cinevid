import { db } from "./db";
// Fire-and-forget view logger. Never throws, so a logging failure can't break a page.
export async function logView(path: string, episode_number?: number, type: "view" | "unlock" = "view") {
  try { await db.from("page_views").insert({ path, episode_number: episode_number ?? null, type }); } catch {}
}
