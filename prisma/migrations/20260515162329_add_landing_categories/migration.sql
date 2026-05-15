-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'LANDING_CATEGORY_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'LANDING_CATEGORY_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'LANDING_CATEGORY_DELETED';

-- CreateTable
CREATE TABLE "LandingCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LandingCategory_slug_key" ON "LandingCategory"("slug");

-- CreateIndex
CREATE INDEX "LandingCategory_activo_order_idx" ON "LandingCategory"("activo", "order");
