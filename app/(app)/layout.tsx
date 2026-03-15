import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Activity, Settings } from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";
import NavLinks from "@/components/layout/NavLinks";

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
    <div className="flex h-screen w-full bg-[#F0F2F5] overflow-hidden selection:bg-blue-100">

      {/* DESKTOP SIDEBAR — rich dark navy */}
      <aside className="hidden md:flex flex-col w-68 bg-[#0F1F3D] z-20 shadow-2xl">

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[12px] flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0F1F3D]" />
          </div>
          <div>
            <span className="font-extrabold text-[18px] tracking-tight text-white leading-none">HealthLedger</span>
            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-0.5">Health Intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-0.5">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2 px-3 pt-2">Core</p>
          <NavLinks />

          <div className="pt-4">
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2 px-3">Ecosystem</p>
          </div>
          <NavLinks section="ecosystem" />
        </nav>

        {/* Upload CTA */}
        <div className="p-4 mt-2 border-t border-white/10">
          <Link
            href="/upload"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-[14px] shadow-lg shadow-teal-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98] font-bold text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Upload New Report
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto relative scroll-smooth">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[10px] flex items-center justify-center shadow">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-[#0F1F3D]">HealthLedger</span>
          </div>
          <Link
            href="/settings"
            className="w-9 h-9 rounded-[10px] bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        <div className="max-w-3xl mx-auto w-full pt-0 md:pt-6 px-0 md:px-8 pb-28 md:pb-8">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <MobileNav />

    </div>
  );
}
