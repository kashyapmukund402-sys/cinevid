"use client";
export default function ShareButton({ url, title }: { url: string; title: string }) {
  async function share() {
    const nav = navigator as any;
    if (nav.share) { try { await nav.share({ title, url }); } catch {} }
    else { await navigator.clipboard.writeText(url); alert("Link copied!"); }
  }
  return (<button onClick={share} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-lg text-sm font-medium transition">
    ↗ Share
  </button>);
}
