-- Portada con 4 remeras: cuarta imagen (chica, abajo a la derecha).
ALTER TABLE "SiteContent" ADD COLUMN "heroSideImageThree" TEXT NOT NULL DEFAULT '/assets/img/ejemplo-gaming.webp';
ALTER TABLE "SiteContent" ADD COLUMN "heroSideImageThreeAlt" TEXT NOT NULL DEFAULT 'Diseño destacado';
