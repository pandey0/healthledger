"use client";

import { useState, useTransition } from "react";
import {
  Activity, Pill, Plus, Trash2, ChevronDown, ChevronUp,
  Pencil, Check, X, History, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  logReading, deleteReading,
  addMedication, updateMedication, deactivateMedication,
  type MedFrequency, FREQUENCY_LABELS, ALL_FREQUENCIES,
  type MedicationPayload,
} from "@/lib/actions/health";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Reading = {
  id: string;
  value: string;
  recordedAt: Date | string;
  notes: string | null;
  trackerId: string;
};

type TrackerWithReadings = {
  id: string;
  paramType: string;
  unit: string;
  isActive: boolean;
  readings: Reading[];
};

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
  startDate: Date | string | null;
  createdAt: Date | string;
};

type Props = {
  trackerSettings: TrackerSetting[];
  activeTrackers: TrackerWithReadings[];
  medications: Medication[];
};

type Tab = "trackers" | "medications";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: Date | string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function todayISO() {
  return new Date().toISOString().slice(0, 16);
}

// ─── Root Component ────────────────────────────────────────────────────────────

export default function TrackersClient({ trackerSettings, activeTrackers, medications: initMeds }: Props) {
  const [tab, setTab] = useState<Tab>("trackers");
  const [meds, setMeds] = useState<Medication[]>(initMeds);
  const [trackers, setTrackers] = useState<TrackerWithReadings[]>(activeTrackers);

  const refreshTrackers = async () => {
    const res = await fetch("/api/trackers");
    if (res.ok) {
      // Re-fetch readings for each active tracker
      const settings: TrackerSetting[] = await res.json();
      const active = settings.filter((s) => s.isActive && s.id);
      const withReadings = await Promise.all(
        active.map(async (s) => {
          const r = await fetch(`/api/readings/${s.id}`);
          const readings: Reading[] = r.ok ? await r.json() : [];
          return { id: s.id!, paramType: s.paramType, unit: s.unit, isActive: true, readings };
        }),
      );
      setTrackers(withReadings);
    }
  };

  const refreshMeds = async () => {
    const res = await fetch("/api/medications");
    if (res.ok) setMeds(await res.json());
  };

  const noActiveTrackers = trackers.length === 0;

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <Link href="/home" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-[32px] font-extrabold text-slate-800 tracking-tight">Health Hub</h1>
        <p className="text-[14px] text-slate-500 font-medium mt-1">Track your daily measurements and medications.</p>
      </header>

      {/* Tab bar */}
      <div className="px-6 mb-5">
        <div className="flex bg-slate-100 rounded-[16px] p-1 gap-1">
          {([
            { id: "trackers",    label: "My Trackers", icon: Activity },
            { id: "medications", label: "Medications",  icon: Pill },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-[13px] font-bold transition-all ${
                tab === id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Trackers Tab ──────────────────────────────────────────────────────── */}
      {tab === "trackers" && (
        <div className="px-6 space-y-3">
          {noActiveTrackers ? (
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-8 text-center">
              <p className="text-[32px] mb-3">📏</p>
              <p className="text-[15px] font-bold text-slate-700 mb-1">No trackers enabled yet</p>
              <p className="text-[13px] text-slate-400 font-medium mb-4">
                Enable trackers from Settings to start logging your daily measurements.
              </p>
              <Link href="/settings" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1A365D] text-white text-[13px] font-bold rounded-[12px] hover:bg-[#12243e] transition-colors">
                Go to Settings
              </Link>
            </div>
          ) : (
            trackers.map((tracker) => {
              const meta = trackerSettings.find((s) => s.paramType === tracker.paramType);
              return (
                <TrackerCard
                  key={tracker.id}
                  tracker={tracker}
                  label={meta?.label ?? tracker.paramType}
                  emoji={meta?.emoji ?? "📊"}
                  placeholder={meta?.placeholder ?? "Enter value"}
                  onReadingLogged={refreshTrackers}
                />
              );
            })
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-[16px] p-4 text-center">
            <p className="text-[12px] text-slate-500 font-medium">
              Manage which trackers are active in{" "}
              <Link href="/settings" className="font-bold text-[#1A365D] hover:underline">Settings</Link>.
            </p>
          </div>
        </div>
      )}

      {/* ── Medications Tab ──────────────────────────────────────────────────── */}
      {tab === "medications" && (
        <MedicationsPanel meds={meds} onChanged={refreshMeds} />
      )}
    </div>
  );
}

// ─── Tracker Card ─────────────────────────────────────────────────────────────

function TrackerCard({
  tracker, label, emoji, placeholder, onReadingLogged,
}: {
  tracker: TrackerWithReadings;
  label: string;
  emoji: string;
  placeholder: string;
  onReadingLogged: () => void;
}) {
  const [showHistory, setShowHistory]   = useState(false);
  const [showLog, setShowLog]           = useState(false);
  const [value, setValue]               = useState("");
  const [recordedAt, setRecordedAt]     = useState(todayISO());
  const [notes, setNotes]               = useState("");
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [isPending, startTransition]    = useTransition();

  const lastReading = tracker.readings[0];

  const submitReading = () => {
    if (!value.trim()) return;
    startTransition(async () => {
      const res = await logReading(tracker.id, value, recordedAt, notes);
      if (res.success) {
        toast.success("Reading logged");
        setValue(""); setNotes(""); setRecordedAt(todayISO());
        setShowLog(false);
        onReadingLogged();
      } else {
        toast.error(res.error ?? "Failed to log reading");
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteReading(id);
      if (res.success) {
        toast.success("Reading deleted");
        onReadingLogged();
      } else {
        toast.error(res.error ?? "Failed to delete");
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[26px] leading-none">{emoji}</span>
            <div>
              <p className="text-[15px] font-bold text-slate-800 leading-tight">{label}</p>
              <p className="text-[12px] text-slate-400 font-medium">{tracker.unit}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            {lastReading ? (
              <>
                <p className="text-[18px] font-extrabold text-slate-900 leading-tight">{lastReading.value}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{fmtDate(lastReading.recordedAt)}</p>
              </>
            ) : (
              <p className="text-[12px] text-slate-400 font-semibold italic">No readings</p>
            )}
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => { setShowLog((v) => !v); setShowHistory(false); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0F1F3D] hover:bg-[#1A365D] text-white text-[12px] font-bold rounded-[10px] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Log reading
          </button>
          {tracker.readings.length > 0 && (
            <button
              onClick={() => { setShowHistory((v) => !v); setShowLog(false); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-bold rounded-[10px] transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              History ({tracker.readings.length})
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Log form */}
      {showLog && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Log a reading</p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Value ({tracker.unit}) *</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full text-[14px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Date & Time</label>
              <input
                type="datetime-local"
                value={recordedAt}
                max={todayISO()}
                onChange={(e) => setRecordedAt(e.target.value)}
                className="w-full text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. After breakfast, resting"
              className="w-full text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowLog(false)}
              className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-[13px] font-bold rounded-[12px] hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitReading}
              disabled={isPending || !value.trim()}
              className="flex-1 py-2.5 bg-[#1A365D] text-white text-[13px] font-bold rounded-[12px] hover:bg-[#12243e] disabled:opacity-50 transition-colors"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* History list */}
      {showHistory && tracker.readings.length > 0 && (
        <div className="border-t border-slate-100">
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
            {tracker.readings.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[16px] font-extrabold text-slate-800">{r.value}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">{tracker.unit}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {fmtDate(r.recordedAt)} · {fmtTime(r.recordedAt)}
                    {r.notes && <span className="ml-1 italic"> · {r.notes}</span>}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                  className="text-slate-300 hover:text-red-500 transition-colors ml-3 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Medications Panel ────────────────────────────────────────────────────────

function MedicationsPanel({ meds, onChanged }: { meds: Medication[]; onChanged: () => void }) {
  const [showAdd, setShowAdd]         = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [newMed, setNewMed]           = useState<MedicationPayload>({ name: "", dosage: "", frequency: "once_daily" });
  const [editForm, setEditForm]       = useState<MedicationPayload>({ name: "", dosage: "", frequency: "once_daily" });
  const [isPending, startTransition]  = useTransition();

  const activeMeds   = meds.filter((m) => m.isActive);
  const inactiveMeds = meds.filter((m) => !m.isActive);

  const handleAdd = () => {
    if (!newMed.name.trim() || !newMed.dosage.trim()) return;
    startTransition(async () => {
      const res = await addMedication(newMed);
      if (res.success) {
        toast.success("Medication added");
        setNewMed({ name: "", dosage: "", frequency: "once_daily" });
        setShowAdd(false);
        onChanged();
      } else {
        toast.error(res.error ?? "Failed to add");
      }
    });
  };

  const handleEdit = (med: Medication) => {
    setEditId(med.id);
    setEditForm({ name: med.name, dosage: med.dosage, frequency: med.frequency as MedFrequency, notes: med.notes ?? "" });
  };

  const handleSaveEdit = () => {
    if (!editId) return;
    startTransition(async () => {
      const res = await updateMedication(editId, editForm);
      if (res.success) {
        toast.success("Medication updated");
        setEditId(null);
        onChanged();
      } else {
        toast.error(res.error ?? "Failed to update");
      }
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      const res = await deactivateMedication(id);
      if (res.success) {
        toast.success("Medication removed");
        onChanged();
      } else {
        toast.error(res.error ?? "Failed to remove");
      }
    });
  };

  return (
    <div className="px-6 space-y-3">
      {/* Active medications */}
      {activeMeds.length === 0 && !showAdd && (
        <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-8 text-center">
          <p className="text-[32px] mb-3">💊</p>
          <p className="text-[15px] font-bold text-slate-700 mb-1">No active medications</p>
          <p className="text-[13px] text-slate-400 font-medium mb-4">Add your current prescriptions or supplements.</p>
        </div>
      )}

      {activeMeds.map((med) => (
        <MedCard
          key={med.id}
          med={med}
          isEditing={editId === med.id}
          editForm={editForm}
          onEdit={() => handleEdit(med)}
          onCancelEdit={() => setEditId(null)}
          onSaveEdit={handleSaveEdit}
          onEditFormChange={setEditForm}
          onRemove={() => handleRemove(med.id)}
          isPending={isPending}
        />
      ))}

      {/* Add new medication form */}
      {showAdd ? (
        <div className="bg-violet-50 border border-violet-200 rounded-[20px] p-4 space-y-3">
          <p className="text-[12px] font-bold text-violet-700 uppercase tracking-wider">New medication</p>
          <MedForm form={newMed} onChange={setNewMed} />
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-[13px] font-bold rounded-[12px] hover:bg-slate-100 transition-colors">Cancel</button>
            <button onClick={handleAdd} disabled={isPending || !newMed.name.trim() || !newMed.dosage.trim()} className="flex-1 py-2.5 bg-[#1A365D] text-white text-[13px] font-bold rounded-[12px] hover:bg-[#12243e] disabled:opacity-50 transition-colors">
              {isPending ? "Adding…" : "Add"}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-[18px] text-slate-400 hover:text-slate-600 text-[13px] font-semibold transition-all">
          <Plus className="w-4 h-4" /> Add medication
        </button>
      )}

      {/* Past / deactivated medications */}
      {inactiveMeds.length > 0 && (
        <div className="mt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">Past medications</p>
          <div className="space-y-2">
            {inactiveMeds.map((med) => (
              <div key={med.id} className="bg-white rounded-[16px] border border-slate-100 px-4 py-3 flex items-center justify-between gap-3 opacity-60">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-slate-600">{med.name}</p>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{med.dosage}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{FREQUENCY_LABELS[med.frequency as MedFrequency] ?? med.frequency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Medication Card ──────────────────────────────────────────────────────────

function MedCard({
  med, isEditing, editForm, onEdit, onCancelEdit, onSaveEdit,
  onEditFormChange, onRemove, isPending,
}: {
  med: Medication;
  isEditing: boolean;
  editForm: MedicationPayload;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditFormChange: (f: MedicationPayload) => void;
  onRemove: () => void;
  isPending: boolean;
}) {
  if (isEditing) {
    return (
      <div className="bg-violet-50 border border-violet-200 rounded-[20px] p-4 space-y-3">
        <p className="text-[12px] font-bold text-violet-700 uppercase tracking-wider">Edit — {med.name}</p>
        <MedForm form={editForm} onChange={onEditFormChange} />
        <div className="flex gap-2">
          <button onClick={onCancelEdit} className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-[13px] font-bold rounded-[12px] hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={onSaveEdit} disabled={isPending} className="flex-1 py-2.5 bg-[#1A365D] text-white text-[13px] font-bold rounded-[12px] hover:bg-[#12243e] disabled:opacity-50 transition-colors">
            {isPending ? "Saving…" : <><Check className="w-4 h-4 inline mr-1" />Save</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm px-4 py-3.5 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[15px] font-bold text-slate-800">{med.name}</p>
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{med.dosage}</span>
        </div>
        <p className="text-[12px] text-slate-500 font-medium mt-0.5">
          {FREQUENCY_LABELS[med.frequency as MedFrequency] ?? med.frequency}
          {med.notes && <span className="ml-1 text-slate-400"> · {med.notes}</span>}
        </p>
        {med.startDate && (
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Since {fmtDate(med.startDate)}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onEdit} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={onRemove} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Shared Medication Form ───────────────────────────────────────────────────

function MedForm({
  form, onChange,
}: {
  form: MedicationPayload;
  onChange: (f: MedicationPayload) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="e.g. Metformin"
            className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Dosage *</label>
          <input
            type="text"
            value={form.dosage}
            onChange={(e) => onChange({ ...form, dosage: e.target.value })}
            placeholder="e.g. 500mg"
            className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Frequency *</label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_FREQUENCIES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onChange({ ...form, frequency: f })}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                form.frequency === f
                  ? "bg-[#1A365D] text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {FREQUENCY_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Notes (optional)</label>
          <input
            type="text"
            value={form.notes ?? ""}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            placeholder="e.g. After meals"
            className="w-full text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Start Date (optional)</label>
          <input
            type="date"
            value={form.startDate ?? ""}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange({ ...form, startDate: e.target.value })}
            className="w-full text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />
        </div>
      </div>
    </div>
  );
}
