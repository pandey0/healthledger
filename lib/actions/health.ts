"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─── Tracker Types ────────────────────────────────────────────────────────────

export type TrackerParamType =
  | "blood_pressure"
  | "blood_sugar"
  | "weight"
  | "heart_rate"
  | "spo2"
  | "temperature"
  | "hba1c";

const TRACKER_UNITS: Record<TrackerParamType, string> = {
  blood_pressure: "mmHg",
  blood_sugar:    "mg/dL",
  weight:         "kg",
  heart_rate:     "bpm",
  spo2:           "%",
  temperature:    "°C",
  hba1c:          "%",
};

/**
 * Save the user's chosen health trackers (upserts — safe to call again
 * if user edits from settings later). Any param NOT in the list gets
 * deactivated; params in the list get created or re-activated.
 */
export async function saveHealthTrackers(paramTypes: TrackerParamType[]) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    // Deactivate all existing trackers first
    await prisma.manualTracker.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Upsert selected ones as active
    for (const paramType of paramTypes) {
      await prisma.manualTracker.upsert({
        where: { userId_paramType: { userId, paramType } },
        create: {
          userId,
          paramType,
          unit: TRACKER_UNITS[paramType],
          isActive: true,
        },
        update: { isActive: true },
      });
    }

    revalidatePath("/home");
    return { success: true };
  } catch (error) {
    console.error("Action Error: saveHealthTrackers", error);
    return { success: false, error: "Failed to save trackers." };
  }
}

// ─── Medication Types ─────────────────────────────────────────────────────────

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

export type MedicationPayload = {
  name:      string;
  dosage:    string;
  frequency: MedFrequency;
  notes?:    string;
  startDate?: string; // ISO date string
};

/**
 * Save a list of medications entered during onboarding.
 * Called once — creates new records. Existing active meds are
 * preserved; this only adds new ones from the onboarding batch.
 */
export async function saveMedications(medications: MedicationPayload[]) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    if (medications.length === 0) return { success: true };

    await prisma.medication.createMany({
      data: medications.map((m) => ({
        userId,
        name:      m.name.trim(),
        dosage:    m.dosage.trim(),
        frequency: m.frequency,
        notes:     m.notes?.trim() || null,
        startDate: m.startDate ? new Date(m.startDate) : null,
        isActive:  true,
      })),
    });

    revalidatePath("/home");
    return { success: true };
  } catch (error) {
    console.error("Action Error: saveMedications", error);
    return { success: false, error: "Failed to save medications." };
  }
}
