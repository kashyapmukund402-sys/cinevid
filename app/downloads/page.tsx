export const metadata = { title: "Downloads" };
import DownloadsList from "@/components/DownloadsList";
export default function Downloads() {
  return (<div className="max-w-2xl mx-auto px-4 py-16 text-center">
    <div className="w-20 h-20 mx-auto rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl mb-5">⬇</div>
    <h1 className="font-display text-3xl tracking-wide mb-2">Downloads</h1>
    <p className="text-white/50 text-sm">Unlock any episode with its password and tap Download to save it to your device.</p>
    <div className="text-left"><DownloadsList /></div>
  </div>);
}
