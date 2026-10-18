// ShrinkEarn short-link creation. The API key is read only on the server and never logged or returned.
const ENDPOINT = "https://shrinkearn.com/api";
export async function createShrinkLink(destination: string): Promise<{ url: string } | { error: string }> {
  const key = process.env.SHRINK_API_KEY;
  if (!key) return { error: "SHRINK_API_KEY server par set nahi hai" };
  const qs = new URLSearchParams({ api: key, url: destination });
  try {
    const r = await fetch(`${ENDPOINT}?${qs.toString()}`, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(8000) });
    const j: any = await r.json().catch(() => null);
    const url = j?.shortenedUrl ?? j?.short_url ?? j?.shortened ?? j?.url ?? null;
    if (!r.ok || typeof url !== "string" || !url.startsWith("https://")) return { error: "ShrinkEarn ne valid link nahi diya" };
    return { url };
  } catch {
    return { error: "ShrinkEarn se connect nahi ho paya" };
  }
}
