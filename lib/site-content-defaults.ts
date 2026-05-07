export type SiteContentData = {
  id: string;
  promoEnabled: boolean;
  promoText: string;
  promoHref: string | null;
  heroEyebrow: string;
  heroTitlePrefix: string;
  heroTitleAccent: string;
  heroTitleSuffix: string;
  heroText: string;
  heroPrimaryButtonText: string;
  heroPrimaryButtonHref: string;
  heroSecondaryButtonText: string;
  heroSecondaryButtonHref: string;
  heroMainImage: string;
  heroMainImageAlt: string;
  heroBadgeText: string;
  heroSideImageOne: string;
  heroSideImageOneAlt: string;
  heroSideImageTwo: string;
  heroSideImageTwoAlt: string;
  updatedAt?: Date | string;
};

export const DEFAULT_SITE_CONTENT: SiteContentData = {
  id: 'home',
  promoEnabled: true,
  promoText: 'LLEVANDO 3 PRODUCTOS TENÉS 5% DE DESCUENTO',
  promoHref: null,
  heroEyebrow: 'Tienda temática · Buenos Aires',
  heroTitlePrefix: 'Remeras con',
  heroTitleAccent: 'estilo',
  heroTitleSuffix: 'nostalgia y personalidad',
  heroText:
    'En Retro Remeras mezclamos cultura pop, estética vintage y diseños con identidad. Elegí una categoría, encontrá tu estilo y armá tu pedido desde la página de cada producto.',
  heroPrimaryButtonText: 'Ver catálogo',
  heroPrimaryButtonHref: '/catalogo',
  heroSecondaryButtonText: 'Ver carrito',
  heroSecondaryButtonHref: '/carrito',
  heroMainImage: '/assets/img/ejemplo-vintage.jpg',
  heroMainImageAlt: 'Diseño vintage destacado',
  heroBadgeText: 'Colecciones con impronta retro',
  heroSideImageOne: '/assets/img/remera-goku.jpg',
  heroSideImageOneAlt: 'Diseño anime destacado',
  heroSideImageTwo: '/assets/img/ejemplo-gaming.jpg',
  heroSideImageTwoAlt: 'Diseño videojuegos destacado',
};

export function mergeSiteContent(content: Partial<SiteContentData> | null | undefined): SiteContentData {
  return {
    ...DEFAULT_SITE_CONTENT,
    ...(content || {}),
    id: content?.id || 'home',
    promoHref: content?.promoHref || null,
  };
}
