/*
  Warnings:

  - You are about to drop the column `company` on the `ValidatorApplication` table. All the data in the column will be lost.
  - You are about to drop the column `expertise` on the `ValidatorApplication` table. All the data in the column will be lost.
  - Added the required column `organizationName` to the `ValidatorApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ValidatorApplication" DROP COLUMN "company",
DROP COLUMN "expertise",
ADD COLUMN     "organizationName" TEXT NOT NULL,
ADD COLUMN     "walletAddress" TEXT;
