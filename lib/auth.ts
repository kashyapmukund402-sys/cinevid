import { createClient } from "@supabase/supabase-js";
// Verifies the Supabase access token sent by the browser. The user ID comes ONLY from
// Supabase's verification, never from the request body.
const anon = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
export async function getUserId(req: Request): Promise<string | null> {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await anon().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
// Same as getUserId, but also requires a confirmed email (used for key generation)
export async function getVerifiedUserId(req: Request): Promise<string | null> {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await anon().auth.getUser(token);
  if (error || !data.user || !data.user.email_confirmed_at) return null;
  return data.user.id;
}
