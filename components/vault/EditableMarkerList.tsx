"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, X, Trash2, Check, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateMarker, deleteMarker } from "@/lib/actions/vault";
import { getReferenceRange } from "@/lib/referenceRanges";

type Marker = {
  id: string;
  markerName: string;
  numericValue: number | null;
  textValue: string | null;
  unit: string | null;
  flag: string;
};

type EditState = {
  markerName: string;
  value: string;
  unit: string;
  flag: string;
};

const FLAG_OPTIONS = ["normal", "high", "low"] as const;

function stripeColor(flag: string) {
  if (flag === "high") return "bg-amber-400";
  if (flag === "low") return "bg-red-400";
  return "bg-emerald-400/70";
}

function badgeStyles(flag: string) {
  if (flag === "high") return "bg-amber-50 text-amber-700 border-amber-200/60";
  if (flag === "low") return "bg-red-50 text-red-700 border-red-200/60";
  return "";
}

export default function EditableMarkerList({ markers: initial }: { markers: Marker[] }) {
  const [markers, setMarkers] = useState<Marker[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const startEdit = (marker: Marker) => {
    setEditingId(marker.id);
    setEditState({
      markerName: marker.markerName,
      value: marker.numericValue !== null ? String(marker.numericValue) : (marker.textValue ?? ""),
      unit: marker.unit ?? "",
      flag: marker.flag,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const saveEdit = (marker: Marker) => {
    if (!editState) return;
    setSavingId(marker.id);
    startTransition(async () => {
      const result = await updateMarker({ id: marker.id, ...editState });
      if (result.success) {
        const numericVal = parseFloat(editState.value);
        const isNumeric = !isNaN(numericVal);
        setMarkers((prev) =>
          prev.map((m) =>
            m.id === marker.id
              ? {
                  ...m,
                  markerName: editState.markerName,
                  numericValue: isNumeric ? numericVal : null,
                  textValue: isNumeric ? null : editState.value,
                  unit: editState.unit,
                  flag: editState.flag.toLowerCase(),
                }
              : m
          )
        );
        toast.success("Marker updated");
        setEditingId(null);
        setEditState(null);
      } else {
        toast.error(result.error ?? "Failed to update marker");
      }
      setSavingId(null);
    });
  };

  const handleDelete = (markerId: string) => {
    setDeletingId(markerId);
    startTransition(async () => {
      const result = await deleteMarker(markerId);
      if (result.success) {
        setMarkers((prev) => prev.filter((m) => m.id !== markerId));
        toast.success("Marker removed");
      } else {
        toast.error(result.error ?? "Failed to remove marker");
      }
      setDeletingId(null);
    });
  };

  return (
    <div>
      <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
        Extracted Biomarkers
      </p>

      <div className="space-y-2.5">
        {markers.map((marker) => {
          const isEditing = editingId === marker.id;
          const isSaving = savingId === marker.id;
          const isDeleting = deletingId === marker.id;
          const ref = marker.numericValue !== null ? getReferenceRange(marker.markerName) : null;
          const flag = isEditing && editState ? editState.flag : marker.flag;

          if (isEditing && editState) {
            return (
              <div
                key={marker.id}
                className="bg-blue-50 rounded-[18px] border border-blue-200 shadow-sm overflow-hidden flex items-stretch"
              >
                <div className={`w-1 shrink-0 ${stripeColor(editState.flag)}`} />
                <div className="flex-1 p-4 space-y-3">

                  {/* Marker name */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Marker Name</label>
                    <input
                      type="text"
                      value={editState.markerName}
                      onChange={(e) => setEditState({ ...editState, markerName: e.target.value })}
                      className="w-full mt-1 text-[14px] font-bold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                    />
                  </div>

                  {/* Value + Unit row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Value</label>
                      <input
                        type="text"
                        value={editState.value}
                        onChange={(e) => setEditState({ ...editState, value: e.target.value })}
                        className="w-full mt-1 text-[14px] font-bold text-slate-800 bg-white border border-slate-200 rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Unit</label>
                      <input
                        type="text"
                        value={editState.unit}
                        onChange={(e) => setEditState({ ...editState, unit: e.target.value })}
                        className="w-full mt-1 text-[14px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                      />
                    </div>
                  </div>

                  {/* Flag toggle */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Flag</label>
                    <div className="flex gap-2 mt-1">
                      {FLAG_OPTIONS.map((f) => (
                        <button
                          key={f}
                          onClick={() => setEditState({ ...editState, flag: f })}
                          className={`flex-1 py-1.5 rounded-[10px] text-[12px] font-bold capitalize transition-colors ${
                            editState.flag === f
                              ? f === "normal"
                                ? "bg-emerald-500 text-white"
                                : f === "high"
                                ? "bg-amber-500 text-white"
                                : "bg-red-500 text-white"
                              : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => saveEdit(marker)}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1A365D] text-white text-[13px] font-bold rounded-[10px] hover:bg-[#12243e] transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {isSaving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="px-4 py-2 text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </div>
            );
          }

          return (
            <div
              key={marker.id}
              className="bg-white rounded-[18px] border border-slate-100 shadow-sm overflow-hidden flex items-stretch group"
            >
              <div className={`w-1 shrink-0 ${stripeColor(marker.flag)}`} />

              <div className="flex-1 p-4 flex items-center gap-3">

                {/* Left: link area */}
                <Link
                  href={`/vault/marker/${encodeURIComponent(marker.markerName)}`}
                  className="flex-1 min-w-0 outline-none"
                >
                  <p className="text-[14px] font-bold text-slate-800 truncate hover:text-blue-700 transition-colors">
                    {marker.markerName}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {(marker.flag === "high" || marker.flag === "low") && (
                      <span className={`inline-flex items-center px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${badgeStyles(marker.flag)}`}>
                        {marker.flag}
                      </span>
                    )}
                    {ref && (
                      <span className="text-[11px] font-medium text-slate-400">
                        Ref: {ref.min}–{ref.max === 999 ? "↑" : ref.max} {ref.unit}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Right: value + actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[18px] font-extrabold text-slate-800 tabular-nums leading-none">
                      {marker.numericValue !== null ? marker.numericValue : marker.textValue}
                    </p>
                    {marker.unit && (
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                        {marker.unit}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => startEdit(marker)}
                    className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-[8px] transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(marker.id)}
                    disabled={isDeleting}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[8px] transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    aria-label="Delete"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>

                  <TrendingUp className="w-4 h-4 text-slate-200 group-hover:text-slate-300 transition-colors" />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {markers.length === 0 && (
        <p className="text-center text-[13px] text-slate-400 font-medium py-8">No markers remaining in this report.</p>
      )}
    </div>
  );
}
