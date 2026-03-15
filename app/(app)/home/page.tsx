import { auth } from "@/auth";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  Activity, Plus, TrendingUp,
  MessageSquareText, AlertTriangle, CheckCircle2,
  ArrowRight, ChevronRight, Clock, Sparkles, Zap,
  ArrowUpRight, ArrowDownRight, Pill, Settings2,
} from "lucide-react";
import EcosystemCarousel from "@/components/home/EcosystemCarousel";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import TourStarter from "@/components/onboarding/TourStarter";
import { TRACKER_META, FREQUENCY_LABELS } from "@/lib/actions/health";
import type { MedFrequency } from "@/lib/actions/health";

// ─── Medication reminder hint ────────────────────────────────────────────────

function getMedHint(frequency: string, hour: number): { label: string; urgent: boolean } {
  switch (frequency) {
    case "once_daily":
      if (hour < 10)  return { label: "Due this morning", urgent: true };
      if (hour < 22)  return { label: "Due today", urgent: false };
      return { label: "Due tomorrow", urgent: false };
    case "twice_daily":
      if (hour < 9)   return { label: "Morning & evening doses due", urgent: true };
      if (hour < 15)  return { label: "Evening dose due later", urgent: false };
      if (hour < 21)  return { label: "Evening dose due now", urgent: true };
      return { label: "Due tomorrow morning", urgent: false };
    case "thrice_daily":
      return { label: "3 doses today", urgent: false };
    case "four_times_daily":
      return { label: "4 doses today", urgent: false };
    case "as_needed":
      return { label: "Take as needed", urgent: false };
    case "weekly":
      return { label: "Due this week", urgent: false };
    default:
      return { label: "Check schedule", urgent: false };
  }
}

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = format(new Date(), "EEEE, MMMM do");

  const [latestDoc, docCount, flaggedMarkers, userProfile, recentReadings, activeMeds] = userId
    ? await Promise.all([
        prisma.document.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
          select: { id: true, fileName: true, createdAt: true, reportType: true },
        }),
        prisma.document.count({ where: { userId } }),
        prisma.extractedData.findMany({
          where: { userId, flag: { in: ["high", "low", "High", "Low"] } },
          orderBy: { testDate: "desc" },
          take: 5,
          distinct: ["markerName"],
          select: { markerName: true, numericValue: true, unit: true, flag: true, testDate: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { gender: true, dateOfBirth: true },
        }),
        // Recent manual readings across all trackers
        prisma.manualReading.findMany({
          where: { userId },
          orderBy: { recordedAt: "desc" },
          take: 5,
          include: {
            tracker: { select: { paramType: true, unit: true } },
          },
        }),
        // Active medications
        prisma.medication.findMany({
          where: { userId, isActive: true },
          orderBy: { createdAt: "asc" },
        }),
      ])
    : [null, 0, [], null, [], []];

  const profileIncomplete = !userProfile?.gender && !userProfile?.dateOfBirth;
  const isEmpty = docCount === 0;
  const daysSinceUpload = latestDoc
    ? Math.floor((Date.now() - new Date(latestDoc.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const hasReadings  = recentReadings.length > 0;
  const hasMeds      = activeMeds.length > 0;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-28 md:pb-12">
      <OnboardingFlow firstName={firstName} profileIncomplete={profileIncomplete} />

      {/* Greeting header */}
      <header className="px-6 pt-10 pb-6">
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{today}</p>
        <h1 className="text-[30px] font-extrabold text-slate-900 tracking-tight leading-tight">
          {greeting},{" "}
          <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">{firstName}.</span>
        </h1>
      </header>

      <main className="px-6 space-y-5">

        {/* ── Today's Medications ────────────────────────────────────────────── */}
        {(hasMeds || !isEmpty) && (
          <section>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-violet-500" />
                <p className="text-[13px] font-bold text-slate-700">Today&apos;s Medications</p>
              </div>
              <Link
                href="/trackers"
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
              >
                Manage <Settings2 className="w-3.5 h-3.5" />
              </Link>
            </div>

            {hasMeds ? (
              <div className="bg-white rounded-[22px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {activeMeds.map((med) => {
                    const hint = getMedHint(med.frequency, hour);
                    return (
                      <div key={med.id} className="flex items-center justify-between px-4 py-3.5 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
                            hint.urgent ? "bg-violet-100" : "bg-slate-100"
                          }`}>
                            <Pill className={`w-4 h-4 ${hint.urgent ? "text-violet-600" : "text-slate-400"}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[14px] font-bold text-slate-800 truncate">{med.name}</p>
                              <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                                {med.dosage}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {FREQUENCY_LABELS[med.frequency as MedFrequency] ?? med.frequency}
                              {med.notes && <span className="ml-1">· {med.notes}</span>}
                            </p>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${
                          hint.urgent
                            ? "bg-violet-100 text-violet-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {hint.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Add medication footer */}
                <Link
                  href="/trackers"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-t border-slate-50 text-[12px] font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add / edit medications
                </Link>
              </div>
            ) : (
              /* Empty state */
              <Link href="/trackers" className="block group">
                <div className="bg-white rounded-[22px] border border-dashed border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 transition-colors">
                  <div className="w-10 h-10 rounded-[13px] bg-violet-50 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-slate-700">Add your medications</p>
                    <p className="text-[12px] text-slate-400 font-medium mt-0.5">Log your prescriptions and we&apos;ll remind you daily.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </Link>
            )}
          </section>
        )}

        {/* ── Lab Report Content ─────────────────────────────────────────────── */}
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
                <div className="flex items-center gap-4">
                  <Link href="/upload">
                    <button className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold text-[14px] px-5 py-3 rounded-[14px] shadow-lg shadow-teal-500/30 hover:from-teal-300 hover:to-cyan-400 transition-all active:scale-95">
                      <Plus className="w-4 h-4" />
                      Upload First Report
                    </button>
                  </Link>
                  <TourStarter isEmpty={isEmpty} />
                </div>
              </div>
            </div>

            {/* Setup steps */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
              <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Get started in 3 steps</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Upload a lab report",   desc: "Blood test, lipid profile, CBC — any report works.", done: true  },
                  { step: "2", title: "Review extracted data", desc: "AI extracts every biomarker automatically.",           done: false },
                  { step: "3", title: "Track your trends",     desc: "See how your health evolves over time.",              done: false },
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
            {/* Flagged markers or all-clear */}
            {flaggedMarkers.length > 0 ? (
              <div className="bg-white rounded-[24px] border border-amber-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-amber-50">
                  <div className="w-8 h-8 bg-amber-50 rounded-[10px] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-800">
                      {flaggedMarkers.length} marker{flaggedMarkers.length > 1 ? "s" : ""} outside normal range
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">Based on your most recent readings</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {flaggedMarkers.map((m) => {
                    const isHigh = m.flag?.toLowerCase() === "high";
                    return (
                      <Link
                        key={m.markerName}
                        href={`/vault/marker/${encodeURIComponent(m.markerName)}`}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-slate-700 capitalize">{m.markerName}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {format(new Date(m.testDate), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-full ${
                            isHigh ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                          }`}>
                            {isHigh
                              ? <ArrowUpRight className="w-3.5 h-3.5" />
                              : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {m.numericValue} {m.unit}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="px-5 py-3 border-t border-slate-50">
                  <Link href="/vault" className="text-[12px] font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
                    View full vault <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[24px] p-5 border border-emerald-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-[14px] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-800">All markers within range</p>
                  <p className="text-[12px] text-slate-400 font-medium mt-0.5">No anomalies found in your recent readings.</p>
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

            {/* Latest report */}
            {latestDoc && (
              <Link href={`/vault/${latestDoc.id}`} className="block group outline-none">
                <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Latest Report</p>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[16px] font-bold text-slate-800 truncate">{latestDoc.fileName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[12px] text-slate-400 font-medium">{format(new Date(latestDoc.createdAt), "MMMM d, yyyy")}</p>
                    {latestDoc.reportType && (
                      <span className="text-[11px] font-semibold text-slate-400">· {latestDoc.reportType}</span>
                    )}
                  </div>
                </div>
              </Link>
            )}
          </>
        )}

        {/* ── Recent Health Readings ─────────────────────────────────────────── */}
        {hasReadings && (
          <section>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-500" />
                <p className="text-[13px] font-bold text-slate-700">Recent Readings</p>
              </div>
              <Link
                href="/trackers"
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-[22px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50">
                {recentReadings.map((r) => {
                  const meta = TRACKER_META[r.tracker.paramType as keyof typeof TRACKER_META];
                  return (
                    <Link
                      key={r.id}
                      href="/trackers"
                      className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[20px] leading-none">{meta?.emoji ?? "📊"}</span>
                        <div>
                          <p className="text-[13px] font-bold text-slate-800">{meta?.label ?? r.tracker.paramType}</p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {formatDistanceToNow(new Date(r.recordedAt), { addSuffix: true })}
                            {r.notes && <span className="ml-1">· {r.notes}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-extrabold text-slate-900">{r.value}</span>
                        <span className="text-[11px] font-semibold text-slate-400">{r.tracker.unit}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all ml-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              <Link
                href="/trackers"
                className="flex items-center justify-center gap-2 px-4 py-3 border-t border-slate-50 text-[12px] font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Log a new reading
              </Link>
            </div>
          </section>
        )}

        {/* ── Ecosystem Carousel ─────────────────────────────────────────────── */}
        <EcosystemCarousel />

        {/* ── AI Assistant ───────────────────────────────────────────────────── */}
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
