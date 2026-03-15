"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pill, CheckCircle2, Plus, Settings2, Loader2, ChevronRight } from "lucide-react";
import { markMedicationTaken } from "@/lib/actions/health";
import { FREQUENCY_LABELS, type MedFrequency } from "@/lib/health-constants";
import { format } from "date-fns";

type Med = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string | null;
};

type Log = {
  id: string;
  medicationId: string;
  takenAt: string;
};

const EXPECTED_DOSES: Record<string, number> = {
  once_daily:      1,
  twice_daily:     2,
  thrice_daily:    3,
  four_times_daily: 4,
  as_needed:       999,
  weekly:          1,
};

export default function MedicationsWidget({
  activeMeds,
  todayLogs,
}: {
  activeMeds: Med[];
  todayLogs: Log[];
}) {
  const [logs, setLogs] = useState<Log[]>(todayLogs);
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (activeMeds.length === 0) {
    return (
      <Link href="/trackers" className="block group">
        <div className="bg-white rounded-[22px] border border-dashed border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-[13px] bg-violet-50 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-slate-700">Add your medications</p>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
              Log your prescriptions and we&apos;ll remind you daily.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </Link>
    );
  }

  const handleMark = (medId: string) => {
    setLoadingId(medId);
    startTransition(async () => {
      const result = await markMedicationTaken(medId);
      if (result.success) {
        setLogs((prev) => [
          ...prev,
          { id: `opt-${Date.now()}`, medicationId: medId, takenAt: new Date().toISOString() },
        ]);
      }
      setLoadingId(null);
    });
  };

  return (
    <div className="bg-white rounded-[22px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-50">
        {activeMeds.map((med) => {
          const todayCount  = logs.filter((l) => l.medicationId === med.id).length;
          const expected    = EXPECTED_DOSES[med.frequency] ?? 1;
          const allTaken    = expected !== 999 && todayCount >= expected;
          const isAsNeeded  = med.frequency === "as_needed";
          const isLoading   = loadingId === med.id && pending;

          const lastTaken = logs
            .filter((l) => l.medicationId === med.id)
            .at(-1);

          return (
            <div key={med.id} className="px-4 py-4 flex items-start gap-3">

              {/* Icon */}
              <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 mt-0.5 ${
                allTaken ? "bg-emerald-50" : "bg-violet-50"
              }`}>
                {allTaken
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <Pill className="w-4 h-4 text-violet-500" />
                }
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-bold text-slate-800 truncate">{med.name}</p>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                    {med.dosage}
                  </span>
                  {!isAsNeeded && expected !== 999 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      allTaken
                        ? "bg-emerald-100 text-emerald-700"
                        : todayCount > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {todayCount}/{expected} doses
                    </span>
                  )}
                  {isAsNeeded && todayCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                      ×{todayCount} today
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {FREQUENCY_LABELS[med.frequency as MedFrequency] ?? med.frequency}
                  {med.notes && <span className="ml-1">· {med.notes}</span>}
                </p>

                {/* Last taken time */}
                {lastTaken && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    Last taken at {format(new Date(lastTaken.takenAt), "h:mm a")}
                  </p>
                )}

                {/* Proactive reminder or confirm button */}
                {!allTaken && (
                  <button
                    onClick={() => handleMark(med.id)}
                    disabled={isLoading}
                    className={`mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-bold transition-all active:scale-95 ${
                      todayCount === 0
                        ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200"
                        : "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100"
                    }`}
                  >
                    {isLoading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <CheckCircle2 className="w-3.5 h-3.5" />
                    }
                    {todayCount === 0
                      ? (isAsNeeded ? "Mark as taken" : "I've taken this")
                      : "Mark another dose"
                    }
                  </button>
                )}

                {allTaken && (
                  <p className="mt-1.5 text-[12px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All done for today
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/trackers"
        className="flex items-center justify-between px-4 py-3 border-t border-slate-50 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[12px] font-bold text-slate-400">Add / edit medications</span>
        </div>
        <Settings2 className="w-3.5 h-3.5 text-slate-300" />
      </Link>
    </div>
  );
}
