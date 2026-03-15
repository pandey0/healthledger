// Shared health constants — no "use server" directive.
// Import from here in both server actions and UI components.

// ─── Tracker catalogue ────────────────────────────────────────────────────────

export type TrackerParamType =
  | "blood_pressure"
  | "blood_sugar"
  | "weight"
  | "heart_rate"
  | "spo2"
  | "temperature"
  | "hba1c";

export const ALL_PARAM_TYPES: TrackerParamType[] = [
  "blood_pressure",
  "blood_sugar",
  "weight",
  "heart_rate",
  "spo2",
  "temperature",
  "hba1c",
];

export const TRACKER_META: Record<
  TrackerParamType,
  { label: string; unit: string; emoji: string; desc: string; placeholder: string }
> = {
  blood_pressure: { label: "Blood Pressure",  unit: "mmHg",  emoji: "🫀", desc: "Systolic / Diastolic",      placeholder: "e.g. 120/80" },
  blood_sugar:    { label: "Blood Sugar",      unit: "mg/dL", emoji: "🩸", desc: "Fasting or random glucose", placeholder: "e.g. 95"     },
  weight:         { label: "Body Weight",      unit: "kg",    emoji: "⚖️",  desc: "Daily or weekly weigh-in", placeholder: "e.g. 72.5"   },
  heart_rate:     { label: "Heart Rate",       unit: "bpm",   emoji: "💓", desc: "Resting pulse",             placeholder: "e.g. 72"     },
  spo2:           { label: "Oxygen (SpO₂)",    unit: "%",     emoji: "🫁", desc: "Blood oxygen saturation",   placeholder: "e.g. 98"     },
  temperature:    { label: "Temperature",      unit: "°C",    emoji: "🌡️", desc: "Body temperature",          placeholder: "e.g. 37.2"   },
  hba1c:          { label: "HbA1c",            unit: "%",     emoji: "📊", desc: "Glycated haemoglobin",      placeholder: "e.g. 5.7"    },
};

// ─── Medication catalogue ─────────────────────────────────────────────────────

export type MedFrequency =
  | "once_daily"
  | "twice_daily"
  | "thrice_daily"
  | "four_times_daily"
  | "as_needed"
  | "weekly";

export const FREQUENCY_LABELS: Record<MedFrequency, string> = {
  once_daily:       "Once daily",
  twice_daily:      "Twice daily",
  thrice_daily:     "Three times daily",
  four_times_daily: "Four times daily",
  as_needed:        "As needed",
  weekly:           "Weekly",
};

export const ALL_FREQUENCIES: MedFrequency[] = [
  "once_daily",
  "twice_daily",
  "thrice_daily",
  "four_times_daily",
  "as_needed",
  "weekly",
];

export type MedicationPayload = {
  name:       string;
  dosage:     string;
  frequency:  MedFrequency;
  notes?:     string;
  startDate?: string;
};
