"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, FolderHeart, MessageSquareText, Plus, Compass } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  if (pathname === "/chat" || pathname.startsWith("/upload/review")) return null;

  const isExplore = ["/explore", "/lab", "/doctors", "/store"].some(p => pathname.startsWith(p));

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50">
      {/* Frosted glass bar */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-100/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pt-2 pb-7 px-4">
        <div className="flex items-center justify-between max-w-sm mx-auto relative">

          <NavItem href="/home" label="Home" icon={Home} active={pathname === "/home"} />
          <NavItem href="/vault" label="Vault" icon={FolderHeart} active={pathname.startsWith("/vault")} />

          {/* Center FAB */}
          <Link href="/upload" className="absolute left-1/2 -translate-x-1/2 -top-7 outline-none">
            <div className="w-[52px] h-[52px] bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-[18px] shadow-xl shadow-teal-500/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </Link>

          <NavItem href="/chat" label="AI" icon={MessageSquareText} active={pathname === "/chat"} />
          <NavItem href="/explore" label="Explore" icon={Compass} active={isExplore} />

        </div>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 p-2 w-14 outline-none group">
      <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center transition-all ${
        active ? "bg-[#0F1F3D] shadow-md" : "group-hover:bg-slate-100"
      }`}>
        <Icon
          className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
          strokeWidth={active ? 2.5 : 2}
        />
      </div>
      <span className={`text-[10px] font-bold transition-colors leading-none ${active ? "text-[#0F1F3D]" : "text-slate-400"}`}>
        {label}
      </span>
    </Link>
  );
}
