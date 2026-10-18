// NEW FILE. Safe URL helpers (no server-only imports, usable anywhere).
// Returns a normalized http/https URL, or null if the value is not a valid web URL.
export function cleanVideoUrl(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  if (!s || s.length > 2000) return null;
  try {
    const u = new URL(s);
    if (!["http:", "https:"].includes(u.protocol)) return null; // blocks javascript:, data:, file: etc.
    if (u.username || u.password) return null;
    return u.toString();
  } catch { return null; }
}
// True when the URL path ends in a file type browsers can play in <video>.
export const isDirectVideo = (url: string) => {
  try { return /\.(mp4|webm|mov|m4v|ogv|ogg)$/i.test(new URL(url).pathname); } catch { return false; }
};
