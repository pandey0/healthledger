"use client";

import { signIn } from "next-auth/react";
import { Activity, TrendingUp, Sparkles, ShieldCheck, FlaskConical, Stethoscope, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "Upload Any Lab Report",
    description: "Blood tests, lipid profiles, CBC, thyroid panels, vitamin tests — snap a photo and we handle the rest.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Track Trends Over Time",
    description: "Every biomarker is plotted against your history and compared to standard reference ranges automatically.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Sparkles,
    title: "AI Health Intelligence",
    description: "Ask questions in plain language — \"Is my HbA1c improving?\" — and get answers grounded in your actual data.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Stethoscope,
    title: "Know When to Act",
    description: "Smart nudges tell you when a retest is overdue and which markers warrant a conversation with your doctor.",
    color: "bg-amber-50 text-amber-600",
  },
];

const steps = [
  { step: "01", title: "Upload a report", desc: "Take a photo of any lab report. Our AI reads and extracts every value." },
  { step: "02", title: "Review extracted data", desc: "See all your biomarkers listed with their values, units, and flags." },
  { step: "03", title: "Track your health", desc: "Chart trends, compare to reference ranges, and ask our AI anything." },
];

const trustPoints = [
  "End-to-end encrypted",
  "HIPAA compliant",
  "No ads, ever",
  "You own your data",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-blue-100 antialiased">

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#1A365D] rounded-[10px]">
              <Activity className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <span className="font-extrabold text-[18px] tracking-tight text-[#111827]">HealthLedger</span>
          </div>
          <button
            onClick={() => signIn("google", { callbackUrl: "/home" })}
            className="flex items-center gap-2 bg-[#1A365D] hover:bg-[#12243e] text-white text-[14px] font-semibold px-5 py-2.5 rounded-[12px] transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-[13px] font-bold px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Your personal health intelligence platform
          </div>

          <h1 className="text-[44px] md:text-[64px] font-extrabold text-[#111827] leading-[1.1] tracking-tight mb-6">
            Your health data,<br />
            <span className="text-[#1A365D]">finally organized.</span>
          </h1>

          <p className="text-[18px] md:text-[20px] text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            Upload lab reports, track biomarkers over time, and get AI-powered answers — all in one secure place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/home" })}
              className="flex items-center gap-3 bg-[#1A365D] hover:bg-[#12243e] text-white font-bold text-[16px] px-8 py-4 rounded-[16px] transition-all shadow-lg shadow-[#1A365D]/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white opacity-80">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <p className="text-[13px] text-slate-400 font-medium">Free to start · No credit card needed</p>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10">
            {trustPoints.map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-[#F4F3F0]">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">What you get</p>
            <h2 className="text-[32px] md:text-[42px] font-extrabold text-slate-800 tracking-tight">
              Everything your health data needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-[24px] p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center mb-5 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-[18px] font-extrabold text-slate-800 tracking-tight mb-2">{f.title}</h3>
                <p className="text-[15px] text-slate-500 font-medium leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-[32px] md:text-[42px] font-extrabold text-slate-800 tracking-tight">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-full w-full h-px bg-slate-200 z-0 -translate-x-1/2" />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-[#1A365D] rounded-[18px] flex items-center justify-center mb-5 shadow-lg shadow-[#1A365D]/20">
                    <span className="text-[18px] font-extrabold text-white">{s.step}</span>
                  </div>
                  <h3 className="text-[18px] font-extrabold text-slate-800 mb-2">{s.title}</h3>
                  <p className="text-[15px] text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-[#1A365D]">
        <div className="max-w-3xl mx-auto text-center">

          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-[20px] flex items-center justify-center mx-auto mb-8">
            <Activity className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-[32px] md:text-[44px] font-extrabold text-white tracking-tight mb-4">
            Take control of your health
          </h2>
          <p className="text-[17px] text-blue-200 font-medium leading-relaxed mb-10 max-w-xl mx-auto">
            Join the platform that turns your lab reports into actionable health intelligence.
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/home" })}
            className="inline-flex items-center gap-3 bg-white hover:bg-blue-50 text-[#1A365D] font-bold text-[16px] px-8 py-4 rounded-[16px] transition-all shadow-lg hover:-translate-y-0.5 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Get Started Free
          </button>

          <div className="flex items-center justify-center gap-2 mt-6">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[13px] font-semibold text-blue-200">Secure · Private · HIPAA Compliant</span>
          </div>

        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="py-8 px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#1A365D] rounded-[8px]">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-[15px] text-slate-800">HealthLedger</span>
          </div>
          <p className="text-[12px] text-slate-400 font-medium">
            Reference ranges are general guidelines. Always consult a healthcare professional for medical advice.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-slate-400 font-medium">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
