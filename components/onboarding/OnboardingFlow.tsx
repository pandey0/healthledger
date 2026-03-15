"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import {
  Activity, Calendar, ChevronRight, CheckCircle2,
  ArrowRight, X, Loader2, Plus, Trash2, Pill,
  ChevronLeft,
} from "lucide-react";
import { updateUserProfile } from "@/lib/actions/user";
import {
  saveHealthTrackers,
  saveMedications,
  type TrackerParamType,
  type MedFrequency,
  type MedicationPayload,
  FREQUENCY_LABELS,
} from "@/lib/actions/health";

const STORAGE_KEY = "hl_onboarding_done";

type Step = "welcome" | "profile" | "trackers" | "medications" | "ready";
type Gender = "male" | "female" | "other";

// ─── Tracker catalogue ────────────────────────────────────────────────────────
const TRACKER_OPTIONS: {
  type: TrackerParamType;
  label: string;
  unit: string;
  emoji: string;
  desc: string;
}[] = [
  { type: "blood_pressure", label: "Blood Pressure",  unit: "mmHg",  emoji: "🫀", desc: "Systolic / Diastolic" },
  { type: "blood_sugar",    label: "Blood Sugar",     unit: "mg/dL", emoji: "🩸", desc: "Fasting or random glucose" },
  { type: "weight",         label: "Body Weight",     unit: "kg",    emoji: "⚖️",  desc: "Daily or weekly weigh-in" },
  { type: "heart_rate",     label: "Heart Rate",      unit: "bpm",   emoji: "💓", desc: "Resting pulse" },
  { type: "spo2",           label: "Oxygen (SpO₂)",   unit: "%",     emoji: "🫁", desc: "Blood oxygen saturation" },
  { type: "temperature",    label: "Temperature",     unit: "°C",    emoji: "🌡️", desc: "Body temperature" },
  { type: "hba1c",          label: "HbA1c",           unit: "%",     emoji: "📊", desc: "Glycated haemoglobin" },
];

// ─── Frequency options ────────────────────────────────────────────────────────
const FREQUENCIES: MedFrequency[] = [
  "once_daily",
  "twice_daily",
  "thrice_daily",
  "four_times_daily",
  "as_needed",
  "weekly",
];

type LocalMed = MedicationPayload & { _id: string };

type Props = {
  firstName: string;
  profileIncomplete: boolean;
};

const STEPS: Step[] = ["welcome", "profile", "trackers", "medications", "ready"];

export default function OnboardingFlow({ firstName, profileIncomplete }: Props) {
  const [visible, setVisible]         = useState(false);
  const [step, setStep]               = useState<Step>("welcome");
  const [gender, setGender]           = useState<Gender | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedTrackers, setSelectedTrackers] = useState<Set<TrackerParamType>>(new Set());
  const [hasMeds, setHasMeds]         = useState<boolean | null>(null);
  const [meds, setMeds]               = useState<LocalMed[]>([]);
  const [addingMed, setAddingMed]     = useState(false);
  const [newMed, setNewMed]           = useState<Omit<LocalMed, "_id">>({
    name: "", dosage: "", frequency: "once_daily", notes: "",
  });

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

  const stepIndex = STEPS.indexOf(step);

  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  };

  // ── Step handlers ────────────────────────────────────────────────────────────

  const handleSaveProfile = () => {
    startTransition(async () => {
      await updateUserProfile({
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
      });
      setStep("trackers");
    });
  };

  const handleSaveTrackers = () => {
    startTransition(async () => {
      await saveHealthTrackers(Array.from(selectedTrackers));
      setStep("medications");
    });
  };

  const handleSaveMedications = () => {
    startTransition(async () => {
      if (hasMeds && meds.length > 0) {
        await saveMedications(meds.map(({ _id, ...m }) => m));
      }
      setStep("ready");
    });
  };

  const handleFinish = () => {
    dismiss();
    router.push("/upload");
  };

  // ── Medication helpers ───────────────────────────────────────────────────────

  const toggleTracker = (type: TrackerParamType) => {
    setSelectedTrackers((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const addMed = () => {
    if (!newMed.name.trim() || !newMed.dosage.trim()) return;
    setMeds((prev) => [...prev, { ...newMed, _id: nanoid() }]);
    setNewMed({ name: "", dosage: "", frequency: "once_daily", notes: "" });
    setAddingMed(false);
  };

  const removeMed = (id: string) => setMeds((prev) => prev.filter((m) => m._id !== id));

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative w-full max-w-md bg-[#F4F3F0] rounded-[28px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-400 max-h-[90vh] flex flex-col">

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pt-5 pb-1 shrink-0">
          {STEPS.map((s) => (
            <div
              key={s}
              className={`rounded-full transition-all duration-300 ${
                s === step
                  ? "w-5 h-1.5 bg-[#1A365D]"
                  : STEPS.indexOf(s) < stepIndex
                  ? "w-1.5 h-1.5 bg-teal-400"
                  : "w-1.5 h-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">

          {/* ── STEP 1: Welcome ──────────────────────────────────────────────── */}
          {step === "welcome" && (
            <div className="p-6 pt-4 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-[16px] flex items-center justify-center shadow-lg shrink-0">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Welcome</p>
                  <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">Hi, {firstName}!</h2>
                </div>
              </div>

              <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
                Let&apos;s set up your health profile in a few quick steps. This helps us personalise everything for you.
              </p>

              <div className="space-y-2.5">
                {[
                  { emoji: "🧬", title: "AI extracts every biomarker",     desc: "Upload any lab PDF and we pull out every value instantly." },
                  { emoji: "📈", title: "Track trends over time",           desc: "See how your markers change across reports and years." },
                  { emoji: "💊", title: "Manage medications",               desc: "Log your prescriptions and get reminders." },
                  { emoji: "📏", title: "Log daily measurements",           desc: "BP, blood sugar, weight — all in one place." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 bg-white rounded-[16px] p-3.5 border border-slate-100 shadow-sm">
                    <span className="text-[18px] shrink-0 leading-none mt-0.5">{item.emoji}</span>
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
                Get started <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={dismiss} className="w-full text-center text-[12px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors">
                Skip for now
              </button>
            </div>
          )}

          {/* ── STEP 2: Profile ──────────────────────────────────────────────── */}
          {step === "profile" && (
            <div className="p-6 pt-4 space-y-5">
              <div>
                <button onClick={goBack} className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600 mb-3 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
                <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Your profile</h2>
                <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">
                  Used to show reference ranges accurate <em>for you</em>, not population averages.
                </p>
              </div>

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

              {(gender === "male" || gender === "female") && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-[16px] p-3.5">
                  <p className="text-[12px] font-bold text-emerald-800 mb-1.5">Personalised ranges unlocked for:</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {["Hemoglobin", "Hematocrit", "Ferritin", "HDL Cholesterol", "Creatinine",
                      gender === "male" ? "Testosterone" : "Estradiol"].map((m) => (
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
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>Save & continue <ChevronRight className="w-4 h-4" /></>}
              </button>
              <button onClick={() => setStep("trackers")} className="w-full text-center text-[12px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors">
                Skip this step
              </button>
            </div>
          )}

          {/* ── STEP 3: Health Trackers ───────────────────────────────────────── */}
          {step === "trackers" && (
            <div className="p-6 pt-4 space-y-5">
              <div>
                <button onClick={goBack} className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600 mb-3 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
                <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Health tracking</h2>
                <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">
                  Do you regularly measure any of these at home? Select all that apply.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {TRACKER_OPTIONS.map((opt) => {
                  const selected = selectedTrackers.has(opt.type);
                  return (
                    <button
                      key={opt.type}
                      onClick={() => toggleTracker(opt.type)}
                      className={`text-left rounded-[18px] p-3.5 border transition-all ${
                        selected
                          ? "bg-[#0F1F3D] border-[#0F1F3D] shadow-md"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="text-[22px] leading-none">{opt.emoji}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected ? "bg-teal-400 border-teal-400" : "border-slate-300"
                        }`}>
                          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className={`text-[13px] font-bold leading-tight ${selected ? "text-white" : "text-slate-800"}`}>
                        {opt.label}
                      </p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${selected ? "text-white/60" : "text-slate-400"}`}>
                        {opt.unit} · {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedTrackers.size > 0 && (
                <div className="bg-teal-50 border border-teal-100 rounded-[14px] px-4 py-2.5">
                  <p className="text-[12px] font-semibold text-teal-700">
                    {selectedTrackers.size} tracker{selectedTrackers.size > 1 ? "s" : ""} selected — you can log readings from your home dashboard.
                  </p>
                </div>
              )}

              <button
                onClick={handleSaveTrackers}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A365D] hover:bg-[#12243e] disabled:opacity-50 text-white font-bold text-[14px] rounded-[16px] shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>Continue <ChevronRight className="w-4 h-4" /></>}
              </button>
              <button onClick={() => setStep("medications")} className="w-full text-center text-[12px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors">
                Skip this step
              </button>
            </div>
          )}

          {/* ── STEP 4: Medications ──────────────────────────────────────────── */}
          {step === "medications" && (
            <div className="p-6 pt-4 space-y-5">
              <div>
                <button onClick={goBack} className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600 mb-3 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-violet-100 rounded-[14px] flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-violet-600" />
                  </div>
                  <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Medications</h2>
                </div>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                  Do you take any regular medications or supplements?
                </p>
              </div>

              {/* Yes / No toggle */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: true,  label: "Yes, I do" },
                  { val: false, label: "No, I don't" },
                ].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    onClick={() => setHasMeds(val)}
                    className={`py-3 rounded-[14px] text-[13px] font-bold transition-all border ${
                      hasMeds === val
                        ? "bg-[#1A365D] text-white border-[#1A365D] shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {hasMeds && (
                <div className="space-y-3">
                  {/* Existing medication chips */}
                  {meds.length > 0 && (
                    <div className="space-y-2">
                      {meds.map((med) => (
                        <div key={med._id} className="bg-white rounded-[16px] border border-slate-200 shadow-sm px-4 py-3 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[14px] font-bold text-slate-800">{med.name}</p>
                              <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {med.dosage}
                              </span>
                            </div>
                            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                              {FREQUENCY_LABELS[med.frequency]}
                              {med.notes && ` · ${med.notes}`}
                            </p>
                          </div>
                          <button
                            onClick={() => removeMed(med._id)}
                            className="text-slate-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add medication form */}
                  {addingMed ? (
                    <div className="bg-violet-50 border border-violet-200 rounded-[18px] p-4 space-y-3">
                      <p className="text-[12px] font-bold text-violet-700 uppercase tracking-wider">Add medication</p>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Metformin"
                            value={newMed.name}
                            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                            className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Dosage *</label>
                          <input
                            type="text"
                            placeholder="e.g. 500mg"
                            value={newMed.dosage}
                            onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                            className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Frequency *</label>
                        <div className="flex flex-wrap gap-1.5">
                          {FREQUENCIES.map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setNewMed({ ...newMed, frequency: f })}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                newMed.frequency === f
                                  ? "bg-[#1A365D] text-white"
                                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {FREQUENCY_LABELS[f]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Notes (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. After meals, at bedtime"
                          value={newMed.notes || ""}
                          onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
                          className="w-full text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => { setAddingMed(false); setNewMed({ name: "", dosage: "", frequency: "once_daily", notes: "" }); }}
                          className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-[13px] font-bold rounded-[12px] hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addMed}
                          disabled={!newMed.name.trim() || !newMed.dosage.trim()}
                          className="flex-1 py-2.5 bg-[#1A365D] text-white text-[13px] font-bold rounded-[12px] hover:bg-[#12243e] disabled:opacity-50 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingMed(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-[16px] text-slate-400 hover:text-slate-600 text-[13px] font-semibold transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add {meds.length > 0 ? "another" : "a"} medication
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={handleSaveMedications}
                disabled={isPending || hasMeds === null || (hasMeds && meds.length === 0 && !addingMed)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A365D] hover:bg-[#12243e] disabled:opacity-50 text-white font-bold text-[14px] rounded-[16px] shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>Save & continue <ChevronRight className="w-4 h-4" /></>}
              </button>
              <button onClick={() => setStep("ready")} className="w-full text-center text-[12px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors">
                Skip this step
              </button>
            </div>
          )}

          {/* ── STEP 5: Ready ────────────────────────────────────────────────── */}
          {step === "ready" && (
            <div className="p-6 pt-4 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-[16px] flex items-center justify-center shadow-sm shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">All set</p>
                  <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">
                    You&apos;re ready!
                  </h2>
                </div>
              </div>

              <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
                Upload your first lab report — any PDF or photo works. HealthLedger will extract every biomarker automatically.
              </p>

              {/* Summary chips */}
              <div className="bg-white rounded-[20px] border border-slate-100 p-4 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your setup</p>
                {(gender || dateOfBirth) && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    <p className="text-[13px] font-semibold text-slate-700">
                      Profile saved{gender ? ` · ${gender}` : ""}
                    </p>
                  </div>
                )}
                {selectedTrackers.size > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    <p className="text-[13px] font-semibold text-slate-700">
                      {selectedTrackers.size} health tracker{selectedTrackers.size > 1 ? "s" : ""} active
                    </p>
                  </div>
                )}
                {meds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    <p className="text-[13px] font-semibold text-slate-700">
                      {meds.length} medication{meds.length > 1 ? "s" : ""} logged
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <p className="text-[13px] font-semibold text-slate-500">Upload a lab report to get started</p>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-[14px] rounded-[16px] shadow-lg shadow-teal-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Upload my first report <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={dismiss} className="w-full text-center text-[12px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors">
                I&apos;ll explore first
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
