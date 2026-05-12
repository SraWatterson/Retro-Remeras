import { ProductColorOption } from '@/lib/colors';
import { Product, ProductSizeGuide } from '@/lib/shop';

export type SessionUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  name: string | null;
};

export type ColorImageRow = {
  id: string;
  colorSlug: string;
  colorName: string;
  colorHex: string;
  path: string;
};

export type ColorDraft = {
  name: string;
  hex: string;
};

export type ProductFormState = {
  legacyId: number | '';
  slug: string;
  nombre: string;
  categoria: string;
  precio: string;
  imagen: string;
  sizeGuide: ProductSizeGuide;
  descripcion: string;
  disponible: boolean;
  destacado: boolean;
  activo: boolean;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormState, string>> & {
  colorImages?: string;
  sizeGuide?: string;
};

export type PaginatedProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type ProductView = Product;
export type AdminColorOption = ProductColorOption;


export type SiteContentFormState = {
  promoEnabled: boolean;
  promoText: string;
  promoHref: string;
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
};

export type SiteContentErrors = Partial<Record<keyof SiteContentFormState, string>>;
