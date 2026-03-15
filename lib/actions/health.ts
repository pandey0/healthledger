"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─── Tracker catalogue (shared with UI) ──────────────────────────────────────

export type TrackerParamType =
  | "blood_pressure"
  | "blood_sugar"
  | "weight"
  | "heart_rate"
  | "spo2"
  | "temperature"
  | "hba1c";

export const TRACKER_META: Record<
  TrackerParamType,
  { label: string; unit: string; emoji: string; desc: string; placeholder: string }
> = {
  blood_pressure: { label: "Blood Pressure",  unit: "mmHg", emoji: "🫀", desc: "Systolic / Diastolic",      placeholder: "e.g. 120/80" },
  blood_sugar:    { label: "Blood Sugar",      unit: "mg/dL",emoji: "🩸", desc: "Fasting or random glucose", placeholder: "e.g. 95"     },
  weight:         { label: "Body Weight",      unit: "kg",   emoji: "⚖️",  desc: "Daily or weekly weigh-in", placeholder: "e.g. 72.5"   },
  heart_rate:     { label: "Heart Rate",       unit: "bpm",  emoji: "💓", desc: "Resting pulse",             placeholder: "e.g. 72"     },
  spo2:           { label: "Oxygen (SpO₂)",    unit: "%",    emoji: "🫁", desc: "Blood oxygen saturation",   placeholder: "e.g. 98"     },
  temperature:    { label: "Temperature",      unit: "°C",   emoji: "🌡️", desc: "Body temperature",          placeholder: "e.g. 37.2"   },
  hba1c:          { label: "HbA1c",            unit: "%",    emoji: "📊", desc: "Glycated haemoglobin",      placeholder: "e.g. 5.7"    },
};

const ALL_PARAM_TYPES = Object.keys(TRACKER_META) as TrackerParamType[];

// ─── Tracker actions ──────────────────────────────────────────────────────────

/**
 * Onboarding bulk-save: sets exactly the chosen trackers as active,
 * deactivates the rest. Safe to call repeatedly.
 */
export async function saveHealthTrackers(paramTypes: TrackerParamType[]) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    await prisma.manualTracker.updateMany({ where: { userId }, data: { isActive: false } });

    for (const paramType of paramTypes) {
      await prisma.manualTracker.upsert({
        where: { userId_paramType: { userId, paramType } },
        create: { userId, paramType, unit: TRACKER_META[paramType].unit, isActive: true },
        update: { isActive: true },
      });
    }

    revalidatePath("/trackers");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("saveHealthTrackers", error);
    return { success: false, error: "Failed to save trackers." };
  }
}

/**
 * Toggle a single tracker on or off by paramType.
 * Creates the tracker record if it doesn't exist yet.
 */
export async function toggleTracker(paramType: TrackerParamType, isActive: boolean) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    await prisma.manualTracker.upsert({
      where: { userId_paramType: { userId, paramType } },
      create: { userId, paramType, unit: TRACKER_META[paramType].unit, isActive },
      update: { isActive },
    });

    revalidatePath("/trackers");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("toggleTracker", error);
    return { success: false, error: "Failed to update tracker." };
  }
}

// ─── Reading actions ──────────────────────────────────────────────────────────

export async function logReading(
  trackerId: string,
  value: string,
  recordedAt: string,
  notes?: string,
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    const tracker = await prisma.manualTracker.findFirst({ where: { id: trackerId, userId } });
    if (!tracker) return { success: false, error: "Tracker not found." };

    await prisma.manualReading.create({
      data: {
        userId,
        trackerId,
        value: value.trim(),
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
        notes: notes?.trim() || null,
      },
    });

    revalidatePath("/trackers");
    return { success: true };
  } catch (error) {
    console.error("logReading", error);
    return { success: false, error: "Failed to log reading." };
  }
}

export async function deleteReading(readingId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    await prisma.manualReading.deleteMany({ where: { id: readingId, userId } });
    revalidatePath("/trackers");
    return { success: true };
  } catch (error) {
    console.error("deleteReading", error);
    return { success: false, error: "Failed to delete reading." };
  }
}

// ─── Medication types ─────────────────────────────────────────────────────────

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

export const ALL_FREQUENCIES = Object.keys(FREQUENCY_LABELS) as MedFrequency[];

export type MedicationPayload = {
  name:       string;
  dosage:     string;
  frequency:  MedFrequency;
  notes?:     string;
  startDate?: string;
};

// ─── Medication actions ───────────────────────────────────────────────────────

/** Onboarding batch create — only adds, never deduplicates */
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

    revalidatePath("/trackers");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("saveMedications", error);
    return { success: false, error: "Failed to save medications." };
  }
}

/** Add a single medication (from settings or trackers page) */
export async function addMedication(payload: MedicationPayload) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    const med = await prisma.medication.create({
      data: {
        userId,
        name:      payload.name.trim(),
        dosage:    payload.dosage.trim(),
        frequency: payload.frequency,
        notes:     payload.notes?.trim() || null,
        startDate: payload.startDate ? new Date(payload.startDate) : null,
        isActive:  true,
      },
    });

    revalidatePath("/trackers");
    revalidatePath("/settings");
    return { success: true, id: med.id };
  } catch (error) {
    console.error("addMedication", error);
    return { success: false, error: "Failed to add medication." };
  }
}

/** Edit an existing medication */
export async function updateMedication(id: string, payload: Partial<MedicationPayload>) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    await prisma.medication.updateMany({
      where: { id, userId },
      data: {
        ...(payload.name      && { name:      payload.name.trim() }),
        ...(payload.dosage    && { dosage:    payload.dosage.trim() }),
        ...(payload.frequency && { frequency: payload.frequency }),
        ...(payload.notes !== undefined && { notes: payload.notes?.trim() || null }),
        ...(payload.startDate !== undefined && {
          startDate: payload.startDate ? new Date(payload.startDate) : null,
        }),
      },
    });

    revalidatePath("/trackers");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("updateMedication", error);
    return { success: false, error: "Failed to update medication." };
  }
}

/** Soft-delete (deactivate) a medication */
export async function deactivateMedication(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    await prisma.medication.updateMany({ where: { id, userId }, data: { isActive: false } });
    revalidatePath("/trackers");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("deactivateMedication", error);
    return { success: false, error: "Failed to remove medication." };
  }
}

// ─── DAL helpers (called from server components/API routes) ──────────────────

export async function getTrackerSettings(userId: string) {
  const existing = await prisma.manualTracker.findMany({
    where: { userId },
    include: { _count: { select: { readings: true } } },
  });

  return ALL_PARAM_TYPES.map((paramType) => {
    const record = existing.find((t) => t.paramType === paramType);
    return {
      id:        record?.id ?? null,
      paramType,
      isActive:  record?.isActive ?? false,
      readingCount: record?._count.readings ?? 0,
      ...TRACKER_META[paramType],
    };
  });
}

export async function getReadingsForTracker(trackerId: string, userId: string) {
  return prisma.manualReading.findMany({
    where: { trackerId, userId },
    orderBy: { recordedAt: "desc" },
    take: 100,
  });
}

export async function getAllReadings(userId: string) {
  const trackers = await prisma.manualTracker.findMany({
    where: { userId, isActive: true },
    include: {
      readings: {
        orderBy: { recordedAt: "desc" },
        take: 50,
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return trackers;
}

export async function getMedications(userId: string) {
  return prisma.medication.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}
