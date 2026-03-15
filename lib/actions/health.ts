"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  TRACKER_META, ALL_PARAM_TYPES,
  type TrackerParamType, type MedFrequency, type MedicationPayload,
} from "@/lib/health-constants";

// ─── Tracker actions ──────────────────────────────────────────────────────────

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

// ─── Medication actions ───────────────────────────────────────────────────────

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

// ─── DAL helpers ─────────────────────────────────────────────────────────────

export async function getTrackerSettings(userId: string) {
  const existing = await prisma.manualTracker.findMany({
    where: { userId },
    include: { _count: { select: { readings: true } } },
  });

  return ALL_PARAM_TYPES.map((paramType) => {
    const record = existing.find((t) => t.paramType === paramType);
    return {
      id:           record?.id ?? null,
      paramType,
      isActive:     record?.isActive ?? false,
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
  return prisma.manualTracker.findMany({
    where: { userId, isActive: true },
    include: {
      readings: { orderBy: { recordedAt: "desc" }, take: 50 },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getMedications(userId: string) {
  return prisma.medication.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

// ─── Medication check-in (mark as taken) ─────────────────────────────────────

export async function markMedicationTaken(medicationId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized." };

  await prisma.medicationLog.create({ data: { userId, medicationId } });
  revalidatePath("/");
  return { success: true };
}

export async function getTodayMedicationLogs(userId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return prisma.medicationLog.findMany({
    where: { userId, takenAt: { gte: start, lte: end } },
    select: { id: true, medicationId: true, takenAt: true },
    orderBy: { takenAt: "asc" },
  });
}
