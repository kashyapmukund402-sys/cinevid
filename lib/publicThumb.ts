"use client";
// Builds a public thumbnail URL client-side without needing the service-role key.
// Requires NEXT_PUBLIC_SUPABASE_URL to be set (same value as SUPABASE_URL, safe to expose).
export const publicThumb = (path?: string | null) =>
  path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/${path}` : "";
