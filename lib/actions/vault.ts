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
