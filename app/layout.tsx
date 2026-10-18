import "./globals.css"; import Link from "next/link"; import { db } from "@/lib/db"; import { Inter, Bebas_Neue } from "next/font/google"; import MobileNav from "@/components/MobileNav";
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-display" });
export const dynamic = "force-dynamic";
export const metadata = { title: "CINE", description: "Watch the latest episodes" };
export default async function L({ children }: { children: React.ReactNode }) {
  const { data: s } = await db.from("settings").select("*").single();
  return (<html lang="en" className={`${inter.variable} ${bebas.variable}`}><body className="min-h-screen flex flex-col font-sans">
    <header className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-5 text-sm overflow-x-auto">
        <Link href="/" className="font-display text-brand text-2xl tracking-widest">{s?.site_name ?? "CINE"}</Link>
        <Link href="/">Home</Link><Link href="/episode/latest">Latest</Link><Link href="/episodes">Episodes</Link><Link href="/downloads">Downloads</Link><Link href="/request">Request a Video</Link>
      </nav></header>
    <main className="flex-1 pb-16 sm:pb-0">{children}</main>
    <MobileNav />
    <footer className="text-center text-xs text-white/40 py-6">{s?.footer}</footer></body></html>);
}
