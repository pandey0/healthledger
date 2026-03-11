import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, FolderHeart, MessageSquareText, Plus, User, Activity, FlaskConical, Stethoscope, ShoppingBag } from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";

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

        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="p-2 bg-[#1A365D] rounded-xl shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#111827]">HealthLedger</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
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

      {/* MAIN CONTENT — chat manages its own layout on mobile */}
      <main className="flex-1 h-full overflow-y-auto relative scroll-smooth">
        <div className="max-w-3xl mx-auto w-full pt-0 md:pt-6 px-0 md:px-8 pb-28 md:pb-8">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV — client component hides itself on /chat */}
      <MobileNav />

    </div>
  );
}
