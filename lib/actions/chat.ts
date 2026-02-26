"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function queryHealthData(userMessage: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "Unauthorized access." };
    }

    // 1. Fetch the user's entire extracted medical history from PostgreSQL
    const history = await prisma.extractedData.findMany({
      where: { userId: userId },
      orderBy: { testDate: "desc" },
      select: {
        markerName: true,
        numericValue: true,
        textValue: true,
        unit: true,
        testDate: true,
        document: { select: { fileName: true } }
      }
    });

    if (history.length === 0) {
      return { 
        success: true, 
        text: "Your vault is currently empty. Please upload a report before querying your data." 
      };
    }

    // 2. Format the data into a clean, readable string for the Python AI to ingest
    const contextData = history.map(item => 
      `- ${item.testDate.toISOString().split('T')[0]}: ${item.markerName} = ${item.numericValue ?? item.textValue} ${item.unit || ''} (Source: ${item.document.fileName})`
    ).join("\n");

    // 3. Send the formatted data and the user's message to the Python Worker
    const pythonResponse = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        context: contextData,
      }),
    });

    if (!pythonResponse.ok) {
      throw new Error("Python API responded with an error.");
    }

    const aiData = await pythonResponse.json();

    // 4. Return the clean text back to the React UI
    return { success: true, text: aiData.text };

  } catch (error) {
    console.error("Chat Action Error:", error);
    return { success: false, error: "Failed to connect to the intelligence engine." };
  }
}