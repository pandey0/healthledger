import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, FolderHeart, MessageSquareText, Plus, User, Activity } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // AUTH BYPASSED FOR DEVELOPMENT — remove this block to re-enable
  if (process.env.NODE_ENV !== "development" && !session?.user) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full bg-[#F4F3F0] overflow-hidden selection:bg-blue-100">
      
      {/* 🖥️ DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200/60 z-20 shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="p-2 bg-[#1A365D] rounded-xl shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#111827]">HealthLedger</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2 p-6">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Menu</h3>
          <Link href="/home" className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-[#1A365D] hover:bg-slate-50 transition-colors group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-[15px]">Home Hub</span>
          </Link>
          <Link href="/vault" className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-[#1A365D] hover:bg-slate-50 transition-colors group">
            <FolderHeart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-[15px]">Medical Vault</span>
          </Link>
          <Link href="/chat" className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-[#1A365D] hover:bg-slate-50 transition-colors group">
            <MessageSquareText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-[15px]">Ask AI Assistant</span>
          </Link>
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <Link href="/upload" className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1A365D] hover:bg-[#12243e] text-white rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:scale-95">
            <Plus className="w-5 h-5" />
            <span className="font-bold text-[15px]">Upload Report</span>
          </Link>
          <button className="flex items-center gap-3 p-3 mt-3 w-full rounded-xl text-slate-500 hover:text-[#1A365D] hover:bg-white transition-colors">
            <User className="w-5 h-5" />
            <span className="font-bold text-[15px]">Profile & Settings</span>
          </button>
        </div>
      </aside>

      {/* 📄 MAIN CONTENT AREA */}
      {/* On desktop, it takes the remaining width. On mobile, it takes 100%. */}
      <main className="flex-1 h-full overflow-y-auto relative pb-24 md:pb-0 scroll-smooth">
        {/* We use max-w-5xl to keep text readable on massive ultra-wide monitors */}
        <div className="max-w-5xl mx-auto w-full pt-4 md:pt-10 px-0 md:px-8">
          {children}
        </div>
      </main>

      {/* 📱 MOBILE BOTTOM NAV (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 pb-safe pt-2 px-6 pb-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between max-w-sm mx-auto relative">
          
          <div className="flex gap-6">
            <Link href="/home" className="flex flex-col items-center gap-1 p-2 group outline-none">
              <div className="text-slate-400 group-hover:text-[#1A365D] transition-colors"><Home className="w-6 h-6" /></div>
            </Link>
            <Link href="/vault" className="flex flex-col items-center gap-1 p-2 group outline-none">
              <div className="text-slate-400 group-hover:text-[#1A365D] transition-colors"><FolderHeart className="w-6 h-6" /></div>
            </Link>
          </div>

          <Link href="/upload" className="absolute left-1/2 -translate-x-1/2 -top-10 outline-none">
            <div className="w-14 h-14 bg-[#1A365D] hover:bg-[#12243e] text-white rounded-[20px] shadow-lg shadow-[#1A365D]/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <Plus className="w-7 h-7" />
            </div>
          </Link>

          <div className="flex gap-6">
            <Link href="/chat" className="flex flex-col items-center gap-1 p-2 group outline-none">
              <div className="text-slate-400 group-hover:text-[#1A365D] transition-colors"><MessageSquareText className="w-6 h-6" /></div>
            </Link>
            <button className="flex flex-col items-center gap-1 p-2 group outline-none">
              <div className="text-slate-400 group-hover:text-[#1A365D] transition-colors"><User className="w-6 h-6" /></div>
            </button>
          </div>

        </div>
      </nav>

    </div>
  );
}