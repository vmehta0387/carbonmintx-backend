-- CreateTable
CREATE TABLE "ValidatorApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "accreditationBody" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "experienceYears" TEXT,
    "expertise" TEXT,
    "documentUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminComments" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValidatorApplication_pkey" PRIMARY KEY ("id")
);
