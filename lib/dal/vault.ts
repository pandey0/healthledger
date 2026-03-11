import "server-only";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cache } from "react";

// The 'cache' wrapper ensures that if multiple components request this same data
// during a single render, Prisma only hits the database once.
export const getUserDocuments = cache(async () => {
  const session = await auth();
  
  if (!session?.user?.id) {
    return [];
  }

  try {
    const documents = await prisma.document.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc", // Show newest uploads first
      },
      // We use Prisma's relation count to cleanly show how many markers were found
      include: {
        _count: {
          select: { extractedData: true }
        },
        extractedData: {
          where: { flag: { in: ['high', 'low', 'High', 'Low'] } },
          select: { id: true }
        }
      }
    });

    return documents;
  } catch (error) {
    console.error("DAL Error: Failed to fetch documents.", error);
    return [];
  }
});
// Add this below your existing getUserDocuments function

export const getDocumentById = cache(async (documentId: string) => {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  try {
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId: session.user.id, // 🔒 Strict security check: ensure it belongs to this user
      },
      include: {
        extractedData: {
          orderBy: {
            markerName: "asc", // Alphabetical order for easy reading
          },
        },
      },
    });

    return document;
  } catch (error) {
    console.error("DAL Error: Failed to fetch document details.", error);
    return null;
  }
});
// Fetch historical trend data for a specific biomarker
export const getBiomarkerHistory = cache(async (markerName: string) => {
  const session = await auth();
  
  if (!session?.user?.id) {
    return [];
  }

  try {
    const history = await prisma.extractedData.findMany({
      where: {
        userId: session.user.id,
        markerName: {
          equals: decodeURIComponent(markerName),
          mode: 'insensitive', // Catch 'glucose' and 'Glucose'
        },
        numericValue: {
          not: null, // We can only graph numbers!
        }
      },
      orderBy: {
        testDate: "asc", // Chronological order (oldest to newest) for the graph
      },
      select: {
        id: true,
        numericValue: true,
        unit: true,
        testDate: true,
        flag: true,
      }
    });

    return history;
  } catch (error) {
    console.error("DAL Error: Failed to fetch trend data.", error);
    return [];
  }
});