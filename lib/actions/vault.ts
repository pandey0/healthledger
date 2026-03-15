"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type SaveDocumentPayload = {
  fileName: string;
  fileUrl: string;
  testDate: string;
  reportType?: string;
  extractedItems: {
    marker: string;
    value: string;
    unit: string;
    flag: string;
  }[];
};

export async function saveDocumentData(payload: SaveDocumentPayload) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "Unauthorized access." };
    }

    const document = await prisma.document.create({
      data: {
        userId,
        fileName: payload.fileName,
        fileUrl: payload.fileUrl,
        status: "processed",
        reportDate: new Date(payload.testDate),
        reportType: payload.reportType ?? null,
      },
    });

    const dataToSave = payload.extractedItems.map((item) => {
      const numericVal = parseFloat(item.value);
      const isNumeric = !isNaN(numericVal);

      return {
        userId,
        documentId: document.id,
        markerName: item.marker,
        numericValue: isNumeric ? numericVal : null,
        textValue: isNumeric ? null : item.value,
        unit: item.unit,
        flag: item.flag.toLowerCase(),
        testDate: new Date(payload.testDate),
      };
    });

    await prisma.extractedData.createMany({ data: dataToSave });

    revalidatePath("/vault");

    return { success: true, documentId: document.id };
  } catch (error) {
    console.error("Action Error: Failed to save to vault.", error);
    return { success: false, error: "Failed to archive document securely." };
  }
}

export async function deleteDocument(documentId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.userId !== userId) return { success: false, error: "Not found." };

    await prisma.extractedData.deleteMany({ where: { documentId } });
    await prisma.document.delete({ where: { id: documentId } });

    revalidatePath("/vault");
    return { success: true };
  } catch (error) {
    console.error("Action Error: Failed to delete document.", error);
    return { success: false, error: "Failed to delete report." };
  }
}

type UpdateMarkerPayload = {
  id: string;
  markerName: string;
  value: string;
  unit: string;
  flag: string;
};

export async function updateMarker(payload: UpdateMarkerPayload) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    const existing = await prisma.extractedData.findUnique({ where: { id: payload.id } });
    if (!existing || existing.userId !== userId) return { success: false, error: "Not found." };

    const numericVal = parseFloat(payload.value);
    const isNumeric = !isNaN(numericVal);

    await prisma.extractedData.update({
      where: { id: payload.id },
      data: {
        markerName: payload.markerName,
        numericValue: isNumeric ? numericVal : null,
        textValue: isNumeric ? null : payload.value,
        unit: payload.unit,
        flag: payload.flag.toLowerCase(),
      },
    });

    revalidatePath("/vault");
    return { success: true };
  } catch (error) {
    console.error("Action Error: Failed to update marker.", error);
    return { success: false, error: "Failed to update marker." };
  }
}

export async function deleteMarker(markerId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized." };

    const existing = await prisma.extractedData.findUnique({ where: { id: markerId } });
    if (!existing || existing.userId !== userId) return { success: false, error: "Not found." };

    await prisma.extractedData.delete({ where: { id: markerId } });

    revalidatePath("/vault");
    return { success: true };
  } catch (error) {
    console.error("Action Error: Failed to delete marker.", error);
    return { success: false, error: "Failed to delete marker." };
  }
}
