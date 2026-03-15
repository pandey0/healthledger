export const REPORT_TYPE_COLORS: Record<string, string> = {
  "CBC":              "bg-blue-100 text-blue-700",
  "Complete Blood Count": "bg-blue-100 text-blue-700",
  "Lipid Panel":      "bg-purple-100 text-purple-700",
  "Cholesterol Panel":"bg-purple-100 text-purple-700",
  "Thyroid Panel":    "bg-teal-100 text-teal-700",
  "Thyroid Function": "bg-teal-100 text-teal-700",
  "Diabetes Panel":   "bg-orange-100 text-orange-700",
  "HbA1c":            "bg-orange-100 text-orange-700",
  "Liver Function":   "bg-amber-100 text-amber-700",
  "LFT":              "bg-amber-100 text-amber-700",
  "Kidney Function":  "bg-cyan-100 text-cyan-700",
  "KFT":              "bg-cyan-100 text-cyan-700",
  "Renal Function":   "bg-cyan-100 text-cyan-700",
  "Vitamin Panel":    "bg-green-100 text-green-700",
  "Iron Studies":     "bg-red-100 text-red-700",
  "Hormone Panel":    "bg-pink-100 text-pink-700",
  "Metabolic Panel":  "bg-indigo-100 text-indigo-700",
  "Electrolytes":     "bg-sky-100 text-sky-700",
};

export function getReportTypeColor(reportType: string | null | undefined): string {
  if (!reportType) return "bg-slate-100 text-slate-600";
  return REPORT_TYPE_COLORS[reportType] ?? "bg-slate-100 text-slate-600";
}

export const REPORT_TYPES = Object.keys(REPORT_TYPE_COLORS);
