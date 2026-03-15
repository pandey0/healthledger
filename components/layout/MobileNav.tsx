"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, FolderHeart, MessageSquareText, Plus, Activity } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  if (
    pathname === "/chat" ||
    pathname.startsWith("/upload/review") ||
    pathname.startsWith("/upload/batch-review")
  ) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50">
      <div className="bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.07)] pt-2 pb-4 px-4 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
        <div className="flex items-center justify-between max-w-sm mx-auto relative">

          <NavItem href="/home"     label="Home"   icon={Home}              active={pathname === "/home"} />
          <NavItem href="/vault"    label="Vault"  icon={FolderHeart}       active={pathname.startsWith("/vault")} />

          {/* Center FAB */}
          <Link href="/upload" className="absolute left-1/2 -translate-x-1/2 -top-6 outline-none">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-[16px] shadow-xl shadow-teal-500/35 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </Link>

          <NavItem href="/chat"     label="AI"     icon={MessageSquareText} active={pathname === "/chat"} />
          <NavItem href="/trackers" label="Health" icon={Activity}          active={pathname.startsWith("/trackers")} />

        </div>
      </div>
    </nav>
  );
}

function NavItem({
  href, label, icon: Icon, active,
}: {
  href: string; label: string; icon: React.ElementType; active: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 p-1.5 w-14 outline-none group">
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all ${
        active ? "bg-[#0F1F3D] shadow-md" : "group-hover:bg-slate-100"
      }`}>
        <Icon
          className={`w-4.5 h-4.5 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
          style={{ width: 18, height: 18 }}
          strokeWidth={active ? 2.5 : 2}
        />
      </div>
      <span className={`text-[9px] font-bold transition-colors leading-none ${active ? "text-[#0F1F3D]" : "text-slate-400"}`}>
        {label}
      </span>
    </Link>
  );
}
