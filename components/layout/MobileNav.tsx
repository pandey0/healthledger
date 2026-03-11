"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, FolderHeart, MessageSquareText, Plus, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  // Chat is fullscreen on mobile — no bottom nav needed
  if (pathname === "/chat") return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 pt-2 pb-6 px-8 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between max-w-sm mx-auto relative">

        <Link href="/home" className="flex flex-col items-center gap-1 p-2 group outline-none">
          <Home className={`w-6 h-6 transition-colors ${pathname === "/home" ? "text-[#1A365D]" : "text-slate-400 group-hover:text-[#1A365D]"}`} />
          <span className={`text-[10px] font-semibold transition-colors ${pathname === "/home" ? "text-[#1A365D]" : "text-slate-400"}`}>Home</span>
        </Link>

        <Link href="/vault" className="flex flex-col items-center gap-1 p-2 group outline-none">
          <FolderHeart className={`w-6 h-6 transition-colors ${pathname.startsWith("/vault") ? "text-[#1A365D]" : "text-slate-400 group-hover:text-[#1A365D]"}`} />
          <span className={`text-[10px] font-semibold transition-colors ${pathname.startsWith("/vault") ? "text-[#1A365D]" : "text-slate-400"}`}>Vault</span>
        </Link>

        <Link href="/upload" className="absolute left-1/2 -translate-x-1/2 -top-8 outline-none">
          <div className="w-14 h-14 bg-[#1A365D] hover:bg-[#12243e] text-white rounded-[20px] shadow-lg shadow-[#1A365D]/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <Plus className="w-7 h-7" />
          </div>
        </Link>

        <Link href="/chat" className="flex flex-col items-center gap-1 p-2 group outline-none">
          <MessageSquareText className="w-6 h-6 text-slate-400 group-hover:text-[#1A365D] transition-colors" />
          <span className="text-[10px] font-semibold text-slate-400">AI</span>
        </Link>

        <button className="flex flex-col items-center gap-1 p-2 group outline-none">
          <User className="w-6 h-6 text-slate-400 group-hover:text-[#1A365D] transition-colors" />
          <span className="text-[10px] font-semibold text-slate-400">Profile</span>
        </button>

      </div>
    </nav>
  );
}
