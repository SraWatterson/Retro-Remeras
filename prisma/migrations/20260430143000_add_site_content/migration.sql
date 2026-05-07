-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'SITE_CONTENT_UPDATED';

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL DEFAULT 'home',
    "promoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "promoText" TEXT NOT NULL DEFAULT 'LLEVANDO 3 PRODUCTOS TENÉS 5% DE DESCUENTO',
    "promoHref" TEXT,
    "heroEyebrow" TEXT NOT NULL DEFAULT 'Tienda temática · Buenos Aires',
    "heroTitlePrefix" TEXT NOT NULL DEFAULT 'Remeras con',
    "heroTitleAccent" TEXT NOT NULL DEFAULT 'estilo',
    "heroTitleSuffix" TEXT NOT NULL DEFAULT 'nostalgia y personalidad',
    "heroText" TEXT NOT NULL DEFAULT 'En Retro Remeras mezclamos cultura pop, estética vintage y diseños con identidad. Elegí una categoría, encontrá tu estilo y armá tu pedido desde la página de cada producto.',
    "heroPrimaryButtonText" TEXT NOT NULL DEFAULT 'Ver catálogo',
    "heroPrimaryButtonHref" TEXT NOT NULL DEFAULT '/catalogo',
    "heroSecondaryButtonText" TEXT NOT NULL DEFAULT 'Ver carrito',
    "heroSecondaryButtonHref" TEXT NOT NULL DEFAULT '/carrito',
    "heroMainImage" TEXT NOT NULL DEFAULT '/assets/img/ejemplo-vintage.jpg',
    "heroMainImageAlt" TEXT NOT NULL DEFAULT 'Diseño vintage destacado',
    "heroBadgeText" TEXT NOT NULL DEFAULT 'Colecciones con impronta retro',
    "heroSideImageOne" TEXT NOT NULL DEFAULT '/assets/img/remera-goku.jpg',
    "heroSideImageOneAlt" TEXT NOT NULL DEFAULT 'Diseño anime destacado',
    "heroSideImageTwo" TEXT NOT NULL DEFAULT '/assets/img/ejemplo-gaming.jpg',
    "heroSideImageTwoAlt" TEXT NOT NULL DEFAULT 'Diseño videojuegos destacado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- Seed singleton row
INSERT INTO "SiteContent" ("id", "updatedAt")
VALUES ('home', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
