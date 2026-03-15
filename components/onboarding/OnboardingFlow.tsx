"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Activity, Calendar, ChevronRight, CheckCircle2, ArrowRight, X, Loader2 } from "lucide-react";
import { updateUserProfile } from "@/lib/actions/user";

const STORAGE_KEY = "hl_onboarding_done";

type Step = "welcome" | "profile" | "ready";
type Gender = "male" | "female" | "other";

type Props = {
  firstName: string;
  profileIncomplete: boolean;
};

export default function OnboardingFlow({ firstName, profileIncomplete }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [gender, setGender] = useState<Gender | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!profileIncomplete) return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, [profileIncomplete]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleSaveProfile = () => {
    startTransition(async () => {
      await updateUserProfile({
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
      });
      setStep("ready");
    });
  };

  const handleUpload = () => {
    dismiss();
    router.push("/upload");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-[#F4F3F0] rounded-[28px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-400">

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-500 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pt-5 pb-1">
          {(["welcome", "profile", "ready"] as Step[]).map((s) => (
            <div
              key={s}
              className={`rounded-full transition-all duration-300 ${
                s === step ? "w-5 h-1.5 bg-[#1A365D]" : "w-1.5 h-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* ── STEP 1: Welcome ── */}
        {step === "welcome" && (
          <div className="p-6 pt-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[16px] flex items-center justify-center shadow-lg shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Welcome</p>
                <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Hi, {firstName}!
                </h2>
              </div>
            </div>

            <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
              HealthLedger turns your lab reports into a personal health timeline — automatically.
            </p>

            <div className="space-y-3">
              {[
                { icon: "🧬", title: "AI extracts every biomarker", desc: "Upload any lab PDF and we pull out every value instantly." },
                { icon: "📈", title: "Track trends over time", desc: "See how your markers change across reports and years." },
                { icon: "🎯", title: "Personalised reference ranges", desc: "Ranges tuned to your age and biological sex — not population averages." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 bg-white rounded-[16px] p-3.5 border border-slate-100 shadow-sm">
                  <span className="text-[20px] shrink-0 leading-none mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{item.title}</p>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("profile")}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A365D] hover:bg-[#12243e] text-white font-bold text-[14px] rounded-[16px] shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Set up my profile
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={dismiss}
              className="w-full text-center text-[12px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* ── STEP 2: Profile ── */}
        {step === "profile" && (
          <div className="p-6 pt-4 space-y-5">
            <div>
              <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Your profile</h2>
              <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">
                This lets us show reference ranges that are accurate for <em>you</em>, not just population averages.
              </p>
            </div>

            {/* Biological sex */}
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-4 space-y-3">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Biological Sex</p>
              <div className="grid grid-cols-3 gap-2">
                {(["male", "female", "other"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`py-3 rounded-[14px] text-[13px] font-bold capitalize transition-all border ${
                      gender === g
                        ? "bg-[#1A365D] text-white border-[#1A365D] shadow-md"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Date of birth */}
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-4 space-y-2">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full pl-9 pr-4 py-3 text-[14px] font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
              </div>
              {dateOfBirth && (
                <p className="text-[11px] text-slate-400 font-medium ml-1">
                  Age: {(() => {
                    const d = new Date(dateOfBirth);
                    const today = new Date();
                    let age = today.getFullYear() - d.getFullYear();
                    if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
                    return age;
                  })()} years old
                </p>
              )}
            </div>

            {/* Personalised range preview */}
            {(gender === "male" || gender === "female") && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-[16px] p-3.5">
                <p className="text-[12px] font-bold text-emerald-800 mb-1.5">Personalised ranges unlocked for:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {["Hemoglobin", "Hematocrit", "Ferritin", "HDL Cholesterol", "Creatinine", gender === "male" ? "Testosterone" : "Estradiol"].map((m) => (
                    <div key={m} className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-700">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={isPending || (!gender && !dateOfBirth)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A365D] hover:bg-[#12243e] disabled:opacity-50 text-white font-bold text-[14px] rounded-[16px] shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <>Save & continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>

            <button
              onClick={() => setStep("ready")}
              className="w-full text-center text-[12px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors"
            >
              Skip this step
            </button>
          </div>
        )}

        {/* ── STEP 3: Ready ── */}
        {step === "ready" && (
          <div className="p-6 pt-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-[16px] flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">You&apos;re all set</p>
                <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Ready to go!
                </h2>
              </div>
            </div>

            <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
              Upload your first lab report and HealthLedger will extract every biomarker automatically. Any PDF or image works — blood tests, lipid panels, CBC, thyroid, and more.
            </p>

            <div className="bg-white rounded-[20px] border border-slate-100 p-4 space-y-2.5">
              {[
                "Blood chemistry panels",
                "Complete blood count (CBC)",
                "Lipid profiles",
                "Thyroid function tests",
                "Liver & kidney function",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  </div>
                  <p className="text-[13px] font-semibold text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-[14px] rounded-[16px] shadow-lg shadow-teal-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Upload my first report
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={dismiss}
              className="w-full text-center text-[12px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors"
            >
              I&apos;ll explore first
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
