-- Categorías adicionales: una remera puede aparecer también en otras colecciones
-- (ej. un programa de TV argentino aparece en "Cine" y en "Argentina").
ALTER TABLE "Product" ADD COLUMN "categoriasExtra" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
