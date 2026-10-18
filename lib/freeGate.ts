import { db } from "./db";
import { cleanVideoUrl } from "./videoUrl";
export async function getFreeSettings() {
  const { data } = await db.from("settings").select("shrink_url,free_cooldown_hours").eq("id", 1).maybeSingle();
  const url = cleanVideoUrl(data?.shrink_url);
  return {
    shrinkUrl: url && url.startsWith("https://") ? url : null,
    cooldownHours: Math.min(168, Math.max(0, Number(data?.free_cooldown_hours ?? 24))),
  };
}
