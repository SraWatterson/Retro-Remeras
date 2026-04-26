export type Product = {
  id: string;
  legacyId?: number | null;
  slug: string;
  nombre: string;
  categoria: string;
  precio: number;
  imagen?: string | null;
  imagenesPorColor?: Record<string, string>;
  descripcion: string;
  disponible: boolean;
  destacado: boolean;
  activo: boolean;
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

export const CATEGORY_LIST = ['Todos', 'Fútbol', 'Anime', 'Cine / Películas', 'Videojuegos', 'Variados', 'Vintage'];

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
  if (value.startsWith('/')) return value;
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

export function cartGetItemsCount(items: CartItem[]) {
  return items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
}

export function cartGetTotal(items: CartItem[]) {
  return items.reduce((acc, item) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0), 0);
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

  lines.push(`Total estimado: ${formatPrice(cartGetTotal(items))}`);
  lines.push('');
  lines.push('¿Podés confirmar disponibilidad?');

  return lines.join('\n');
}

export function createWhatsAppLink(message: string) {
  return `https://wa.me/5491156592963?text=${encodeURIComponent(message || '')}`;
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
