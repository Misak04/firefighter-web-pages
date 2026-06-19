-- CreateEnum
CREATE TYPE "TechnicsCategory" AS ENUM ('VEHICLE', 'PUMP', 'PERSONAL_GEAR', 'RESCUE_TOOL', 'COMMUNICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "TechnicsStatus" AS ENUM ('ACTIVE', 'RETIRED');

-- CreateTable
CREATE TABLE "Technics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TechnicsCategory" NOT NULL,
    "manufacturer" TEXT,
    "yearAcquired" INTEGER,
    "description" TEXT,
    "specs" JSONB,
    "status" "TechnicsStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicsPhoto" (
    "id" TEXT NOT NULL,
    "technicsId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechnicsPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Technics_category_status_idx" ON "Technics"("category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicsPhoto_mediaId_key" ON "TechnicsPhoto"("mediaId");

-- CreateIndex
CREATE INDEX "TechnicsPhoto_technicsId_sortOrder_idx" ON "TechnicsPhoto"("technicsId", "sortOrder");

-- AddForeignKey
ALTER TABLE "TechnicsPhoto" ADD CONSTRAINT "TechnicsPhoto_technicsId_fkey" FOREIGN KEY ("technicsId") REFERENCES "Technics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicsPhoto" ADD CONSTRAINT "TechnicsPhoto_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
