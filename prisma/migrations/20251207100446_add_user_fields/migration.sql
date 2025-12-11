/*
  Warnings:

  - The values [PENDING] on the enum `ProjectStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `expectedReduction` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `Validation` table. All the data in the column will be lost.
  - Added the required column `mimeType` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `additionalityProof` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbonStandard` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creditingPeriodEnd` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creditingPeriodStart` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedCredits` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `methodology` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectType` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vintageYear` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Validation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('REFORESTATION', 'AFFORESTATION', 'RENEWABLE_ENERGY', 'ENERGY_EFFICIENCY', 'METHANE_CAPTURE', 'SOIL_CARBON', 'BLUE_CARBON', 'COOKSTOVES', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "CarbonStandard" AS ENUM ('VERRA_VCS', 'GOLD_STANDARD', 'CDM', 'CAR', 'ACR', 'PLAN_VIVO');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PROJECT_DESIGN', 'BASELINE_STUDY', 'MONITORING_PLAN', 'ENVIRONMENTAL_IMPACT', 'LAND_RIGHTS', 'STAKEHOLDER_CONSULTATION', 'ADDITIONALITY_PROOF', 'OTHER');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CORRECTIONS_REQUESTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ProjectStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_VALIDATION', 'APPROVED', 'REJECTED', 'REGISTERED', 'MINTED');
ALTER TABLE "Project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "status" TYPE "ProjectStatus_new" USING ("status"::text::"ProjectStatus_new");
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "ProjectStatus_old";
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "type" "DocumentType" NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "expectedReduction",
DROP COLUMN "type",
ADD COLUMN     "additionalityProof" TEXT NOT NULL,
ADD COLUMN     "carbonStandard" "CarbonStandard" NOT NULL,
ADD COLUMN     "creditingPeriodEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creditingPeriodStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "estimatedCredits" INTEGER NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "methodology" TEXT NOT NULL,
ADD COLUMN     "projectType" "ProjectType" NOT NULL,
ADD COLUMN     "vintageYear" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Validation" DROP COLUMN "approved",
ADD COLUMN     "findings" TEXT,
ADD COLUMN     "recommendations" TEXT,
ADD COLUMN     "reportUrl" TEXT,
ADD COLUMN     "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "MonitoringReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reportingPeriod" TEXT NOT NULL,
    "actualReduction" INTEGER NOT NULL,
    "verificationDate" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "documentUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoringReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MonitoringReport" ADD CONSTRAINT "MonitoringReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
