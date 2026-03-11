import { auth } from "@/auth";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  Plus,
  TrendingUp,
  FlaskConical,
  Stethoscope,
  ShoppingBag,
  MessageSquareText,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  Sparkles,
  FolderHeart,
  Zap,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const today = format(new Date(), "EEEE, MMMM do");

  const [latestDoc, recentAnomaly, docCount, markerCount] = userId
    ? await Promise.all([
        prisma.document.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.extractedData.findFirst({
          where: { userId, flag: { in: ["high", "low", "High", "Low"] } },
          orderBy: { testDate: "desc" },
        }),
        prisma.document.count({ where: { userId } }),
        prisma.extractedData.count({ where: { userId } }),
      ])
    : [null, null, 0, 0];

  const isEmpty = docCount === 0;

  const daysSinceUpload = latestDoc
    ? Math.floor(
        (Date.now() - new Date(latestDoc.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12">

      {/* Greeting */}
      <header className="px-6 pt-10 pb-6">
        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          {today}
        </p>
        <h1 className="text-[32px] font-extrabold text-[#111827] tracking-tight leading-tight">
          Good morning,{" "}
          <span className="text-[#1A365D]">{firstName}.</span>
        </h1>
      </header>

      <main className="px-6 space-y-5">

        {isEmpty ? (
          <>
            {/* Welcome / CTA hero card */}
            <div className="bg-[#1A365D] rounded-[28px] p-6 shadow-lg shadow-[#1A365D]/20 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-[16px] flex items-center justify-center mb-4 border border-white/20">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-[20px] font-extrabold text-white tracking-tight mb-2">
                  Your health journey starts here
                </h2>
                <p className="text-[14px] text-blue-200 font-medium leading-relaxed mb-5">
                  Upload a lab report and we&apos;ll extract your biomarkers,
                  build your health timeline, and guide your next action.
                </p>
                <Link href="/upload">
                  <button className="flex items-center gap-2 bg-white text-[#1A365D] font-bold text-[14px] px-5 py-3 rounded-[14px] shadow-sm hover:bg-blue-50 transition-colors active:scale-95">
                    <Plus className="w-4 h-4" />
                    Upload First Report
                  </button>
                </Link>
              </div>
            </div>

            {/* Setup steps */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
              <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                Get started in 3 steps
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Upload a lab report",
                    desc: "Blood test, lipid profile, CBC — any report works.",
                    done: false,
                    href: "/upload",
                  },
                  {
                    step: "2",
                    title: "Review extracted data",
                    desc: "We extract every biomarker automatically.",
                    done: false,
                    href: null,
                  },
                  {
                    step: "3",
                    title: "Track your trends",
                    desc: "See how your health evolves over time.",
                    done: false,
                    href: null,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-slate-800">
                        {item.title}
                      </p>
                      <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature preview grid */}
            <div>
              <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                What you&apos;ll unlock
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: TrendingUp,
                    label: "Trend Engine",
                    desc: "Track biomarkers over time",
                    color: "bg-blue-50 text-blue-600",
                  },
                  {
                    icon: Sparkles,
                    label: "AI Insights",
                    desc: "Query your health history",
                    color: "bg-violet-50 text-violet-600",
                  },
                  {
                    icon: Zap,
                    label: "Smart Nudges",
                    desc: "Know when to retest",
                    color: "bg-amber-50 text-amber-600",
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm"
                  >
                    <div
                      className={`w-9 h-9 rounded-[12px] flex items-center justify-center mb-3 ${f.color}`}
                    >
                      <f.icon className="w-5 h-5" />
                    </div>
                    <p className="text-[12px] font-bold text-slate-800 leading-snug">
                      {f.label}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Health at a glance — stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Reports", value: docCount, icon: FolderHeart, color: "text-[#1A365D]", bg: "bg-blue-50" },
                { label: "Biomarkers", value: markerCount, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Trends", value: docCount > 1 ? "Active" : "—", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
                  <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center mb-2 ${stat.bg}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-[20px] font-extrabold text-slate-800 leading-none">{stat.value}</p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Insight card */}
            {recentAnomaly ? (
              <div className="bg-amber-50 rounded-[28px] p-6 border border-amber-200/60 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-amber-100 rounded-[16px] flex items-center justify-center shrink-0 text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-amber-900">Attention required</h2>
                    <p className="text-[13px] text-amber-700/80 font-medium leading-snug mt-1">
                      Your report from{" "}
                      {format(new Date(recentAnomaly.testDate), "MMM d")} flagged{" "}
                      <span className="font-bold">{recentAnomaly.markerName}</span> as{" "}
                      {recentAnomaly.flag}.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[13px] font-bold py-2.5 rounded-[14px] transition-colors shadow-sm">
                    Consult Doctor
                  </button>
                  <Link href="/vault" className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[13px] font-bold py-2.5 rounded-[14px] transition-colors text-center">
                    View Vault
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-[#1A365D] rounded-[28px] p-6 shadow-lg shadow-[#1A365D]/20 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-11 h-11 bg-emerald-500/20 rounded-[16px] flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white">All clear</h2>
                    <p className="text-[13px] text-blue-200 font-medium leading-snug mt-1">
                      No anomalies detected in your archived medical trends.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Smart nudge */}
            {daysSinceUpload !== null && daysSinceUpload > 90 && (
              <div className="bg-amber-50 rounded-[24px] p-5 border border-amber-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-[14px] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-amber-900">
                    Time for a new report
                  </p>
                  <p className="text-[13px] text-amber-700 font-medium mt-0.5 leading-relaxed">
                    Your last upload was {daysSinceUpload} days ago. Regular tests help you stay ahead of your health.
                  </p>
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-1 mt-3 text-[13px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-[10px] transition-colors"
                  >
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
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Recent Upload</p>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[16px] font-bold text-slate-800 truncate">{latestDoc.fileName}</p>
                  <p className="text-[13px] text-slate-400 font-medium mt-1">
                    {format(new Date(latestDoc.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </Link>
            )}
          </>
        )}

        {/* Health Actions — always visible */}
        <div>
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Health Actions
          </h3>
          <div className="space-y-3">

            {/* Book Lab Test */}
            <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4 opacity-70">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-[16px] flex items-center justify-center shrink-0">
                  <FlaskConical className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-slate-800">Book Lab Test</p>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wide">
                      Soon
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                    Redcliffe · Thyrocare · 1mg
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 shrink-0" />
            </div>

            {/* Consult Doctor */}
            <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4 opacity-70">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-[16px] flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-slate-800">Consult Doctor</p>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wide">
                      Soon
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                    Book specialists · Share report timeline
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 shrink-0" />
            </div>

            {/* Health Store */}
            <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4 opacity-70">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-50 rounded-[16px] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-slate-800">Health Store</p>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wide">
                      Soon
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                    Supplements · Devices · Test kits
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 shrink-0" />
            </div>

          </div>
        </div>

        {/* AI Assistant card */}
        <Link href="/chat" className="block outline-none group">
          <div className="bg-gradient-to-br from-[#1A365D] to-[#1e4080] p-5 rounded-[20px] shadow-md flex items-center justify-between transition-transform hover:-translate-y-0.5 active:scale-[0.99]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-[12px] flex items-center justify-center border border-white/10">
                <MessageSquareText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-white">Ask Ledger AI</p>
                <p className="text-[12px] text-blue-200 font-medium mt-0.5">
                  Query your health history
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

      </main>
    </div>
  );
}
