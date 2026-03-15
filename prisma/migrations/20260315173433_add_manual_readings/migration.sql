-- CreateTable
CREATE TABLE "ManualReading" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackerId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManualReading_userId_recordedAt_idx" ON "ManualReading"("userId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "ManualReading_trackerId_idx" ON "ManualReading"("trackerId");

-- AddForeignKey
ALTER TABLE "ManualReading" ADD CONSTRAINT "ManualReading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualReading" ADD CONSTRAINT "ManualReading_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "ManualTracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
