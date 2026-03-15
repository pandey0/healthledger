import "server-only";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cache } from "react";

export const getUserDocuments = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { reportDate: "desc" },
      include: {
        _count: { select: { extractedData: true } },
        extractedData: {
          select: {
            id: true,
            markerName: true,
            flag: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("DAL Error: Failed to fetch documents.", error);
    return [];
  }
});

export const getDocumentById = cache(async (documentId: string) => {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    return await prisma.document.findUnique({
      where: { id: documentId, userId: session.user.id },
      include: {
        extractedData: { orderBy: { markerName: "asc" } },
      },
    });
  } catch (error) {
    console.error("DAL Error: Failed to fetch document details.", error);
    return null;
  }
});

export const getBiomarkerHistory = cache(async (markerName: string) => {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await prisma.extractedData.findMany({
      where: {
        userId: session.user.id,
        markerName: { equals: decodeURIComponent(markerName), mode: "insensitive" },
        numericValue: { not: null },
      },
      orderBy: { testDate: "asc" },
      select: { id: true, numericValue: true, unit: true, testDate: true, flag: true },
    });
  } catch (error) {
    console.error("DAL Error: Failed to fetch trend data.", error);
    return [];
  }
});

export type TimelineEntry = {
  id: string;
  fileName: string;
  reportDate: Date;
  reportType: string | null;
  totalMarkers: number;
  normalCount: number;
  flaggedCount: number;
  keyMarkers: { name: string; value: number | null; unit: string | null; flag: string | null }[];
};

export const getHealthTimeline = cache(async (): Promise<TimelineEntry[]> => {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { reportDate: "asc" },
      include: {
        extractedData: {
          select: {
            markerName: true,
            numericValue: true,
            unit: true,
            flag: true,
          },
        },
      },
    });

    return documents.map((doc) => {
      const flagged = doc.extractedData.filter(
        (d) => d.flag === "high" || d.flag === "low"
      );
      const normal = doc.extractedData.filter(
        (d) => d.flag === "normal"
      );

      // Key markers: flagged first, then numeric ones
      const keyMarkers = [
        ...flagged,
        ...doc.extractedData.filter(
          (d) => d.numericValue !== null && d.flag === "normal"
        ),
      ]
        .slice(0, 4)
        .map((d) => ({
          name: d.markerName,
          value: d.numericValue,
          unit: d.unit,
          flag: d.flag,
        }));

      return {
        id: doc.id,
        fileName: doc.fileName,
        reportDate: doc.reportDate,
        reportType: doc.reportType,
        totalMarkers: doc.extractedData.length,
        normalCount: normal.length,
        flaggedCount: flagged.length,
        keyMarkers,
      };
    });
  } catch (error) {
    console.error("DAL Error: Failed to fetch health timeline.", error);
    return [];
  }
});

export type AllBiomarkerSummary = {
  markerName: string;
  latestValue: number | null;
  latestUnit: string | null;
  latestFlag: string | null;
  latestDate: Date;
  totalReadings: number;
};

export const getAllBiomarkerSummaries = cache(async (): Promise<AllBiomarkerSummary[]> => {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    // Get unique marker names with their latest reading
    const userId = session.user?.id;
    if (!userId) return [];

    const markers = await prisma.extractedData.groupBy({
      by: ["markerName"],
      where: { userId },
      _count: { markerName: true },
    });

    const summaries = await Promise.all(
      markers.map(async (m) => {
        const latest = await prisma.extractedData.findFirst({
          where: { userId, markerName: m.markerName },
          orderBy: { testDate: "desc" },
          select: { numericValue: true, unit: true, flag: true, testDate: true },
        });

        return {
          markerName: m.markerName,
          latestValue: latest?.numericValue ?? null,
          latestUnit: latest?.unit ?? null,
          latestFlag: latest?.flag ?? null,
          latestDate: latest!.testDate,
          totalReadings: m._count.markerName,
        };
      })
    );

    return summaries.sort((a, b) => a.markerName.localeCompare(b.markerName));
  } catch (error) {
    console.error("DAL Error: Failed to fetch biomarker summaries.", error);
    return [];
  }
});
