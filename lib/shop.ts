import { ProductColorImage } from '@/lib/colors';

export type SizeGuideTable = {
  columns: string[];
  rows: string[][];
};

export type ProductSizeGuide = {
  regular?: SizeGuideTable;
  oversize?: SizeGuideTable;
};

export type Product = {
  id: string;
  legacyId?: number | null;
  slug: string;
  nombre: string;
  categoria: string;
  precio: number;
  imagen?: string | null;
  imagenesPorColor?: Record<string, ProductColorImage>;
  sizeGuide?: ProductSizeGuide | null;
  descripcion: string;
  disponible: boolean;
  destacado: boolean;
  activo: boolean;
  deletedAt?: string | Date | null;
  deletedById?: string | null;
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  category: string;
  image: string;
  unitPrice: number;
  color: string;
  size: string;
  fit: string;
  fitLabel: string;
  quantity: number;
};

const CART_STORAGE_KEY = 'retro_remeras_cart';
const CART_UPDATED_EVENT = 'retro-cart:updated';

export { CATEGORY_FILTERS as CATEGORY_LIST, PRODUCT_CATEGORIES } from '@/lib/categories';

export function formatPrice(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function normalizeText(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function normalizeImageUrl(value?: string | null) {
  if (!value) return '/assets/img/ejemplo-vintage.jpg';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `/${value.replace(/^\/+/, '')}`;
}

function safeParseCart(rawValue: string | null) {
  try {
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function cartLoad(): CartItem[] {
  if (typeof window === 'undefined') return [];
  return safeParseCart(localStorage.getItem(CART_STORAGE_KEY));
}

export function cartSave(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { items } }));
}

export function cartClear() {
  cartSave([]);
  return [];
}

export const BULK_DISCOUNT_THRESHOLD = 3;
export const BULK_DISCOUNT_RATE = 0.05;

export function cartGetItemsCount(items: CartItem[]) {
  return items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
}

export function cartGetTotal(items: CartItem[]) {
  return items.reduce((acc, item) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0), 0);
}

export function cartGetDiscountAmount(items: CartItem[]) {
  if (cartGetItemsCount(items) < BULK_DISCOUNT_THRESHOLD) return 0;
  return Math.round(cartGetTotal(items) * BULK_DISCOUNT_RATE);
}

export function cartGetFinalTotal(items: CartItem[]) {
  return cartGetTotal(items) - cartGetDiscountAmount(items);
}

export function cartAddItem(items: CartItem[], nextItem: CartItem) {
  const cart = [...items];
  const found = cart.find((entry) => entry.id === nextItem.id);

  if (found) {
    found.quantity += nextItem.quantity || 1;
    return cart;
  }

  cart.push({ ...nextItem, quantity: nextItem.quantity || 1 });
  return cart;
}

export function cartChangeQuantity(items: CartItem[], id: string, delta: number) {
  const cart = [...items];
  const found = cart.find((entry) => entry.id === id);

  if (!found) return cart;

  found.quantity += delta;

  if (found.quantity <= 0) {
    return cart.filter((entry) => entry.id !== id);
  }

  return cart;
}

export function cartRemoveItem(items: CartItem[], id: string) {
  return items.filter((entry) => entry.id !== id);
}

export function cartChangeSize(items: CartItem[], id: string, newSize: string): CartItem[] {
  const item = items.find((entry) => entry.id === id);
  if (!item) return items;

  const suffix = `-${item.size}-${item.fit}`;
  const prefix = `${item.productId}-`;
  const colorSlug = item.id.slice(prefix.length, item.id.length - suffix.length);
  const newId = `${item.productId}-${colorSlug}-${newSize}-${item.fit}`;

  if (newId === id) return items;

  const existing = items.find((entry) => entry.id === newId);
  if (existing) {
    return items
      .map((entry) => entry.id === newId ? { ...entry, quantity: entry.quantity + item.quantity } : entry)
      .filter((entry) => entry.id !== id);
  }

  return items.map((entry) =>
    entry.id === id ? { ...entry, id: newId, size: newSize } : entry
  );
}

export function createCartMessage(items: CartItem[]) {
  if (!items.length) return 'Hola! Quiero consultar por una remera.';

  const lines: string[] = ['Hola! Quiero hacer un pedido:', ''];

  items.forEach((item, index) => {
    lines.push(`${index + 1}) ${item.productName}`);
    lines.push(`Categoría: ${item.category}`);
    lines.push(`Tipo: ${item.fitLabel}`);
    lines.push(`Talle: ${item.size}`);
    lines.push(`Color: ${item.color}`);
    lines.push(`Cantidad: ${item.quantity}`);
    lines.push(`Subtotal ref.: ${formatPrice(item.unitPrice * item.quantity)}`);
    lines.push('');
  });

  const discount = cartGetDiscountAmount(items);
  if (discount > 0) {
    lines.push(`Subtotal: ${formatPrice(cartGetTotal(items))}`);
    lines.push(`Descuento 5% (3+ unidades): -${formatPrice(discount)}`);
    lines.push(`Total estimado: ${formatPrice(cartGetFinalTotal(items))}`);
  } else {
    lines.push(`Total estimado: ${formatPrice(cartGetTotal(items))}`);
  }
  lines.push('');
  lines.push('¿Podés confirmar disponibilidad?');

  return lines.join('\n');
}

export function createWhatsAppLink(message: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5491123620076';
  return `https://wa.me/${number}?text=${encodeURIComponent(message || '')}`;
}

export function subscribeToCartUpdates(callback: (items: CartItem[]) => void) {
  function onStorage(event: StorageEvent) {
    if (event.key && event.key !== CART_STORAGE_KEY) return;
    callback(cartLoad());
  }

  function onCustomUpdate(event: Event) {
    const custom = event as CustomEvent<{ items?: CartItem[] }>;
    callback(custom.detail?.items || cartLoad());
  }

  window.addEventListener('storage', onStorage);
  window.addEventListener(CART_UPDATED_EVENT, onCustomUpdate as EventListener);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CART_UPDATED_EVENT, onCustomUpdate as EventListener);
  };
}
