-- CreateTable
CREATE TABLE "CreditBatch" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "verifiedTonnes" INTEGER NOT NULL,
    "vintageYear" INTEGER NOT NULL,
    "methodology" TEXT NOT NULL,
    "metadataUri" TEXT NOT NULL,
    "calculationInputs" JSONB NOT NULL,
    "calculationSummary" JSONB NOT NULL,
    "monitoringPeriod" JSONB NOT NULL,
    "evidence" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'MINTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditBatch_projectId_vintageYear_key" ON "CreditBatch"("projectId", "vintageYear");

-- AddForeignKey
ALTER TABLE "CreditBatch" ADD CONSTRAINT "CreditBatch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
