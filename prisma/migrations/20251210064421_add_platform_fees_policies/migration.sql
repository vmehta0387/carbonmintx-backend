-- AlterTable
ALTER TABLE "UserPolicies" ADD COLUMN     "feesAcknowledgment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platformFees" BOOLEAN NOT NULL DEFAULT false;
