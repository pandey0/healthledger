import { convertValue, normalizeUnit } from "./unitConversion";

export type ReferenceRange = {
  min: number;
  max: number;
  unit: string;
  label: string;
  note?: string;
};

export type UserProfile = {
  gender?: "male" | "female" | "other" | null;
  age?: number | null;
};

// Gender/age-specific ranges take priority, then fall back to generic
type GenderedRange = {
  male?: ReferenceRange;
  female?: ReferenceRange;
  generic: ReferenceRange;
};

const GENDERED_RANGES: Record<string, GenderedRange> = {
  // ─── CBC: Hemoglobin ───────────────────────────────────────────
  "hemoglobin": {
    male:    { min: 13.5, max: 17.5, unit: "g/dL", label: "Normal (male)" },
    female:  { min: 12.0, max: 15.5, unit: "g/dL", label: "Normal (female)" },
    generic: { min: 12.0, max: 17.5, unit: "g/dL", label: "Normal", note: "12–15.5 female, 13.5–17.5 male" },
  },
  "hb": {
    male:    { min: 13.5, max: 17.5, unit: "g/dL", label: "Normal (male)" },
    female:  { min: 12.0, max: 15.5, unit: "g/dL", label: "Normal (female)" },
    generic: { min: 12.0, max: 17.5, unit: "g/dL", label: "Normal" },
  },
  "hgb": {
    male:    { min: 13.5, max: 17.5, unit: "g/dL", label: "Normal (male)" },
    female:  { min: 12.0, max: 15.5, unit: "g/dL", label: "Normal (female)" },
    generic: { min: 12.0, max: 17.5, unit: "g/dL", label: "Normal" },
  },

  // ─── CBC: Hematocrit ───────────────────────────────────────────
  "hematocrit": {
    male:    { min: 41, max: 53, unit: "%", label: "Normal (male)" },
    female:  { min: 36, max: 46, unit: "%", label: "Normal (female)" },
    generic: { min: 36, max: 53, unit: "%", label: "Normal" },
  },
  "pcv": {
    male:    { min: 41, max: 53, unit: "%", label: "Normal (male)" },
    female:  { min: 36, max: 46, unit: "%", label: "Normal (female)" },
    generic: { min: 36, max: 50, unit: "%", label: "Normal" },
  },

  // ─── CBC: RBC ─────────────────────────────────────────────────
  "rbc": {
    male:    { min: 4.7, max: 6.1, unit: "×10⁶/µL", label: "Normal (male)" },
    female:  { min: 4.2, max: 5.4, unit: "×10⁶/µL", label: "Normal (female)" },
    generic: { min: 4.2, max: 6.1, unit: "×10⁶/µL", label: "Normal" },
  },
  "red blood cells": {
    male:    { min: 4.7, max: 6.1, unit: "×10⁶/µL", label: "Normal (male)" },
    female:  { min: 4.2, max: 5.4, unit: "×10⁶/µL", label: "Normal (female)" },
    generic: { min: 4.2, max: 6.1, unit: "×10⁶/µL", label: "Normal" },
  },

  // ─── Iron / Ferritin ─────────────────────────────────────────
  "ferritin": {
    male:    { min: 24,  max: 336, unit: "ng/mL", label: "Normal (male)" },
    female:  { min: 11,  max: 307, unit: "ng/mL", label: "Normal (female)" },
    generic: { min: 11,  max: 336, unit: "ng/mL", label: "Normal" },
  },
  "iron": {
    male:    { min: 65,  max: 175, unit: "µg/dL", label: "Normal (male)" },
    female:  { min: 50,  max: 170, unit: "µg/dL", label: "Normal (female)" },
    generic: { min: 60,  max: 170, unit: "µg/dL", label: "Normal" },
  },
  "serum iron": {
    male:    { min: 65,  max: 175, unit: "µg/dL", label: "Normal (male)" },
    female:  { min: 50,  max: 170, unit: "µg/dL", label: "Normal (female)" },
    generic: { min: 60,  max: 170, unit: "µg/dL", label: "Normal" },
  },

  // ─── Kidney: Creatinine ───────────────────────────────────────
  "creatinine": {
    male:    { min: 0.7, max: 1.3, unit: "mg/dL", label: "Normal (male)" },
    female:  { min: 0.5, max: 1.1, unit: "mg/dL", label: "Normal (female)" },
    generic: { min: 0.6, max: 1.3, unit: "mg/dL", label: "Normal" },
  },
  "serum creatinine": {
    male:    { min: 0.7, max: 1.3, unit: "mg/dL", label: "Normal (male)" },
    female:  { min: 0.5, max: 1.1, unit: "mg/dL", label: "Normal (female)" },
    generic: { min: 0.6, max: 1.3, unit: "mg/dL", label: "Normal" },
  },

  // ─── Lipids: HDL ─────────────────────────────────────────────
  "hdl": {
    male:    { min: 40,  max: 999, unit: "mg/dL", label: "Optimal (male, ↑ better)", note: "Low < 40 for men" },
    female:  { min: 50,  max: 999, unit: "mg/dL", label: "Optimal (female, ↑ better)", note: "Low < 50 for women" },
    generic: { min: 40,  max: 999, unit: "mg/dL", label: "Optimal (↑ better)", note: "Higher is better" },
  },
  "hdl cholesterol": {
    male:    { min: 40,  max: 999, unit: "mg/dL", label: "Optimal (male)" },
    female:  { min: 50,  max: 999, unit: "mg/dL", label: "Optimal (female)" },
    generic: { min: 40,  max: 999, unit: "mg/dL", label: "Optimal", note: "Higher is better" },
  },
  "hdl-c": {
    male:    { min: 40,  max: 999, unit: "mg/dL", label: "Optimal (male)" },
    female:  { min: 50,  max: 999, unit: "mg/dL", label: "Optimal (female)" },
    generic: { min: 40,  max: 999, unit: "mg/dL", label: "Optimal" },
  },

  // ─── Hormones: Testosterone ────────────────────────────────────
  "testosterone": {
    male:    { min: 300, max: 1000, unit: "ng/dL", label: "Normal (male)" },
    female:  { min: 15,  max: 70,   unit: "ng/dL", label: "Normal (female)" },
    generic: { min: 15,  max: 1000, unit: "ng/dL", label: "Normal" },
  },

  // ─── Liver: ALT ────────────────────────────────────────────────
  "alt": {
    male:    { min: 7,  max: 56, unit: "U/L", label: "Normal (male)" },
    female:  { min: 7,  max: 45, unit: "U/L", label: "Normal (female)" },
    generic: { min: 7,  max: 56, unit: "U/L", label: "Normal" },
  },
  "sgpt": {
    male:    { min: 7,  max: 56, unit: "U/L", label: "Normal (male)" },
    female:  { min: 7,  max: 45, unit: "U/L", label: "Normal (female)" },
    generic: { min: 7,  max: 56, unit: "U/L", label: "Normal" },
  },

  // ─── TSH: Age-adjustable ──────────────────────────────────────
  "tsh": {
    generic: { min: 0.4, max: 4.0, unit: "mIU/L", label: "Normal" },
  },
  "thyroid stimulating hormone": {
    generic: { min: 0.4, max: 4.0, unit: "mIU/L", label: "Normal" },
  },

  // ─── Uric Acid ─────────────────────────────────────────────────
  "uric acid": {
    male:    { min: 3.4, max: 7.0, unit: "mg/dL", label: "Normal (male)" },
    female:  { min: 2.4, max: 6.0, unit: "mg/dL", label: "Normal (female)" },
    generic: { min: 2.4, max: 7.0, unit: "mg/dL", label: "Normal" },
  },
};

const RANGES: Record<string, ReferenceRange> = {
  // ─── Glucose / Diabetes ────────────────────────────────────────
  "fasting glucose":         { min: 70,  max: 99,   unit: "mg/dL", label: "Normal fasting" },
  "glucose":                 { min: 70,  max: 99,   unit: "mg/dL", label: "Normal fasting" },
  "blood glucose":           { min: 70,  max: 99,   unit: "mg/dL", label: "Normal fasting" },
  "random glucose":          { min: 70,  max: 140,  unit: "mg/dL", label: "Normal random" },
  "hba1c":                   { min: 4.0, max: 5.6,  unit: "%",     label: "Non-diabetic" },
  "glycated hemoglobin":     { min: 4.0, max: 5.6,  unit: "%",     label: "Non-diabetic" },
  "glycosylated hemoglobin": { min: 4.0, max: 5.6,  unit: "%",     label: "Non-diabetic" },

  // ─── Lipid Panel ───────────────────────────────────────────────
  "total cholesterol":  { min: 0,   max: 200,  unit: "mg/dL", label: "Desirable" },
  "cholesterol":        { min: 0,   max: 200,  unit: "mg/dL", label: "Desirable" },
  "ldl":                { min: 0,   max: 100,  unit: "mg/dL", label: "Optimal" },
  "ldl cholesterol":    { min: 0,   max: 100,  unit: "mg/dL", label: "Optimal" },
  "ldl-c":              { min: 0,   max: 100,  unit: "mg/dL", label: "Optimal" },
  "triglycerides":      { min: 0,   max: 150,  unit: "mg/dL", label: "Normal" },
  "vldl":               { min: 2,   max: 30,   unit: "mg/dL", label: "Normal" },

  // ─── CBC ───────────────────────────────────────────────────────
  "wbc":                    { min: 4,   max: 11,   unit: "×10³/µL", label: "Normal" },
  "white blood cells":      { min: 4,   max: 11,   unit: "×10³/µL", label: "Normal" },
  "total leukocyte count":  { min: 4,   max: 11,   unit: "×10³/µL", label: "Normal" },
  "tlc":                    { min: 4,   max: 11,   unit: "×10³/µL", label: "Normal" },
  "platelets":              { min: 150, max: 400,  unit: "×10³/µL", label: "Normal" },
  "platelet count":         { min: 150, max: 400,  unit: "×10³/µL", label: "Normal" },
  "mcv":                    { min: 80,  max: 100,  unit: "fL",      label: "Normal" },
  "mch":                    { min: 27,  max: 33,   unit: "pg",      label: "Normal" },
  "mchc":                   { min: 32,  max: 36,   unit: "g/dL",    label: "Normal" },

  // ─── Thyroid ───────────────────────────────────────────────────
  "free t3":  { min: 2.3, max: 4.2,  unit: "pg/mL", label: "Normal" },
  "t3":       { min: 80,  max: 200,  unit: "ng/dL", label: "Normal" },
  "free t4":  { min: 0.8, max: 1.8,  unit: "ng/dL", label: "Normal" },
  "t4":       { min: 5.1, max: 14.1, unit: "µg/dL", label: "Normal" },
  "thyroxine":{ min: 5.1, max: 14.1, unit: "µg/dL", label: "Normal" },

  // ─── Vitamins ──────────────────────────────────────────────────
  "vitamin d":       { min: 30,  max: 100,  unit: "ng/mL", label: "Sufficient" },
  "vitamin d3":      { min: 30,  max: 100,  unit: "ng/mL", label: "Sufficient" },
  "25-oh vitamin d": { min: 30,  max: 100,  unit: "ng/mL", label: "Sufficient" },
  "25(oh)d":         { min: 30,  max: 100,  unit: "ng/mL", label: "Sufficient" },
  "vitamin b12":     { min: 200, max: 900,  unit: "pg/mL", label: "Normal" },
  "b12":             { min: 200, max: 900,  unit: "pg/mL", label: "Normal" },
  "cobalamin":       { min: 200, max: 900,  unit: "pg/mL", label: "Normal" },
  "folate":          { min: 2.7, max: 17.0, unit: "ng/mL", label: "Normal" },
  "folic acid":      { min: 2.7, max: 17.0, unit: "ng/mL", label: "Normal" },

  // ─── Kidney Function ───────────────────────────────────────────
  "blood urea nitrogen": { min: 7,   max: 20,  unit: "mg/dL",  label: "Normal" },
  "bun":                 { min: 7,   max: 20,  unit: "mg/dL",  label: "Normal" },
  "urea":                { min: 15,  max: 45,  unit: "mg/dL",  label: "Normal" },
  "blood urea":          { min: 15,  max: 45,  unit: "mg/dL",  label: "Normal" },
  "egfr":                { min: 60,  max: 999, unit: "mL/min", label: "Normal (↑ better)", note: "Higher is better" },

  // ─── Liver Function ────────────────────────────────────────────
  "ast":                  { min: 10,  max: 40,   unit: "U/L",   label: "Normal" },
  "sgot":                 { min: 10,  max: 40,   unit: "U/L",   label: "Normal" },
  "alp":                  { min: 44,  max: 147,  unit: "U/L",   label: "Normal" },
  "alkaline phosphatase": { min: 44,  max: 147,  unit: "U/L",   label: "Normal" },
  "ggt":                  { min: 9,   max: 48,   unit: "U/L",   label: "Normal" },
  "gamma-gt":             { min: 9,   max: 48,   unit: "U/L",   label: "Normal" },
  "total bilirubin":      { min: 0.1, max: 1.2,  unit: "mg/dL", label: "Normal" },
  "direct bilirubin":     { min: 0.0, max: 0.3,  unit: "mg/dL", label: "Normal" },
  "indirect bilirubin":   { min: 0.1, max: 0.9,  unit: "mg/dL", label: "Normal" },
  "total protein":        { min: 6.3, max: 8.2,  unit: "g/dL",  label: "Normal" },
  "albumin":              { min: 3.5, max: 5.0,  unit: "g/dL",  label: "Normal" },

  // ─── Electrolytes ──────────────────────────────────────────────
  "sodium":        { min: 136, max: 145,  unit: "mEq/L", label: "Normal" },
  "potassium":     { min: 3.5, max: 5.0,  unit: "mEq/L", label: "Normal" },
  "chloride":      { min: 98,  max: 106,  unit: "mEq/L", label: "Normal" },
  "calcium":       { min: 8.5, max: 10.5, unit: "mg/dL", label: "Normal" },
  "serum calcium": { min: 8.5, max: 10.5, unit: "mg/dL", label: "Normal" },
  "phosphorus":    { min: 2.5, max: 4.5,  unit: "mg/dL", label: "Normal" },
  "magnesium":     { min: 1.7, max: 2.4,  unit: "mg/dL", label: "Normal" },

  // ─── Hormones ──────────────────────────────────────────────────
  "estradiol": { min: 15,  max: 350,  unit: "pg/mL",  label: "Normal (female follicular)" },
  "cortisol":  { min: 6,   max: 23,   unit: "µg/dL",  label: "Normal (morning)" },
  "insulin":   { min: 2,   max: 25,   unit: "µIU/mL", label: "Normal fasting" },
  "prolactin": { min: 2,   max: 29,   unit: "ng/mL",  label: "Normal" },

  // ─── Inflammation ──────────────────────────────────────────────
  "crp":                { min: 0, max: 1.0, unit: "mg/L",  label: "Low risk" },
  "c-reactive protein": { min: 0, max: 1.0, unit: "mg/L",  label: "Low risk" },
  "esr":                { min: 0, max: 20,  unit: "mm/hr", label: "Normal" },
};

/**
 * Gets the reference range for a biomarker, optionally adjusted for gender and age.
 * Gender-specific ranges are used when gender is provided.
 * TSH has an age-adjusted upper limit for older adults.
 */
export function getReferenceRange(
  markerName: string,
  profile?: UserProfile
): ReferenceRange | null {
  const key = markerName.toLowerCase().trim();

  // Check gendered ranges first
  if (key in GENDERED_RANGES) {
    const gendered = GENDERED_RANGES[key];
    const gender = profile?.gender;

    if (gender === "male" && gendered.male) return gendered.male;
    if (gender === "female" && gendered.female) return gendered.female;
    return gendered.generic;
  }

  // Age-specific adjustment for TSH
  if ((key === "tsh" || key === "thyroid stimulating hormone") && profile?.age && profile.age >= 60) {
    return { min: 0.4, max: 7.0, unit: "mIU/L", label: "Normal (60+ years)" };
  }

  // Age-specific adjustment for ESR (Westergren formula: age/2 for male, (age+10)/2 for female)
  if (key === "esr" && profile?.age) {
    const age = profile.age;
    const gender = profile?.gender;
    if (gender === "male") {
      return { min: 0, max: Math.round(age / 2), unit: "mm/hr", label: "Normal (age-adjusted)" };
    } else if (gender === "female") {
      return { min: 0, max: Math.round((age + 10) / 2), unit: "mm/hr", label: "Normal (age-adjusted)" };
    }
  }

  return RANGES[key] ?? null;
}

export function isInRange(
  value: number,
  range: ReferenceRange,
  extractedUnit?: string
): boolean {
  if (!extractedUnit) return value >= range.min && value <= range.max;

  const normalizedExtracted = normalizeUnit(extractedUnit);
  const normalizedRange = normalizeUnit(range.unit);

  if (!normalizedExtracted || !normalizedRange || normalizedExtracted === normalizedRange) {
    return value >= range.min && value <= range.max;
  }

  const converted = convertValue(value, normalizedExtracted, normalizedRange);
  return converted !== null ? converted >= range.min && converted <= range.max : value >= range.min && value <= range.max;
}

export function getValueStatus(
  value: number,
  range: ReferenceRange,
  extractedUnit?: string
): "normal" | "borderline" | "abnormal" {
  const pct10 = (range.max - range.min) * 0.1;
  let compareValue = value;

  if (extractedUnit) {
    const normalizedExtracted = normalizeUnit(extractedUnit);
    const normalizedRange = normalizeUnit(range.unit);
    if (normalizedExtracted && normalizedRange && normalizedExtracted !== normalizedRange) {
      const converted = convertValue(value, normalizedExtracted, normalizedRange);
      if (converted !== null) compareValue = converted;
    }
  }

  if (compareValue >= range.min && compareValue <= range.max) return "normal";
  if (compareValue >= range.min - pct10 && compareValue <= range.max + pct10) return "borderline";
  return "abnormal";
}
