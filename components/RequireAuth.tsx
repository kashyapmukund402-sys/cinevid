"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  if (user === undefined) return <div className="max-w-md mx-auto mt-24 text-center text-white/50">Loading…</div>;
  if (!user) return (<div className="max-w-md mx-auto mt-24 text-center bg-zinc-900 rounded-xl p-8 border border-white/10">
    <div className="text-brand font-extrabold tracking-widest text-lg mb-1">CINE VIDE</div>
    <h1 className="text-xl font-bold mb-2">Sign in to continue</h1>
    <p className="text-white/60 mb-5 text-sm">This is a private video library. Sign in with Google to browse episodes.</p>
    <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin } })}
      className="bg-brand px-6 py-3 rounded-lg font-semibold">Sign in with Google</button></div>);
  return <>{children}</>;
}
