"use client";

import { useState, useTransition, useEffect } from "react";
import {
  ArrowLeft, User, Calendar, Save, Activity, Pill,
  Plus, Trash2, Pencil, Check, X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/user";
import {
  toggleTracker, addMedication, updateMedication, deactivateMedication,
} from "@/lib/actions/health";
import {
  type TrackerParamType,
  type MedFrequency, FREQUENCY_LABELS, ALL_FREQUENCIES,
  type MedicationPayload,
} from "@/lib/health-constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileData = { name: string; gender: string; dateOfBirth: string };

type TrackerSetting = {
  id: string | null;
  paramType: string;
  isActive: boolean;
  readingCount: number;
  label: string;
  unit: string;
  emoji: string;
  desc: string;
  placeholder: string;
};

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string | null;
  isActive: boolean;
  startDate: string | null;
};

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();

  // Profile state
  const [form, setForm] = useState<ProfileData>({ name: "", gender: "", dateOfBirth: "" });

  // Tracker state
  const [trackers, setTrackers] = useState<TrackerSetting[]>([]);
  const [togglingType, setTogglingType] = useState<string | null>(null);

  // Medication state
  const [meds, setMeds] = useState<Medication[]>([]);
  const [showAddMed, setShowAddMed] = useState(false);
  const [editMedId, setEditMedId] = useState<string | null>(null);
  const [newMed, setNewMed] = useState<MedicationPayload>({ name: "", dosage: "", frequency: "once_daily" });
  const [editMed, setEditMed] = useState<MedicationPayload>({ name: "", dosage: "", frequency: "once_daily" });

  // ── Fetch on mount ─────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            name: data.name ?? "",
            gender: data.gender ?? "",
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          });
        }
      })
      .catch(() => {});

    fetch("/api/trackers")
      .then((r) => r.json())
      .then(setTrackers)
      .catch(() => {});

    fetch("/api/medications")
      .then((r) => r.json())
      .then(setMeds)
      .catch(() => {});
  }, []);

  const refreshMeds = () =>
    fetch("/api/medications").then((r) => r.json()).then(setMeds).catch(() => {});

  const refreshTrackers = () =>
    fetch("/api/trackers").then((r) => r.json()).then(setTrackers).catch(() => {});

  // ── Profile save ───────────────────────────────────────────────────────────

  const handleSaveProfile = () => {
    startTransition(async () => {
      const result = await updateUserProfile({
        name: form.name || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      });
      if (result.success) toast.success("Profile saved");
      else toast.error(result.error ?? "Failed to save profile");
    });
  };

  // ── Tracker toggle ─────────────────────────────────────────────────────────

  const handleToggleTracker = (paramType: string, currentActive: boolean) => {
    setTogglingType(paramType);
    // Optimistic update
    setTrackers((prev) =>
      prev.map((t) => (t.paramType === paramType ? { ...t, isActive: !currentActive } : t)),
    );
    startTransition(async () => {
      const res = await toggleTracker(paramType as TrackerParamType, !currentActive);
      if (!res.success) {
        toast.error(res.error ?? "Failed to update tracker");
        refreshTrackers();
      } else {
        toast.success(!currentActive ? "Tracker enabled" : "Tracker disabled");
      }
      setTogglingType(null);
    });
  };

  // ── Medication handlers ────────────────────────────────────────────────────

  const handleAddMed = () => {
    if (!newMed.name.trim() || !newMed.dosage.trim()) return;
    startTransition(async () => {
      const res = await addMedication(newMed);
      if (res.success) {
        toast.success("Medication added");
        setNewMed({ name: "", dosage: "", frequency: "once_daily" });
        setShowAddMed(false);
        refreshMeds();
      } else {
        toast.error(res.error ?? "Failed to add");
      }
    });
  };

  const handleEditMed = (med: Medication) => {
    setEditMedId(med.id);
    setEditMed({ name: med.name, dosage: med.dosage, frequency: med.frequency as MedFrequency, notes: med.notes ?? "" });
  };

  const handleSaveEditMed = () => {
    if (!editMedId) return;
    startTransition(async () => {
      const res = await updateMedication(editMedId, editMed);
      if (res.success) {
        toast.success("Medication updated");
        setEditMedId(null);
        refreshMeds();
      } else {
        toast.error(res.error ?? "Failed to update");
      }
    });
  };

  const handleRemoveMed = (id: string) => {
    startTransition(async () => {
      const res = await deactivateMedication(id);
      if (res.success) {
        toast.success("Medication removed");
        refreshMeds();
      } else {
        toast.error(res.error ?? "Failed to remove");
      }
    });
  };

  const activeMeds = meds.filter((m) => m.isActive);

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-700 pb-20">

      <header className="px-6 pt-10 pb-6">
        <Link href="/home" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-[32px] font-extrabold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-[14px] text-slate-500 font-medium mt-1">Manage your profile, trackers, and medications.</p>
      </header>

      <main className="px-6 space-y-4">

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <SectionHeader icon={User} title="Profile" subtitle="Used for accurate reference ranges" />

        <div className="bg-blue-50 border border-blue-100 rounded-[20px] p-4">
          <p className="text-[13px] font-bold text-blue-800 mb-1">Why does this matter?</p>
          <p className="text-[12px] text-blue-700 font-medium leading-relaxed">
            Reference ranges for markers like Hemoglobin, Creatinine, and HDL differ by sex by up to 30%. Age also affects TSH and ESR ranges.
          </p>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Personal Info</p>
          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full pl-9 pr-4 py-3 text-[14px] font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="w-full pl-9 pr-4 py-3 text-[14px] font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
            {form.dateOfBirth && (
              <p className="text-[11px] text-slate-400 font-medium mt-1 ml-1">
                Age: {(() => {
                  const d = new Date(form.dateOfBirth);
                  const today = new Date();
                  let age = today.getFullYear() - d.getFullYear();
                  if (today.getMonth() - d.getMonth() < 0 || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
                  return age;
                })()} years old
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5">
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4">Biological Sex</p>
          <p className="text-[12px] text-slate-500 font-medium mb-3 -mt-2">Used for accurate reference ranges. Medical data only.</p>
          <div className="grid grid-cols-3 gap-2">
            {["male", "female", "other"].map((g) => (
              <button
                key={g}
                onClick={() => setForm({ ...form, gender: g })}
                className={`py-3 rounded-[14px] text-[13px] font-bold capitalize transition-all border ${
                  form.gender === g
                    ? "bg-[#1A365D] text-white border-[#1A365D] shadow-md"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {(form.gender === "male" || form.gender === "female") && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-[20px] p-4">
            <p className="text-[13px] font-bold text-emerald-800 mb-2">Personalised ranges enabled for:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {["Hemoglobin", "Hematocrit", "RBC", "Ferritin", "HDL Cholesterol", "Creatinine", "Uric Acid",
                form.gender === "male" ? "Testosterone" : "Estradiol", "ALT (SGPT)", "Iron"].map((m) => (
                <div key={m} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[12px] font-semibold text-emerald-700">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSaveProfile}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] font-bold text-[15px] transition-all shadow-md bg-[#1A365D] hover:bg-[#12243e] text-white hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Saving..." : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>

        {/* ── Health Trackers ───────────────────────────────────────────────── */}
        <div className="pt-2">
          <SectionHeader icon={Activity} title="Health Trackers" subtitle="Toggle which measurements you log daily" />
        </div>

        <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
          {trackers.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[13px] text-slate-400 font-medium">Loading trackers…</p>
            </div>
          ) : (
            trackers.map((t) => (
              <div key={t.paramType} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-[20px] leading-none">{t.emoji}</span>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{t.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {t.unit}
                      {t.readingCount > 0 && ` · ${t.readingCount} reading${t.readingCount !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleTracker(t.paramType, t.isActive)}
                  disabled={togglingType === t.paramType}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 shrink-0 ${
                    t.isActive ? "bg-teal-500" : "bg-slate-200"
                  } ${togglingType === t.paramType ? "opacity-60" : ""}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      t.isActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-3 text-center">
          <p className="text-[12px] text-slate-500 font-medium">
            View your reading history on the{" "}
            <Link href="/trackers" className="font-bold text-[#1A365D] hover:underline">Health Hub</Link>.
          </p>
        </div>

        {/* ── Medications ──────────────────────────────────────────────────── */}
        <div className="pt-2">
          <SectionHeader icon={Pill} title="Medications" subtitle="Your current prescriptions and supplements" />
        </div>

        <div className="space-y-2.5">
          {activeMeds.length === 0 && !showAddMed && (
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 text-center">
              <p className="text-[13px] text-slate-400 font-medium">No active medications. Add one below.</p>
            </div>
          )}

          {activeMeds.map((med) => (
            editMedId === med.id ? (
              <div key={med.id} className="bg-violet-50 border border-violet-200 rounded-[20px] p-4 space-y-3">
                <p className="text-[12px] font-bold text-violet-700 uppercase tracking-wider">Edit — {med.name}</p>
                <SettingsMedForm form={editMed} onChange={setEditMed} />
                <div className="flex gap-2">
                  <button onClick={() => setEditMedId(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-[13px] font-bold rounded-[12px] hover:bg-slate-100 transition-colors">Cancel</button>
                  <button onClick={handleSaveEditMed} disabled={isPending} className="flex-1 py-2.5 bg-[#1A365D] text-white text-[13px] font-bold rounded-[12px] disabled:opacity-50 transition-colors">
                    {isPending ? "Saving…" : <><Check className="w-3.5 h-3.5 inline mr-1" />Save</>}
                  </button>
                </div>
              </div>
            ) : (
              <div key={med.id} className="bg-white rounded-[20px] border border-slate-100 shadow-sm px-4 py-3.5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-bold text-slate-800">{med.name}</p>
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{med.dosage}</span>
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                    {FREQUENCY_LABELS[med.frequency as MedFrequency] ?? med.frequency}
                    {med.notes && <span className="ml-1 text-slate-400"> · {med.notes}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleEditMed(med)} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleRemoveMed(med.id)} disabled={isPending} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ))}

          {showAddMed ? (
            <div className="bg-violet-50 border border-violet-200 rounded-[20px] p-4 space-y-3">
              <p className="text-[12px] font-bold text-violet-700 uppercase tracking-wider">New medication</p>
              <SettingsMedForm form={newMed} onChange={setNewMed} />
              <div className="flex gap-2">
                <button onClick={() => setShowAddMed(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-[13px] font-bold rounded-[12px] hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={handleAddMed} disabled={isPending || !newMed.name.trim() || !newMed.dosage.trim()} className="flex-1 py-2.5 bg-[#1A365D] text-white text-[13px] font-bold rounded-[12px] disabled:opacity-50 transition-colors">
                  {isPending ? "Adding…" : "Add"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddMed(true)} className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-[18px] text-slate-400 hover:text-slate-600 text-[13px] font-semibold transition-all">
              <Plus className="w-4 h-4" /> Add medication
            </button>
          )}
        </div>

      </main>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="w-9 h-9 rounded-[12px] bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-slate-600" style={{ width: 18, height: 18 }} />
      </div>
      <div>
        <p className="text-[16px] font-extrabold text-slate-800">{title}</p>
        <p className="text-[12px] text-slate-500 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Medication form (settings variant) ───────────────────────────────────────

function SettingsMedForm({ form, onChange }: { form: MedicationPayload; onChange: (f: MedicationPayload) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Name *</label>
          <input type="text" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} placeholder="e.g. Metformin"
            className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Dosage *</label>
          <input type="text" value={form.dosage} onChange={(e) => onChange({ ...form, dosage: e.target.value })} placeholder="e.g. 500mg"
            className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30" />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Frequency *</label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_FREQUENCIES.map((f) => (
            <button key={f} type="button" onClick={() => onChange({ ...form, frequency: f })}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                form.frequency === f ? "bg-[#1A365D] text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}>
              {FREQUENCY_LABELS[f]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Notes (optional)</label>
        <input type="text" value={form.notes ?? ""} onChange={(e) => onChange({ ...form, notes: e.target.value })} placeholder="e.g. After meals, at bedtime"
          className="w-full text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30" />
      </div>
    </div>
  );
}
