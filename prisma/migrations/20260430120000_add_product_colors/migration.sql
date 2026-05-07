-- Add new audit actions for color administration.
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'COLOR_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'COLOR_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'COLOR_DEACTIVATED';

-- Color catalog used by the admin product form and public product swatches.
CREATE TABLE IF NOT EXISTS "Color" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Color_slug_key" ON "Color"("slug");
CREATE INDEX IF NOT EXISTS "Color_activo_idx" ON "Color"("activo");

INSERT INTO "Color" ("id", "name", "slug", "hex", "activo", "createdAt", "updatedAt")
VALUES
  ('color_negro_base', 'Negro', 'negro', '#111111', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('color_blanco_base', 'Blanco', 'blanco', '#F2F2F2', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
