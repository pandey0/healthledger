export type ReferenceRange = {
  min: number;
  max: number;
  unit: string;
  label: string;
  note?: string;
};

const RANGES: Record<string, ReferenceRange> = {
  // ─── Glucose / Diabetes ───────────────────────────────────────
  "fasting glucose":        { min: 70,  max: 99,   unit: "mg/dL", label: "Normal fasting" },
  "glucose":                { min: 70,  max: 99,   unit: "mg/dL", label: "Normal fasting" },
  "blood glucose":          { min: 70,  max: 99,   unit: "mg/dL", label: "Normal fasting" },
  "random glucose":         { min: 70,  max: 140,  unit: "mg/dL", label: "Normal random" },
  "hba1c":                  { min: 4.0, max: 5.6,  unit: "%",     label: "Non-diabetic" },
  "glycated hemoglobin":    { min: 4.0, max: 5.6,  unit: "%",     label: "Non-diabetic" },
  "glycosylated hemoglobin":{ min: 4.0, max: 5.6,  unit: "%",     label: "Non-diabetic" },

  // ─── Lipid Panel ─────────────────────────────────────────────
  "total cholesterol":      { min: 0,   max: 200,  unit: "mg/dL", label: "Desirable" },
  "cholesterol":            { min: 0,   max: 200,  unit: "mg/dL", label: "Desirable" },
  "ldl":                    { min: 0,   max: 100,  unit: "mg/dL", label: "Optimal" },
  "ldl cholesterol":        { min: 0,   max: 100,  unit: "mg/dL", label: "Optimal" },
  "ldl-c":                  { min: 0,   max: 100,  unit: "mg/dL", label: "Optimal" },
  "hdl":                    { min: 60,  max: 999,  unit: "mg/dL", label: "Optimal (↑ better)", note: "Higher is better" },
  "hdl cholesterol":        { min: 60,  max: 999,  unit: "mg/dL", label: "Optimal", note: "Higher is better" },
  "hdl-c":                  { min: 60,  max: 999,  unit: "mg/dL", label: "Optimal", note: "Higher is better" },
  "triglycerides":          { min: 0,   max: 150,  unit: "mg/dL", label: "Normal" },
  "vldl":                   { min: 2,   max: 30,   unit: "mg/dL", label: "Normal" },

  // ─── Complete Blood Count ────────────────────────────────────
  "hemoglobin":             { min: 12,  max: 17.5, unit: "g/dL",  label: "Normal", note: "12–16 female, 13.5–17.5 male" },
  "hb":                     { min: 12,  max: 17.5, unit: "g/dL",  label: "Normal" },
  "hgb":                    { min: 12,  max: 17.5, unit: "g/dL",  label: "Normal" },
  "hematocrit":             { min: 36,  max: 50,   unit: "%",     label: "Normal" },
  "pcv":                    { min: 36,  max: 50,   unit: "%",     label: "Normal" },
  "wbc":                    { min: 4,   max: 11,   unit: "×10³/µL", label: "Normal" },
  "white blood cells":      { min: 4,   max: 11,   unit: "×10³/µL", label: "Normal" },
  "total leukocyte count":  { min: 4,   max: 11,   unit: "×10³/µL", label: "Normal" },
  "tlc":                    { min: 4,   max: 11,   unit: "×10³/µL", label: "Normal" },
  "platelets":              { min: 150, max: 400,  unit: "×10³/µL", label: "Normal" },
  "platelet count":         { min: 150, max: 400,  unit: "×10³/µL", label: "Normal" },
  "rbc":                    { min: 4.2, max: 6.1,  unit: "×10⁶/µL", label: "Normal" },
  "red blood cells":        { min: 4.2, max: 6.1,  unit: "×10⁶/µL", label: "Normal" },
  "mcv":                    { min: 80,  max: 100,  unit: "fL",    label: "Normal" },
  "mch":                    { min: 27,  max: 33,   unit: "pg",    label: "Normal" },
  "mchc":                   { min: 32,  max: 36,   unit: "g/dL",  label: "Normal" },

  // ─── Thyroid ─────────────────────────────────────────────────
  "tsh":                    { min: 0.4, max: 4.0,  unit: "mIU/L", label: "Normal" },
  "thyroid stimulating hormone": { min: 0.4, max: 4.0, unit: "mIU/L", label: "Normal" },
  "free t3":                { min: 2.3, max: 4.2,  unit: "pg/mL", label: "Normal" },
  "t3":                     { min: 80,  max: 200,  unit: "ng/dL", label: "Normal" },
  "free t4":                { min: 0.8, max: 1.8,  unit: "ng/dL", label: "Normal" },
  "t4":                     { min: 5.1, max: 14.1, unit: "µg/dL", label: "Normal" },
  "thyroxine":              { min: 5.1, max: 14.1, unit: "µg/dL", label: "Normal" },

  // ─── Vitamins ────────────────────────────────────────────────
  "vitamin d":              { min: 30,  max: 100,  unit: "ng/mL", label: "Sufficient" },
  "vitamin d3":             { min: 30,  max: 100,  unit: "ng/mL", label: "Sufficient" },
  "25-oh vitamin d":        { min: 30,  max: 100,  unit: "ng/mL", label: "Sufficient" },
  "25(oh)d":                { min: 30,  max: 100,  unit: "ng/mL", label: "Sufficient" },
  "vitamin b12":            { min: 200, max: 900,  unit: "pg/mL", label: "Normal" },
  "b12":                    { min: 200, max: 900,  unit: "pg/mL", label: "Normal" },
  "cobalamin":              { min: 200, max: 900,  unit: "pg/mL", label: "Normal" },
  "folate":                 { min: 2.7, max: 17.0, unit: "ng/mL", label: "Normal" },
  "folic acid":             { min: 2.7, max: 17.0, unit: "ng/mL", label: "Normal" },
  "iron":                   { min: 60,  max: 170,  unit: "µg/dL", label: "Normal" },
  "serum iron":             { min: 60,  max: 170,  unit: "µg/dL", label: "Normal" },
  "ferritin":               { min: 12,  max: 300,  unit: "ng/mL", label: "Normal" },

  // ─── Kidney Function ─────────────────────────────────────────
  "creatinine":             { min: 0.6, max: 1.3,  unit: "mg/dL", label: "Normal" },
  "serum creatinine":       { min: 0.6, max: 1.3,  unit: "mg/dL", label: "Normal" },
  "blood urea nitrogen":    { min: 7,   max: 20,   unit: "mg/dL", label: "Normal" },
  "bun":                    { min: 7,   max: 20,   unit: "mg/dL", label: "Normal" },
  "urea":                   { min: 15,  max: 45,   unit: "mg/dL", label: "Normal" },
  "blood urea":             { min: 15,  max: 45,   unit: "mg/dL", label: "Normal" },
  "uric acid":              { min: 3.4, max: 7.0,  unit: "mg/dL", label: "Normal" },
  "egfr":                   { min: 60,  max: 999,  unit: "mL/min", label: "Normal (↑ better)", note: "Higher is better" },

  // ─── Liver Function ──────────────────────────────────────────
  "alt":                    { min: 7,   max: 56,   unit: "U/L",   label: "Normal" },
  "sgpt":                   { min: 7,   max: 56,   unit: "U/L",   label: "Normal" },
  "ast":                    { min: 10,  max: 40,   unit: "U/L",   label: "Normal" },
  "sgot":                   { min: 10,  max: 40,   unit: "U/L",   label: "Normal" },
  "alp":                    { min: 44,  max: 147,  unit: "U/L",   label: "Normal" },
  "alkaline phosphatase":   { min: 44,  max: 147,  unit: "U/L",   label: "Normal" },
  "ggt":                    { min: 9,   max: 48,   unit: "U/L",   label: "Normal" },
  "gamma-gt":               { min: 9,   max: 48,   unit: "U/L",   label: "Normal" },
  "total bilirubin":        { min: 0.1, max: 1.2,  unit: "mg/dL", label: "Normal" },
  "direct bilirubin":       { min: 0.0, max: 0.3,  unit: "mg/dL", label: "Normal" },
  "indirect bilirubin":     { min: 0.1, max: 0.9,  unit: "mg/dL", label: "Normal" },
  "total protein":          { min: 6.3, max: 8.2,  unit: "g/dL",  label: "Normal" },
  "albumin":                { min: 3.5, max: 5.0,  unit: "g/dL",  label: "Normal" },

  // ─── Electrolytes ────────────────────────────────────────────
  "sodium":                 { min: 136, max: 145,  unit: "mEq/L", label: "Normal" },
  "potassium":              { min: 3.5, max: 5.0,  unit: "mEq/L", label: "Normal" },
  "chloride":               { min: 98,  max: 106,  unit: "mEq/L", label: "Normal" },
  "calcium":                { min: 8.5, max: 10.5, unit: "mg/dL", label: "Normal" },
  "serum calcium":          { min: 8.5, max: 10.5, unit: "mg/dL", label: "Normal" },
  "phosphorus":             { min: 2.5, max: 4.5,  unit: "mg/dL", label: "Normal" },
  "magnesium":              { min: 1.7, max: 2.4,  unit: "mg/dL", label: "Normal" },

  // ─── Hormones ────────────────────────────────────────────────
  "testosterone":           { min: 300, max: 1000, unit: "ng/dL", label: "Normal (male)" },
  "estradiol":              { min: 15,  max: 350,  unit: "pg/mL", label: "Normal (female follicular)" },
  "cortisol":               { min: 6,   max: 23,   unit: "µg/dL", label: "Normal (morning)" },
  "insulin":                { min: 2,   max: 25,   unit: "µIU/mL", label: "Normal fasting" },
  "prolactin":              { min: 2,   max: 29,   unit: "ng/mL", label: "Normal" },

  // ─── Inflammation ─────────────────────────────────────────────
  "crp":                    { min: 0,   max: 1.0,  unit: "mg/L",  label: "Low risk" },
  "c-reactive protein":     { min: 0,   max: 1.0,  unit: "mg/L",  label: "Low risk" },
  "esr":                    { min: 0,   max: 20,   unit: "mm/hr", label: "Normal" },
};

export function getReferenceRange(markerName: string): ReferenceRange | null {
  const key = markerName.toLowerCase().trim();
  return RANGES[key] ?? null;
}

export function isInRange(value: number, range: ReferenceRange): boolean {
  return value >= range.min && value <= range.max;
}

export function getValueStatus(value: number, range: ReferenceRange): "normal" | "borderline" | "abnormal" {
  const pct10 = (range.max - range.min) * 0.1;
  if (value >= range.min && value <= range.max) return "normal";
  if (value >= range.min - pct10 && value <= range.max + pct10) return "borderline";
  return "abnormal";
}
