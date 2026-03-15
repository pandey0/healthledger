"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X, ArrowRight, Upload, FolderHeart,
  TrendingUp, MessageSquareText, ChevronLeft,
} from "lucide-react";

export const TOUR_KEY = "hl_tour_done";

const steps = [
  {
    icon: Upload,
    gradient: "from-teal-400 to-cyan-500",
    title: "Upload any lab report",
    body: "Take a photo or upload a PDF — blood tests, lipid panels, thyroid, vitamins, and more. Our AI extracts every biomarker in seconds.",
    visual: (
      <div className="bg-white/10 rounded-[20px] p-4 space-y-2">
        {["Blood CBC · 18 markers", "Lipid Profile · 6 markers", "Thyroid Panel · 4 markers"].map((t) => (
          <div key={t} className="flex items-center gap-2.5 bg-white/10 rounded-[12px] px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-teal-300 shrink-0" />
            <p className="text-[12px] font-semibold text-white/80">{t}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: FolderHeart,
    gradient: "from-blue-400 to-indigo-500",
    title: "Your health vault",
    body: "Every report and biomarker is stored securely. Search, filter by type, and drill into any marker to see your full history.",
    visual: (
      <div className="bg-white/10 rounded-[20px] p-4 space-y-2">
        {[
          { name: "Hemoglobin", val: "14.5 g/dL", flag: "normal" },
          { name: "LDL Cholesterol", val: "142 mg/dL", flag: "high" },
          { name: "Vitamin D", val: "18 ng/mL", flag: "low" },
        ].map((m) => (
          <div key={m.name} className="flex items-center justify-between bg-white/10 rounded-[12px] px-3 py-2">
            <p className="text-[12px] font-semibold text-white/80">{m.name}</p>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                m.flag === "high" ? "bg-amber-400/30 text-amber-200" :
                m.flag === "low"  ? "bg-red-400/30 text-red-200" :
                "bg-emerald-400/30 text-emerald-200"
              }`}>{m.flag}</span>
              <p className="text-[11px] font-bold text-white/70">{m.val}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: TrendingUp,
    gradient: "from-violet-400 to-purple-600",
    title: "Track trends over time",
    body: "Tap any biomarker to see its full history plotted as a chart. See your lowest, highest, and how it's changed across all your reports.",
    visual: (
      <div className="bg-white/10 rounded-[20px] p-4">
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">LDL Cholesterol · 6 readings</p>
        <div className="flex items-end gap-1.5 h-16">
          {[60, 75, 85, 70, 90, 80].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className={`rounded-t-[4px] ${i === 4 ? "bg-amber-400" : "bg-white/40"}`}
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-white/40 font-medium">Jan</p>
          <p className="text-[10px] text-white/40 font-medium">Now</p>
        </div>
      </div>
    ),
  },
  {
    icon: MessageSquareText,
    gradient: "from-slate-500 to-[#1A365D]",
    title: "Ask Ledger AI anything",
    body: "Ask questions in plain language about your own data — \"Is my creatinine trending up?\" or \"Which markers improved this year?\"",
    visual: (
      <div className="bg-white/10 rounded-[20px] p-4 space-y-2">
        {[
          { q: true,  text: "Is my HbA1c improving?" },
          { q: false, text: "Yes — from 6.1% in March to 5.7% in October. That's a meaningful improvement." },
          { q: true,  text: "Should I be worried about my LDL?" },
        ].map((m, i) => (
          <div key={i} className={`rounded-[12px] px-3 py-2 max-w-[85%] ${m.q ? "ml-auto bg-white/20" : "bg-white/10"}`}>
            <p className="text-[11px] font-medium text-white/80 leading-snug">{m.text}</p>
          </div>
        ))}
      </div>
    ),
  },
];

interface DemoTourProps {
  show: boolean;
  open?: boolean;
  onClose?: () => void;
}

export default function DemoTour({ show, open: externalOpen, onClose }: DemoTourProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (externalOpen) {
      setStep(0);
      setVisible(true);
      return;
    }
    if (!show) return;
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setVisible(true);
  }, [show, externalOpen]);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
    onClose?.();
  };

  const finish = () => {
    dismiss();
    router.push("/upload");
  };

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative w-full max-w-md bg-[#0F1F3D] rounded-[28px] shadow-2xl overflow-hidden border border-white/10 animate-in slide-in-from-bottom-4 duration-400">

        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 pt-5 pb-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step ? "w-5 h-1.5 bg-teal-400" : "w-1.5 h-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        <div className="p-6 pt-4 space-y-5">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-[14px] bg-gradient-to-br ${current.gradient} flex items-center justify-center shadow-lg shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                Step {step + 1} of {steps.length}
              </p>
              <h2 className="text-[20px] font-extrabold text-white tracking-tight leading-tight">
                {current.title}
              </h2>
            </div>
          </div>

          <p className="text-[14px] text-slate-400 font-medium leading-relaxed">{current.body}</p>

          {current.visual}

          <div className="flex items-center gap-3 pt-1">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 px-4 py-2.5 rounded-[12px] border border-white/15 text-white/60 text-[13px] font-semibold hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              onClick={isLast ? finish : () => setStep((s) => s + 1)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold text-[14px] rounded-[14px] shadow-lg shadow-teal-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {isLast ? (
                <>Upload my first report <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          <button
            onClick={dismiss}
            className="w-full text-center text-[12px] font-semibold text-slate-600 hover:text-slate-400 py-1 transition-colors"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
