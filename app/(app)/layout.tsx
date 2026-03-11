import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, FolderHeart, MessageSquareText, Plus, User, Activity, FlaskConical, Stethoscope, ShoppingBag } from "lucide-react";

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

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 z-20 shadow-sm">

        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="p-2 bg-[#1A365D] rounded-xl shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#111827]">HealthLedger</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">

          {/* Core navigation */}
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-3 mt-2">Menu</p>
          <Link href="/home" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-[#1A365D] hover:bg-slate-50 transition-colors group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[15px]">Home</span>
          </Link>
          <Link href="/vault" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-[#1A365D] hover:bg-slate-50 transition-colors group">
            <FolderHeart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[15px]">Medical Vault</span>
          </Link>
          <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-[#1A365D] hover:bg-slate-50 transition-colors group">
            <MessageSquareText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[15px]">AI Assistant</span>
          </Link>

          {/* Coming soon section */}
          <div className="mt-4 mb-1">
            <div className="h-px bg-slate-100 mb-3" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-3">Coming Soon</p>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 cursor-not-allowed">
            <FlaskConical className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Book Lab Tests</span>
            <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wide">Soon</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 cursor-not-allowed">
            <Stethoscope className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Find Doctors</span>
            <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wide">Soon</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 cursor-not-allowed">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Health Store</span>
            <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wide">Soon</span>
          </div>

        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link href="/upload" className="flex items-center justify-center gap-2 w-full py-3 bg-[#1A365D] hover:bg-[#12243e] text-white rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-95">
            <Plus className="w-5 h-5" />
            <span className="font-bold text-[15px]">Upload Report</span>
          </Link>
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-500 hover:text-[#1A365D] hover:bg-slate-50 transition-colors">
            <User className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Profile & Settings</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto relative pb-24 md:pb-0 scroll-smooth">
        <div className="max-w-3xl mx-auto w-full pt-0 md:pt-6 px-0 md:px-8">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 pt-2 pb-6 px-8 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between max-w-sm mx-auto relative">

          <Link href="/home" className="flex flex-col items-center gap-1 p-2 group outline-none">
            <Home className="w-6 h-6 text-slate-400 group-hover:text-[#1A365D] transition-colors" />
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#1A365D]">Home</span>
          </Link>

          <Link href="/vault" className="flex flex-col items-center gap-1 p-2 group outline-none">
            <FolderHeart className="w-6 h-6 text-slate-400 group-hover:text-[#1A365D] transition-colors" />
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#1A365D]">Vault</span>
          </Link>

          {/* Upload FAB */}
          <Link href="/upload" className="absolute left-1/2 -translate-x-1/2 -top-8 outline-none">
            <div className="w-14 h-14 bg-[#1A365D] hover:bg-[#12243e] text-white rounded-[20px] shadow-lg shadow-[#1A365D]/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <Plus className="w-7 h-7" />
            </div>
          </Link>

          <Link href="/chat" className="flex flex-col items-center gap-1 p-2 group outline-none">
            <MessageSquareText className="w-6 h-6 text-slate-400 group-hover:text-[#1A365D] transition-colors" />
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#1A365D]">AI</span>
          </Link>

          <button className="flex flex-col items-center gap-1 p-2 group outline-none">
            <User className="w-6 h-6 text-slate-400 group-hover:text-[#1A365D] transition-colors" />
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#1A365D]">Profile</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
