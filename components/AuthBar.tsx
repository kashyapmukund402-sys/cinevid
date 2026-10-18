"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
export default function AuthBar() {
  const [user, setUser] = useState<any>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  if (user === undefined) return null;
  if (!user) return (<button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin } })}
    className="ml-auto bg-brand px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap">Sign in with Google</button>);
  return (<div className="ml-auto flex items-center gap-2 text-sm">
    {user.user_metadata?.avatar_url && <img src={user.user_metadata.avatar_url} alt="" className="w-7 h-7 rounded-full" />}
    <span className="hidden sm:inline truncate max-w-[120px]">{user.user_metadata?.full_name || user.email}</span>
    <button onClick={() => supabase.auth.signOut()} className="text-white/50 hover:text-white">Logout</button></div>);
}
