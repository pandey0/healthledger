"use client";

import { signIn } from "next-auth/react";
import {
  Activity, TrendingUp, Sparkles, ShieldCheck,
  FlaskConical, ArrowRight, CheckCircle, Upload,
  BarChart3, MessageSquareText, Lock,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Any Lab Report",
    description: "Blood tests, lipid profiles, CBC, thyroid panels — photos or PDFs. AI extracts every value instantly.",
    gradient: "from-teal-400 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Track Trends Over Time",
    description: "Every biomarker plotted against your full history and compared to personalised reference ranges.",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    icon: Sparkles,
    title: "AI Health Intelligence",
    description: "Ask anything in plain language — \"Is my HbA1c improving?\" — and get answers from your own data.",
    gradient: "from-violet-400 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Know When to Act",
    description: "Smart nudges tell you when a retest is overdue and which markers need a doctor's attention.",
    gradient: "from-amber-400 to-orange-500",
  },
];

const steps = [
  { n: "01", title: "Upload a report", desc: "Photo or PDF. Our AI reads and extracts every biomarker in seconds." },
  { n: "02", title: "Review & confirm", desc: "Check the extracted values, fix anything the AI missed, set the date." },
  { n: "03", title: "Track your health", desc: "Chart trends, compare to your reference ranges, ask Ledger AI anything." },
];

const trust = ["End-to-end encrypted", "HIPAA compliant", "No ads, ever", "You own your data"];

export default function LandingPage() {
  const handleSignIn = () => signIn("google", { callbackUrl: "/home" });

  return (
    <div className="min-h-screen bg-[#0C1A2E] text-white antialiased selection:bg-teal-800">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0C1A2E]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[10px] flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-[18px] tracking-tight text-white">HealthLedger</span>
          </div>
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-[13px] font-bold px-5 py-2.5 rounded-[12px] transition-all shadow-lg shadow-teal-500/25 hover:-translate-y-px active:scale-95"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 px-6 overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[12px] font-bold px-4 py-1.5 rounded-full mb-8 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Personal Health Intelligence Platform
          </div>

          <h1 className="text-[44px] md:text-[68px] font-extrabold leading-[1.05] tracking-tight mb-6">
            Your lab results,{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              finally make sense.
            </span>
          </h1>

          <p className="text-[17px] md:text-[20px] text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            Upload any lab report. AI extracts every biomarker, tracks trends over time, and tells you exactly what to watch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignIn}
              className="flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold text-[16px] px-8 py-4 rounded-[18px] transition-all shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white opacity-90">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <p className="text-[13px] text-slate-500 font-medium">Free to start · No credit card</p>
          </div>

          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-10">
            {trust.map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
                <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Mock UI preview */}
        <div className="relative z-10 max-w-sm mx-auto mt-16 md:mt-20">
          <div className="bg-[#F4F3F0] rounded-[28px] shadow-2xl shadow-black/40 overflow-hidden border border-white/10 p-4 space-y-3">
            {/* Mini markers */}
            {[
              { name: "Hemoglobin", value: "14.5", unit: "g/dL", flag: "normal", color: "bg-emerald-400/70" },
              { name: "LDL Cholesterol", value: "142", unit: "mg/dL", flag: "high", color: "bg-amber-400" },
              { name: "HbA1c", value: "5.4", unit: "%", flag: "normal", color: "bg-emerald-400/70" },
              { name: "Vitamin D", value: "18", unit: "ng/mL", flag: "low", color: "bg-red-400" },
            ].map((m) => (
              <div key={m.name} className="bg-white rounded-[16px] border border-slate-100 shadow-sm overflow-hidden flex items-stretch">
                <div className={`w-1 shrink-0 ${m.color}`} />
                <div className="flex-1 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{m.name}</p>
                    {m.flag !== "normal" && (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                        m.flag === "high" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>{m.flag}</span>
                    )}
                  </div>
                  <p className="text-[17px] font-extrabold text-slate-800 tabular-nums">
                    {m.value} <span className="text-[11px] font-semibold text-slate-400">{m.unit}</span>
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-1.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <p className="text-[11px] font-semibold text-slate-400">4 of 18 biomarkers · 2 flagged</p>
            </div>
          </div>
          {/* Glow under card */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-teal-500/20 blur-2xl rounded-full" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 md:py-28 px-6 bg-[#0F1F3D]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] font-bold text-teal-400 uppercase tracking-widest mb-3">What you get</p>
            <h2 className="text-[30px] md:text-[42px] font-extrabold text-white tracking-tight">
              Everything your health data needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-[24px] p-6 hover:bg-white/8 transition-colors group">
                <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[17px] font-extrabold text-white tracking-tight mb-2">{f.title}</h3>
                <p className="text-[14px] text-slate-400 font-medium leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] font-bold text-teal-400 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-[30px] md:text-[42px] font-extrabold text-white tracking-tight">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <div key={s.n} className="relative bg-white/5 border border-white/10 rounded-[24px] p-6">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-9 left-full w-5 border-t border-dashed border-white/20 z-10" />
                )}
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-[16px] flex items-center justify-center mb-5 shadow-lg shadow-teal-500/25">
                  <span className="text-[16px] font-extrabold text-white">{s.n}</span>
                </div>
                <h3 className="text-[16px] font-extrabold text-white mb-2">{s.title}</h3>
                <p className="text-[14px] text-slate-400 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 rounded-[32px] p-10 md:p-14 text-center overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[20px] flex items-center justify-center mx-auto mb-7 shadow-xl shadow-teal-500/30">
                <Activity className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-[28px] md:text-[38px] font-extrabold text-white tracking-tight mb-4">
                Take control of your health
              </h2>
              <p className="text-[15px] text-slate-400 font-medium leading-relaxed mb-8 max-w-md mx-auto">
                Join the platform that turns your lab reports into a personal health intelligence system.
              </p>

              <button
                onClick={handleSignIn}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold text-[15px] px-8 py-4 rounded-[16px] transition-all shadow-xl shadow-teal-500/30 hover:-translate-y-0.5 active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white opacity-90">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Get Started Free
              </button>

              <div className="flex items-center justify-center gap-2 mt-5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-[12px] font-semibold text-slate-500">Secure · Private · HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[8px] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-[14px] text-white">HealthLedger</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium text-center">
            Reference ranges are general guidelines. Always consult a healthcare professional.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-slate-600 font-medium">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
