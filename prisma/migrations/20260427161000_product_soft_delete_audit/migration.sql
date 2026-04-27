-- Adds audit fields for product soft deletes.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deletedById" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Product_deletedById_fkey'
  ) THEN
    ALTER TABLE "Product"
    ADD CONSTRAINT "Product_deletedById_fkey"
    FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Product_activo_disponible_destacado_idx" ON "Product"("activo", "disponible", "destacado");
CREATE INDEX IF NOT EXISTS "Product_categoria_idx" ON "Product"("categoria");
CREATE INDEX IF NOT EXISTS "Product_deletedAt_idx" ON "Product"("deletedAt");
