"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Plus, MessageSquareText, Activity, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Vault", href: "/vault", icon: FolderOpen },
    { name: "Upload", href: "/upload", icon: Plus },
    { name: "Query", href: "/chat", icon: MessageSquareText },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* Top Header: Minimalist and Calm */}
      <header className="flex-none px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-700 rounded-lg shadow-sm">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">HealthLedger</span>
        </div>
        
        {/* Subtle Sign Out Button */}
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation: Native App Feel */}
      <nav className="flex-none fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200/60 pb-safe">
        <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className="flex flex-col items-center gap-1 w-20 relative group outline-none"
              >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? "text-blue-600 bg-blue-50" : "text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100"
                }`}>
                  <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}