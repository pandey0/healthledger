"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type SaveDocumentPayload = {
  fileName: string;
  fileUrl: string;
  testDate: string;
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
    
    // 1. Extract and lock in the userId to satisfy TypeScript
    const userId = session?.user?.id;
    
    if (!userId) {
      return { success: false, error: "Unauthorized access." };
    }

    // 2. Create the main Document record
    const document = await prisma.document.create({
      data: {
        userId: userId, // TS is happy now
        fileName: payload.fileName,
        fileUrl: payload.fileUrl,
        status: "processed",
        testDate: new Date(payload.testDate),
      },
    });

    // 3. Format the extracted markers for bulk insertion
    const dataToSave = payload.extractedItems.map((item) => {
      // Intelligently parse numeric values for future trend graphs
      const numericVal = parseFloat(item.value);
      const isNumeric = !isNaN(numericVal);

      return {
        userId: userId, // TS is happy here too
        documentId: document.id,
        markerName: item.marker,
        numericValue: isNumeric ? numericVal : null,
        textValue: isNumeric ? null : item.value,
        unit: item.unit,
        flag: item.flag.toLowerCase(), // Standardize flags
        testDate: new Date(payload.testDate), // Use the test date provided by user
      };
    });

    // 4. Insert all biomarker data points linked to the new document
    await prisma.extractedData.createMany({
      data: dataToSave,
    });

    // 5. Quietly tell Next.js to refresh the Vault dashboard data
    revalidatePath("/vault");

    return { success: true, documentId: document.id };

  } catch (error) {
    console.error("Action Error: Failed to save to vault.", error);
    return { success: false, error: "Failed to archive document securely." };
  }
};
