-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "reportType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT;
