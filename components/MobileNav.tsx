"use client"; import Link from "next/link"; import { usePathname } from "next/navigation";
const ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/episodes", label: "Episodes", icon: "🎬" },
  { href: "/downloads", label: "Downloads", icon: "⬇" },
  { href: "/request", label: "Request", icon: "👤" },
];
export default function MobileNav() {
  const path = usePathname();
  return (<nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-black/95 backdrop-blur border-t border-white/10 flex">
    {ITEMS.map((it) => { const active = path === it.href;
      return (<Link key={it.href} href={it.href} className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${active ? "text-brand" : "text-white/50"}`}>
        <span className="text-base leading-none">{it.icon}</span>{it.label}
      </Link>);
    })}
  </nav>);
}
