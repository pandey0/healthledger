export type UnitSystem = "mg/dL" | "mmol/L" | "g/dL" | "g/L" | "mIU/L" | "µIU/mL" | "pg/mL" | "ng/mL" | "ng/dL" | "µg/dL" | "U/L" | "mEq/L" | "mEq/l" | "×10³/µL" | "×10⁶/µL" | "fL" | "pg" | "%" | "mg/L" | "mm/hr" | "mL/min" | "mmol/mol";

type ConversionFactor = {
  fromUnit: string;
  toUnit: string;
  factor: number;
  offset?: number;
};

const COMMON_UNIT_ALIASES: Record<string, string> = {
  "mg/100mL": "mg/dL",
  "mg%": "mg/dL",
  "mmol/l": "mmol/L",
  "meq/l": "mEq/L",
  "g%": "g/dL",
  "iiu/ml": "µIU/mL",
  "iiu/ml": "µIU/mL",
  "miu/l": "mIU/L",
  "x10^3/ul": "×10³/µL",
  "x10^6/ul": "×10⁶/µL",
  "x 10^3/ul": "×10³/µL",
};

const CONVERSION_TABLE: ConversionFactor[] = [
  // Glucose: mg/dL ↔ mmol/L (factor: 0.0555)
  { fromUnit: "mg/dL", toUnit: "mmol/L", factor: 0.0555 },
  { fromUnit: "mmol/L", toUnit: "mg/dL", factor: 18.018 },

  // Cholesterol: mg/dL ↔ mmol/L (factor: 0.02586)
  { fromUnit: "mg/dL", toUnit: "mmol/L", factor: 0.02586 },
  { fromUnit: "mmol/L", toUnit: "mg/dL", factor: 38.67 },

  // Triglycerides: mg/dL ↔ mmol/L (factor: 0.01129)
  { fromUnit: "mg/dL", toUnit: "mmol/L", factor: 0.01129 },
  { fromUnit: "mmol/L", toUnit: "mg/dL", factor: 88.57 },

  // Creatinine: mg/dL ↔ µmol/L (factor: 88.4)
  { fromUnit: "mg/dL", toUnit: "µmol/L", factor: 88.4 },
  { fromUnit: "µmol/L", toUnit: "mg/dL", factor: 0.01131 },

  // Hemoglobin: g/dL ↔ g/L
  { fromUnit: "g/dL", toUnit: "g/L", factor: 10 },
  { fromUnit: "g/L", toUnit: "g/dL", factor: 0.1 },

  // Hemoglobin: g/dL ↔ mmol/L (for iron binding, factor: 0.6206)
  { fromUnit: "g/dL", toUnit: "mmol/L", factor: 0.6206 },
  { fromUnit: "mmol/L", toUnit: "g/dL", factor: 1.611 },

  // TSH: mIU/L ↔ mIU/L (same)
  { fromUnit: "mIU/L", toUnit: "µIU/mL", factor: 1 },
];

export function normalizeUnit(unit: string): string | null {
  if (!unit) return null;

  const trimmed = unit.trim();
  const lower = trimmed.toLowerCase();

  // Check aliases first
  if (lower in COMMON_UNIT_ALIASES) {
    return COMMON_UNIT_ALIASES[lower];
  }

  // Check if it's already a valid unit
  const validUnits: UnitSystem[] = [
    "mg/dL", "mmol/L", "g/dL", "g/L", "mIU/L", "µIU/mL",
    "pg/mL", "ng/mL", "ng/dL", "µg/dL", "U/L", "mEq/L",
    "×10³/µL", "×10⁶/µL", "fL", "pg", "%", "mg/L", "mm/hr", "mL/min", "mmol/mol"
  ];

  // Case-insensitive match for valid units
  const match = validUnits.find(u => u.toLowerCase() === lower);
  return match || null;
}

export function convertValue(value: number, fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return value;

  const normalized_from = normalizeUnit(fromUnit);
  const normalized_to = normalizeUnit(toUnit);

  if (!normalized_from || !normalized_to) return null;

  // Find conversion in table
  const conversion = CONVERSION_TABLE.find(
    c => c.fromUnit === normalized_from && c.toUnit === normalized_to
  );

  if (!conversion) return null;

  return value * conversion.factor + (conversion.offset || 0);
}

export function getStandardUnit(markerName: string): string {
  const name = markerName.toLowerCase();

  // Glucose/HbA1c
  if (name.includes("glucose") || name.includes("hba1c")) return "mg/dL";
  if (name.includes("glycosylated") || name.includes("glycated")) return "%";

  // Lipids
  if (name.includes("cholesterol") || name.includes("triglyceride")) return "mg/dL";
  if (name.includes("hdl") || name.includes("ldl")) return "mg/dL";

  // Blood counts
  if (name.includes("hemoglobin") || name.includes("hb") || name.includes("hgb")) return "g/dL";
  if (name.includes("wbc") || name.includes("rbc") || name.includes("platelet")) return "×10³/µL";

  // Thyroid
  if (name.includes("tsh")) return "mIU/L";
  if (name.includes("t3") || name.includes("t4")) return "ng/dL";

  // Vitamins
  if (name.includes("vitamin d")) return "ng/mL";
  if (name.includes("b12") || name.includes("folate")) return "pg/mL";

  // Kidney/Liver
  if (name.includes("creatinine")) return "mg/dL";
  if (name.includes("bun") || name.includes("urea")) return "mg/dL";
  if (name.includes("alt") || name.includes("ast") || name.includes("alp")) return "U/L";

  // Electrolytes
  if (name.includes("sodium") || name.includes("potassium") || name.includes("chloride")) return "mEq/L";
  if (name.includes("calcium")) return "mg/dL";

  return "unknown";
}

export function validateUnit(markerName: string, unit: string): boolean {
  const normalized = normalizeUnit(unit);
  if (!normalized) return false;

  const standard = getStandardUnit(markerName);
  if (standard === "unknown") return true; // Unknown marker, but unit is valid

  return normalized === standard;
}
