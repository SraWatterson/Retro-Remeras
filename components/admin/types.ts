import { Product } from '@/lib/shop';

export type SessionUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  name: string | null;
};

export type ColorImageRow = {
  id: string;
  color: string;
  path: string;
};

export type ProductFormState = {
  legacyId: string;
  slug: string;
  nombre: string;
  categoria: string;
  precio: string;
  imagen: string;
  descripcion: string;
  disponible: boolean;
  destacado: boolean;
  activo: boolean;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormState, string>> & {
  colorImages?: string;
};

export type ProductView = Product;
