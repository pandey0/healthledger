import { auth } from "@/auth";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  Activity, Plus, TrendingUp, FlaskConical, Stethoscope,
  ShoppingBag, MessageSquareText, AlertCircle, CheckCircle,
  ArrowRight, ChevronRight, Clock, Sparkles, FolderHeart, Zap,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = format(new Date(), "EEEE, MMMM do");

  const [latestDoc, recentAnomaly, docCount, markerCount] = userId
    ? await Promise.all([
        prisma.document.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
        prisma.extractedData.findFirst({ where: { userId, flag: { in: ["high", "low", "High", "Low"] } }, orderBy: { testDate: "desc" } }),
        prisma.document.count({ where: { userId } }),
        prisma.extractedData.count({ where: { userId } }),
      ])
    : [null, null, 0, 0];

  const isEmpty = docCount === 0;
  const daysSinceUpload = latestDoc
    ? Math.floor((Date.now() - new Date(latestDoc.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12">

      {/* Greeting header */}
      <header className="px-6 pt-10 pb-6">
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{today}</p>
        <h1 className="text-[30px] font-extrabold text-slate-900 tracking-tight leading-tight">
          {greeting},{" "}
          <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">{firstName}.</span>
        </h1>
      </header>

      <main className="px-6 space-y-6">

        {isEmpty ? (
          <>
            {/* Welcome hero */}
            <div className="relative bg-gradient-to-br from-[#0F1F3D] via-[#1A365D] to-[#1e4a80] rounded-[28px] p-6 shadow-xl shadow-slate-900/20 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-teal-500/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cyan-500/10 rounded-full" />
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/3 rounded-full" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[16px] flex items-center justify-center mb-4 shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-[22px] font-extrabold text-white tracking-tight mb-2">
                  Your health journey starts here
                </h2>
                <p className="text-[13px] text-blue-200 font-medium leading-relaxed mb-5">
                  Upload your first lab report. We&apos;ll extract every biomarker, build your health timeline, and guide you forward.
                </p>
                <Link href="/upload">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold text-[14px] px-5 py-3 rounded-[14px] shadow-lg shadow-teal-500/30 hover:from-teal-300 hover:to-cyan-400 transition-all active:scale-95">
                    <Plus className="w-4 h-4" />
                    Upload First Report
                  </button>
                </Link>
              </div>
            </div>

            {/* Setup steps */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
              <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Get started in 3 steps</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Upload a lab report", desc: "Blood test, lipid profile, CBC — any report works.", href: "/upload", done: true },
                  { step: "2", title: "Review extracted data", desc: "AI extracts every biomarker automatically.", href: null, done: false },
                  { step: "3", title: "Track your trends", desc: "See how your health evolves over time.", href: null, done: false },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5 ${item.done ? "bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-sm" : "bg-slate-100 text-slate-400"}`}>
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-slate-800">{item.title}</p>
                      <p className="text-[12px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature preview */}
            <div>
              <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">What you&apos;ll unlock</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: TrendingUp, label: "Trend Engine", desc: "Track biomarkers over time", from: "from-cyan-500", to: "to-teal-600" },
                  { icon: Sparkles,   label: "AI Insights",  desc: "Query your health history", from: "from-violet-500", to: "to-purple-600" },
                  { icon: Zap,        label: "Smart Nudges", desc: "Know when to retest",       from: "from-amber-400", to: "to-orange-500" },
                ].map((f) => (
                  <div key={f.label} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm text-center">
                    <div className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${f.from} ${f.to} flex items-center justify-center mb-3 mx-auto shadow-sm`}>
                      <f.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[12px] font-bold text-slate-800 leading-snug">{f.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Reports",    value: docCount,               from: "from-cyan-500",   to: "to-teal-600",   icon: FolderHeart },
                { label: "Biomarkers", value: markerCount,            from: "from-violet-500", to: "to-purple-600", icon: Activity },
                { label: "Trends",     value: docCount > 1 ? "Live" : "—", from: "from-amber-400", to: "to-orange-500", icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
                  <div className={`w-9 h-9 rounded-[12px] bg-gradient-to-br ${stat.from} ${stat.to} flex items-center justify-center mb-2 shadow-sm`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[22px] font-extrabold text-slate-900 leading-none">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Anomaly / All-clear card */}
            {recentAnomaly ? (
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[28px] p-6 shadow-lg shadow-amber-500/25 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-11 h-11 bg-white/20 rounded-[14px] flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white">Attention needed</h2>
                    <p className="text-[13px] text-amber-100 font-medium leading-snug mt-1">
                      {format(new Date(recentAnomaly.testDate), "MMM d")} report flagged{" "}
                      <span className="font-bold text-white">{recentAnomaly.markerName}</span> as {recentAnomaly.flag}.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-5 relative z-10">
                  <Link href="/doctors" className="flex-1 bg-white text-amber-700 text-[13px] font-bold py-2.5 rounded-[14px] transition-colors shadow-sm text-center hover:bg-amber-50">
                    Consult Doctor
                  </Link>
                  <Link href="/vault" className="flex-1 bg-white/20 hover:bg-white/30 text-white text-[13px] font-bold py-2.5 rounded-[14px] transition-colors text-center">
                    View Vault
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[28px] p-6 shadow-lg shadow-emerald-500/20 overflow-hidden">
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-[16px] flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-extrabold text-white">All clear</h2>
                    <p className="text-[13px] text-emerald-100 font-medium mt-0.5 leading-snug">
                      No anomalies found in your archived health trends.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload nudge */}
            {daysSinceUpload !== null && daysSinceUpload > 90 && (
              <div className="bg-white rounded-[24px] p-5 border border-amber-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-slate-800">Time for a new report</p>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Your last upload was {daysSinceUpload} days ago. Regular tracking helps you stay ahead.
                  </p>
                  <Link href="/upload" className="inline-flex items-center gap-1 mt-3 text-[12px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-[10px] transition-colors border border-amber-100">
                    Upload Report <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Recent upload */}
            {latestDoc && (
              <Link href={`/vault/${latestDoc.id}`} className="block group outline-none">
                <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recent Upload</p>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[16px] font-bold text-slate-800 truncate">{latestDoc.fileName}</p>
                  <p className="text-[12px] text-slate-400 font-medium mt-1">{format(new Date(latestDoc.createdAt), "MMMM d, yyyy")}</p>
                </div>
              </Link>
            )}
          </>
        )}

        {/* Ecosystem — always visible and now linkable */}
        <div>
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Health Ecosystem</h3>
          <div className="space-y-3">

            <Link href="/lab">
              <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-cyan-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-[16px] flex items-center justify-center shrink-0 shadow-sm">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-slate-800">Book Lab Tests</p>
                    <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 text-[9px] font-bold rounded-full border border-cyan-100 uppercase tracking-wider">Beta</span>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium mt-0.5">Thyrocare · Redcliffe · 1mg · Dr Lal</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>

            <Link href="/doctors">
              <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-emerald-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[16px] flex items-center justify-center shrink-0 shadow-sm">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-slate-800">Consult Doctors</p>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider">Beta</span>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium mt-0.5">500+ specialists · Share health timeline</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>

            <Link href="/store">
              <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-violet-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-700 rounded-[16px] flex items-center justify-center shrink-0 shadow-sm">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-slate-800">Health Store</p>
                    <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-[9px] font-bold rounded-full border border-violet-100 uppercase tracking-wider">Beta</span>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium mt-0.5">AI-curated supplements, devices & kits</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>

          </div>
        </div>

        {/* AI Assistant */}
        <Link href="/chat" className="block outline-none group">
          <div className="relative bg-gradient-to-br from-[#0F1F3D] via-[#1A365D] to-[#2d5fa8] p-5 rounded-[24px] shadow-xl shadow-slate-900/15 flex items-center justify-between overflow-hidden hover:-translate-y-0.5 transition-transform active:scale-[0.99]">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute -left-2 -bottom-4 w-16 h-16 bg-teal-500/10 rounded-full" />
            <div className="relative flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[14px] flex items-center justify-center shadow-lg">
                <MessageSquareText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-white">Ask Ledger AI</p>
                <p className="text-[12px] text-blue-300 font-medium mt-0.5">Query your full health history</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all relative" />
          </div>
        </Link>

      </main>
    </div>
  );
}
