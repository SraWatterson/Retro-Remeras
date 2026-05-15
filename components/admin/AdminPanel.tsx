'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeColorSlug, uniqueColorOptions, ProductColorOption } from '@/lib/colors';
import { Product, ProductSizeGuide, SizeGuideTable } from '@/lib/shop';
import { CategoryManager } from './CategoryManager';
import { LandingCategoryManager, type LandingCategoryItem } from './LandingCategoryManager';
import { AuditLogPanel } from './AuditLogPanel';
import { AdminSessionBar } from './AdminSessionBar';
import { ProductEditorForm } from './ProductEditorForm';
import { SalesPageEditor } from './SalesPageEditor';
import { SiteContentEditor } from './SiteContentEditor';
import { ProductSortOption, ProductStatusFilter, ProductTable } from './ProductTable';
import { ColorDraft, ColorImageRow, ProductFormErrors, ProductFormState, SessionUser, SiteContentErrors, SiteContentFormState } from './types';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_REFRESH_INTERVAL_MS = 90 * 60 * 1000;

type AdminToast = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};

type AdminSection = 'products' | 'categories' | 'landing-categories' | 'visual-content' | 'personalizados' | 'mayorista' | 'audit' | 'product-form';

const EMPTY_COLOR_DRAFT: ColorDraft = { name: '', hex: '#59F7FF' };

const DEFAULT_SIZE_GUIDE_FORM: ProductSizeGuide = {
  regular: {
    columns: ['Talle', 'Ancho', 'Largo'],
    rows: [
      ['XS', '46 cm', '66 cm'],
      ['S', '48 cm', '68 cm'],
      ['M', '51 cm', '70 cm'],
      ['L', '54 cm', '72 cm'],
      ['XL', '57 cm', '74 cm'],
      ['XXL', '60 cm', '76 cm'],
    ],
  },
  oversize: {
    columns: ['Talle', 'Ancho', 'Largo'],
    rows: [
      ['M', '56 cm', '72 cm'],
      ['L', '59 cm', '74 cm'],
      ['XL', '62 cm', '76 cm'],
      ['XXL', '65 cm', '78 cm'],
    ],
  },
};

function cloneSizeGuideTable(table?: SizeGuideTable): SizeGuideTable {
  const columns = table?.columns?.length ? table.columns.map((column) => column || '') : ['Talle', 'Ancho', 'Largo'];
  const rows = table?.rows?.length
    ? table.rows.map((row) => {
        const normalized = row.slice(0, columns.length).map((cell) => cell || '');
        while (normalized.length < columns.length) normalized.push('');
        return normalized;
      })
    : [];

  return { columns, rows };
}

function cloneSizeGuide(guide?: ProductSizeGuide | null): ProductSizeGuide {
  return {
    regular: cloneSizeGuideTable(guide?.regular || DEFAULT_SIZE_GUIDE_FORM.regular),
    oversize: cloneSizeGuideTable(guide?.oversize || DEFAULT_SIZE_GUIDE_FORM.oversize),
  };
}

function sanitizeSizeGuideTable(table?: SizeGuideTable): SizeGuideTable | undefined {
  if (!table) return undefined;

  const columns = (table.columns || [])
    .map((column) => String(column || '').trim())
    .filter(Boolean)
    .slice(0, 8);

  if (!columns.length) return undefined;

  const rows = (table.rows || [])
    .map((row) => {
      const normalized = row.slice(0, columns.length).map((cell) => String(cell || '').trim());
      while (normalized.length < columns.length) normalized.push('');
      return normalized;
    })
    .filter((row) => row.some(Boolean))
    .slice(0, 24);

  return { columns, rows };
}

function sanitizeSizeGuide(guide: ProductSizeGuide): ProductSizeGuide {
  return {
    regular: sanitizeSizeGuideTable(guide.regular),
    oversize: sanitizeSizeGuideTable(guide.oversize),
  };
}


const EMPTY_FORM: ProductFormState = {
  legacyId: '',
  slug: '',
  nombre: '',
  categoria: '',
  precio: '',
  imagen: '',
  sizeGuide: cloneSizeGuide(DEFAULT_SIZE_GUIDE_FORM),
  descripcion: '',
  disponible: true,
  destacado: false,
  activo: true,
};

const EMPTY_SITE_CONTENT_FORM: SiteContentFormState = {
  promoEnabled: true,
  promoText: 'LLEVANDO 3 PRODUCTOS TENÉS 5% DE DESCUENTO',
  promoHref: '',
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

type SiteImageField = 'heroMainImage' | 'heroSideImageOne' | 'heroSideImageTwo';


function newColorRow(initial?: Partial<ColorImageRow>): ColorImageRow {
  return {
    id: crypto.randomUUID(),
    colorSlug: initial?.colorSlug || '',
    colorName: initial?.colorName || '',
    colorHex: initial?.colorHex || '#111111',
    path: initial?.path || '',
  };
}

function colorRowsToRecord(rows: ColorImageRow[]) {
  const record: Record<string, { colorSlug: string; colorName: string; colorHex: string; path: string }> = {};

  rows.forEach((row) => {
    const colorSlug = normalizeColorSlug(row.colorSlug || row.colorName);
    const colorName = row.colorName.trim();
    const colorHex = row.colorHex.trim();
    const path = row.path.trim();

    if (colorSlug && colorName && colorHex && path) {
      record[colorSlug] = { colorSlug, colorName, colorHex, path };
    }
  });

  return record;
}

function normalizeCategoryInput(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function slugifyProductName(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}


function normalizeSiteContentResponse(data: Partial<SiteContentFormState> | null | undefined): SiteContentFormState {
  return {
    ...EMPTY_SITE_CONTENT_FORM,
    ...(data || {}),
    promoHref: data?.promoHref || '',
  };
}

function validateSiteContentInput(values: SiteContentFormState) {
  const errors: SiteContentErrors = {};
  const requiredFields: Array<keyof SiteContentFormState> = [
    'promoText',
    'heroEyebrow',
    'heroTitlePrefix',
    'heroTitleAccent',
    'heroTitleSuffix',
    'heroText',
    'heroPrimaryButtonText',
    'heroPrimaryButtonHref',
    'heroSecondaryButtonText',
    'heroSecondaryButtonHref',
    'heroMainImage',
    'heroMainImageAlt',
    'heroBadgeText',
    'heroSideImageOne',
    'heroSideImageOneAlt',
    'heroSideImageTwo',
    'heroSideImageTwoAlt',
  ];

  requiredFields.forEach((field) => {
    const value = String(values[field] || '').trim();
    if (value.length < 2) errors[field] = 'Campo requerido.';
  });

  const linkFields: Array<keyof SiteContentFormState> = ['promoHref', 'heroPrimaryButtonHref', 'heroSecondaryButtonHref'];
  linkFields.forEach((field) => {
    const value = String(values[field] || '').trim();
    if (value && !value.startsWith('/') && !value.startsWith('#') && !value.startsWith('https://') && !value.startsWith('http://')) {
      errors[field] = 'Usá un link interno, ancla o URL válida.';
    }
  });

  const imageFields: Array<keyof SiteContentFormState> = ['heroMainImage', 'heroSideImageOne', 'heroSideImageTwo'];
  imageFields.forEach((field) => {
    const value = String(values[field] || '').trim();
    const valid = value.startsWith('/assets/') || value.startsWith('/uploads/home/') || value.startsWith('/uploads/products/') || value.startsWith('https://') || value.startsWith('http://');
    if (!valid) errors[field] = 'Usá una ruta pública de imagen válida.';
  });

  return errors;
}

function validateProductInput(values: ProductFormState, colorRows: ColorImageRow[]) {
  const errors: ProductFormErrors = {};

  const slug = values.slug.trim() || slugifyProductName(values.nombre);
  if (slug.length < 2 || !/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Slug inválido. Usar minúsculas, números y guiones.';
  }

  if (values.nombre.trim().length < 2) {
    errors.nombre = 'Nombre requerido (mínimo 2 caracteres).';
  }

  const categoria = normalizeCategoryInput(values.categoria);
  if (categoria.length < 2) {
    errors.categoria = 'Categoría requerida (mínimo 2 caracteres).';
  } else if (categoria.length > 60) {
    errors.categoria = 'La categoría no puede superar los 60 caracteres.';
  }

  const precio = Number(values.precio);
  if (!Number.isInteger(precio) || precio < 0) {
    errors.precio = 'Precio inválido (entero mayor o igual a 0).';
  }

  if (!values.imagen.trim()) {
    errors.imagen = 'Debes subir o seleccionar una imagen principal.';
  }

  if (values.descripcion.trim().length < 3) {
    errors.descripcion = 'Descripción requerida (mínimo 3 caracteres).';
  }

  if (values.legacyId !== '' && (!Number.isInteger(values.legacyId) || values.legacyId <= 0)) {
    errors.legacyId = 'Legacy ID debe ser entero positivo.';
  }

  const invalidRow = colorRows.some((row) => {
    const hasColor = Boolean(normalizeColorSlug(row.colorSlug || row.colorName));
    const hasPath = Boolean(row.path.trim());
    return hasColor !== hasPath;
  });

  if (invalidRow) {
    errors.colorImages = 'Cada fila de color debe tener color e imagen.';
  }

  const sizeGuide = sanitizeSizeGuide(values.sizeGuide);
  const hasInvalidTable = (['regular', 'oversize'] as const).some((fit) => {
    const table = sizeGuide[fit];
    return Boolean(table && table.columns.some((column) => !column.trim()));
  });

  if (hasInvalidTable) {
    errors.sizeGuide = 'Cada columna visible debe tener un nombre.';
  }

  return errors;
}

function toPayload(values: ProductFormState, colorRows: ColorImageRow[]) {
  const payload: Record<string, unknown> = {
    slug: values.slug.trim() || slugifyProductName(values.nombre),
    nombre: values.nombre.trim(),
    categoria: normalizeCategoryInput(values.categoria),
    precio: Number(values.precio),
    imagen: values.imagen.trim(),
    imagenesPorColor: colorRowsToRecord(colorRows),
    sizeGuide: sanitizeSizeGuide(values.sizeGuide),
    descripcion: values.descripcion.trim(),
    disponible: values.disponible,
    destacado: values.destacado,
    activo: values.activo,
  };

  if (values.legacyId !== '') {
    payload.legacyId = values.legacyId;
  }

  return payload;
}

function fromProduct(product: Product) {
  const rows = Object.entries(product.imagenesPorColor || {}).map(([colorSlug, data]) =>
    newColorRow({
      colorSlug: data.colorSlug || colorSlug,
      colorName: data.colorName,
      colorHex: data.colorHex,
      path: data.path,
    })
  );

  return {
    form: {
      legacyId: product.legacyId || '',
      slug: product.slug,
      nombre: product.nombre,
      categoria: product.categoria,
      precio: String(product.precio),
      imagen: product.imagen || '',
      sizeGuide: cloneSizeGuide(product.sizeGuide),
      descripcion: product.descripcion,
      disponible: Boolean(product.disponible),
      destacado: Boolean(product.destacado),
      activo: Boolean(product.activo),
    } satisfies ProductFormState,
    colorRows: rows.length ? rows : [newColorRow()],
  };
}

export function AdminPanel() {
  const router = useRouter();
  const [loadingSession, setLoadingSession] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<ProductColorOption[]>([]);
  const [colorDraft, setColorDraft] = useState<ColorDraft>(EMPTY_COLOR_DRAFT);
  const [colorSaving, setColorSaving] = useState(false);
  const [colorError, setColorError] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStatus, setProductStatus] = useState<ProductStatusFilter>('all');
  const [productSort, setProductSort] = useState<ProductSortOption>('featured');
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(20);
  const [productTotal, setProductTotal] = useState(0);
  const [productPages, setProductPages] = useState(1);
  const [requestError, setRequestError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContentFormState>(EMPTY_SITE_CONTENT_FORM);
  const [siteContentErrors, setSiteContentErrors] = useState<SiteContentErrors>({});
  const [siteContentLoading, setSiteContentLoading] = useState(false);
  const [siteContentSaving, setSiteContentSaving] = useState(false);
  const [landingCategories, setLandingCategories] = useState<LandingCategoryItem[]>([]);
  const [landingCatsLoading, setLandingCatsLoading] = useState(false);

  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [colorRows, setColorRows] = useState<ColorImageRow[]>([newColorRow()]);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<AdminToast | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('products');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canManage = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const canDelete = user?.role === 'ADMIN';
  const formTitle = useMemo(() => (editingId ? 'Editar producto' : 'Crear producto'), [editingId]);

  const showToast = useCallback((type: AdminToast['type'], message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ id: crypto.randomUUID(), type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4200);
  }, []);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setColorRows([newColorRow()]);
    setFormErrors({});
    setRequestError('');
  }, []);

  const openNewProductForm = useCallback(() => {
    resetForm();
    setActiveSection('product-form');
  }, [resetForm]);

  const closeProductForm = useCallback(() => {
    resetForm();
    setActiveSection('products');
  }, [resetForm]);

  const performLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setUser(null);
    setProducts([]);
    resetForm();
    router.replace('/login');
  }, [resetForm, router]);

  const refreshSessionTimer = useCallback(() => {
    if (!user) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void performLogout();
    }, SESSION_TIMEOUT_MS);
  }, [performLogout, user]);

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!loadingSession && !user) {
      router.replace('/login');
    }
  }, [loadingSession, router, user]);

  useEffect(() => {
    if (canManage) {
      void loadProducts(productPage, productQuery, productCategory, productStatus, productSort, productLimit);
      void loadCategories();
      void loadColors();
      void loadSiteContent();
      void loadLandingCategories();
    }
  }, [canManage, productPage, productQuery, productCategory, productStatus, productSort, productLimit]);

  useEffect(() => {
    if (!user) return;

    const refreshInterval = window.setInterval(() => {
      void renewSession();
    }, SESSION_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(refreshInterval);
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const onActivity = () => refreshSessionTimer();

    refreshSessionTimer();
    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [refreshSessionTimer, user]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  async function loadSession() {
    setLoadingSession(true);
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = await response.json();
      setUser(data.user || null);
    } finally {
      setLoadingSession(false);
    }
  }

  async function renewSession() {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST', cache: 'no-store' });
      if (!response.ok) {
        await performLogout();
        return;
      }

      const data = await response.json();
      if (data?.user) {
        setUser(data.user);
      }
    } catch {
      await performLogout();
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories?includeInactive=true', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setCategories(Array.isArray(data.items) ? data.items : []);
    } catch {
      setCategories([]);
    }
  }

  async function loadColors() {
    try {
      const response = await fetch('/api/colors', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setColors(uniqueColorOptions(Array.isArray(data.items) ? data.items : []));
    } catch {
      setColors(uniqueColorOptions([]));
    }
  }



  async function loadLandingCategories() {
    setLandingCatsLoading(true);
    try {
      const res = await fetch('/api/landing-categories');
      if (res.ok) {
        const data = await res.json() as LandingCategoryItem[];
        setLandingCategories(data);
      }
    } finally {
      setLandingCatsLoading(false);
    }
  }

  async function loadSiteContent() {
    setSiteContentLoading(true);
    setRequestError('');

    try {
      const response = await fetch('/api/site-content', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || 'No se pudo cargar contenido visual.';
        setRequestError(message);
        showToast('error', message);
        return;
      }

      setSiteContent(normalizeSiteContentResponse(data));
      setSiteContentErrors({});
    } catch {
      const message = 'No se pudo cargar contenido visual.';
      setRequestError(message);
      showToast('error', message);
    } finally {
      setSiteContentLoading(false);
    }
  }

  async function loadProducts(
    page = productPage,
    query = productQuery,
    category = productCategory,
    status = productStatus,
    sort = productSort,
    limit = productLimit
  ) {
    setLoadingProducts(true);
    setRequestError('');
    try {
      const params = new URLSearchParams({
        includeInactive: 'true',
        page: String(page),
        limit: String(limit),
        status,
        sort,
      });

      if (category.trim()) {
        params.set('category', category.trim());
      }

      if (query.trim()) {
        params.set('search', query.trim());
      }

      const response = await fetch('/api/products?' + params.toString(), { cache: 'no-store' });
      const data = await response.json();
      const items = Array.isArray(data) ? data : data?.items;

      if (!response.ok || !Array.isArray(items)) {
        const message = data?.error || 'No se pudieron cargar productos.';
        setRequestError(message);
        showToast('error', message);
        return;
      }

      setProducts(items);
      setProductTotal(Number(data?.total) || items.length);
      setProductPages(Number(data?.pages) || 1);
    } catch {
      const message = 'No se pudieron cargar productos.';
      setRequestError(message);
      showToast('error', message);
    } finally {
      setLoadingProducts(false);
    }
  }


  function editProduct(product: Product) {
    const mapped = fromProduct(product);
    setEditingId(product.id);
    setForm(mapped.form);
    setColorRows(mapped.colorRows);
    setFormErrors({});
    setRequestError('');
    setActiveSection('product-form');
    showToast('info', `Editando ${product.nombre}.`);
  }

  async function uploadFile(file: File, context: 'products' | 'home' = 'products') {
    const body = new FormData();
    body.append('file', file);
    body.append('context', context);

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'No se pudo subir la imagen.');
    }

    return String(data.path || '');
  }

  async function removeUploadedFile(path: string) {
    if (!path.startsWith('/uploads/products/') && !path.startsWith('/uploads/home/')) return;

    await fetch('/api/uploads', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
  }

  async function handleMainImageUpload(file: File | null) {
    if (!file) return;

    setUploading(true);
    setRequestError('');

    try {
      const newPath = await uploadFile(file);
      const oldPath = form.imagen;
      setForm((prev) => ({ ...prev, imagen: newPath }));
      if (oldPath) await removeUploadedFile(oldPath);
      showToast('success', 'Imagen principal actualizada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo subir imagen.';
      setRequestError(message);
      showToast('error', message);
    } finally {
      setUploading(false);
    }
  }

  async function handleColorImageUpload(rowId: string, file: File | null) {
    if (!file) return;

    setUploading(true);
    setRequestError('');

    try {
      const newPath = await uploadFile(file);
      const oldPath = colorRows.find((row) => row.id === rowId)?.path || '';

      setColorRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, path: newPath } : row)));

      if (oldPath) await removeUploadedFile(oldPath);
      showToast('success', 'Imagen de color actualizada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo subir imagen de color.';
      setRequestError(message);
      showToast('error', message);
    } finally {
      setUploading(false);
    }
  }

  async function clearMainImage(removeFile: boolean) {
    if (removeFile && form.imagen) await removeUploadedFile(form.imagen);
    setForm((prev) => ({ ...prev, imagen: '' }));
    showToast('info', removeFile ? 'Imagen principal eliminada.' : 'Imagen principal quitada del producto.');
  }

  async function clearColorImage(rowId: string, removeFile: boolean) {
    const target = colorRows.find((row) => row.id === rowId);
    if (!target) return;

    if (removeFile && target.path) await removeUploadedFile(target.path);

    setColorRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, path: '' } : row)));
    showToast('info', removeFile ? 'Imagen de color eliminada.' : 'Imagen de color quitada.');
  }



  async function handleSiteImageUpload(field: SiteImageField, file: File | null) {
    if (!file) return;

    setUploading(true);
    setRequestError('');

    try {
      const newPath = await uploadFile(file, 'home');
      const oldPath = String(siteContent[field] || '');
      setSiteContent((prev) => ({ ...prev, [field]: newPath }));
      if (oldPath.startsWith('/uploads/home/')) await removeUploadedFile(oldPath);
      showToast('success', 'Imagen del hero actualizada. Guardá el contenido para publicarla.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo subir imagen del hero.';
      setRequestError(message);
      showToast('error', message);
    } finally {
      setUploading(false);
    }
  }

  async function clearSiteImage(field: SiteImageField, removeFile: boolean) {
    const currentPath = String(siteContent[field] || '');
    if (removeFile && currentPath.startsWith('/uploads/home/')) await removeUploadedFile(currentPath);
    setSiteContent((prev) => ({ ...prev, [field]: '' }));
    showToast('info', removeFile ? 'Imagen del hero eliminada.' : 'Imagen del hero quitada.');
  }

  async function saveSiteContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateSiteContentInput(siteContent);
    setSiteContentErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast('error', 'Revisá el contenido visual antes de guardar.');
      return;
    }

    setSiteContentSaving(true);
    setRequestError('');

    try {
      const payload = {
        ...siteContent,
        promoHref: siteContent.promoHref.trim() || null,
      };

      const response = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || 'No se pudo guardar contenido visual.';
        setRequestError(message);
        showToast('error', message);
        return;
      }

      setSiteContent(normalizeSiteContentResponse(data));
      setSiteContentErrors({});
      showToast('success', 'Contenido visual actualizado correctamente.');
    } catch {
      const message = 'No se pudo guardar contenido visual.';
      setRequestError(message);
      showToast('error', message);
    } finally {
      setSiteContentSaving(false);
    }
  }

  function patchColorRowFromSlug(rowId: string, colorSlug: string) {
    const selected = uniqueColorOptions(colors).find((color) => color.slug === colorSlug);
    if (!selected) return;

    setColorRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, colorSlug: selected.slug, colorName: selected.name, colorHex: selected.hex }
          : row
      )
    );
  }

  async function deleteCustomColor(color: ProductColorOption) {
    if (!color.canDelete) {
      showToast('error', 'Los colores base no se pueden eliminar.');
      return;
    }

    const confirmed = window.confirm('¿Eliminar definitivamente el color ' + color.name + '? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    setColorSaving(true);
    setColorError('');

    try {
      const response = await fetch('/api/colors?slug=' + encodeURIComponent(color.slug), {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        const productNames = Array.isArray(data?.products)
          ? data.products.map((product: { nombre?: string }) => product.nombre).filter(Boolean).join(', ')
          : '';
        const message = productNames ? (data?.error || 'No se pudo eliminar el color.') + ' Productos: ' + productNames + '.' : data?.error || 'No se pudo eliminar el color.';
        setColorError(message);
        showToast('error', message);
        return;
      }

      setColors((prev) => uniqueColorOptions(prev.filter((item) => item.slug !== color.slug)));
      setColorRows((prev) =>
        prev.map((row) =>
          row.colorSlug === color.slug
            ? { ...row, colorSlug: '', colorName: '', colorHex: '#111111' }
            : row
        )
      );
      showToast('success', 'Color eliminado: ' + color.name + '.');
    } catch {
      const message = 'No se pudo eliminar el color.';
      setColorError(message);
      showToast('error', message);
    } finally {
      setColorSaving(false);
    }
  }

  async function createColorFromDraft() {
    const name = colorDraft.name.trim();
    const hex = colorDraft.hex.trim();

    if (name.length < 2) {
      setColorError('Ingresá un nombre de color válido.');
      return;
    }

    setColorSaving(true);
    setColorError('');

    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hex }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || 'No se pudo crear el color.';
        setColorError(message);
        showToast('error', message);
        return;
      }

      const nextColors = uniqueColorOptions([...colors, data]);
      setColors(nextColors);
      setColorDraft(EMPTY_COLOR_DRAFT);
      showToast('success', 'Color creado: ' + data.name + '.');
    } catch {
      const message = 'No se pudo crear el color.';
      setColorError(message);
      showToast('error', message);
    } finally {
      setColorSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateProductInput(form, colorRows);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast('error', 'Revisá los campos marcados antes de guardar.');
      return;
    }

    setSaving(true);
    setRequestError('');

    try {
      const payload = toPayload(form, colorRows);
      const endpoint = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || 'No se pudo guardar el producto.';
        setRequestError(message);
        showToast('error', message);
        return;
      }

      showToast('success', editingId ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      resetForm();
      setActiveSection('products');
      await Promise.all([
        loadProducts(productPage, productQuery, productCategory, productStatus, productSort, productLimit),
        loadCategories(),
      ]);
    } catch {
      const message = 'No se pudo guardar el producto.';
      setRequestError(message);
      showToast('error', message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm('¿Desactivar producto? El producto dejará de mostrarse en el sitio, pero seguirá disponible en el admin.')) return;

    const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      const message = data?.error || 'No se pudo desactivar el producto.';
      setRequestError(message);
      showToast('error', message);
      return;
    }

    showToast('success', 'Producto desactivado correctamente.');
    await loadProducts(productPage, productQuery, productCategory, productStatus, productSort, productLimit);
  }

  async function hardDeleteProduct(product: Product) {
    const confirmed = confirm(
      `¿Eliminar definitivamente "${product.nombre}"?

Esta acción borra el producto de la base de datos y no se puede deshacer.`
    );

    if (!confirmed) return;

    const response = await fetch(`/api/products/${product.id}?hard=true`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      const message = data?.error || 'No se pudo eliminar definitivamente el producto.';
      setRequestError(message);
      showToast('error', message);
      return;
    }

    if (editingId === product.id) {
      resetForm();
      setActiveSection('products');
    }

    showToast('success', 'Producto eliminado definitivamente.');
    await Promise.all([
      loadProducts(productPage, productQuery, productCategory, productStatus, productSort, productLimit),
      loadCategories(),
    ]);
  }

  async function renameCategory(from: string, to: string) {
    const response = await fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error || 'No se pudo editar la categoría.';
      setRequestError(message);
      showToast('error', message);
      return;
    }

    if (productCategory === from) {
      setProductCategory(to);
      setProductPage(1);
    }

    if (form.categoria === from) {
      setForm((prev) => ({ ...prev, categoria: to }));
    }

    showToast('success', `Categoría actualizada: ${from} → ${to}.`);
    await Promise.all([
      loadProducts(1, productQuery, productCategory === from ? to : productCategory, productStatus, productSort, productLimit),
      loadCategories(),
    ]);
  }

  async function deleteCategory(category: string) {
    const response = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error || 'No se pudo eliminar la categoría.';
      setRequestError(message);
      showToast('error', message);
      return;
    }

    if (productCategory === category) {
      setProductCategory('');
      setProductPage(1);
    }

    if (form.categoria === category) {
      setForm((prev) => ({ ...prev, categoria: data?.movedTo || 'Variados' }));
    }

    showToast('success', `Categoría eliminada. ${data?.updated || 0} producto(s) movido(s) a ${data?.movedTo || 'Variados'}.`);
    await Promise.all([
      loadProducts(1, productQuery, productCategory === category ? '' : productCategory, productStatus, productSort, productLimit),
      loadCategories(),
    ]);
  }

  return (
    <main className="admin-main">
      {toast ? (
        <div className={`admin-toast admin-toast--${toast.type}`} role="status" aria-live="polite">
          <span className="admin-toast-dot" aria-hidden="true" />
          <p>{toast.message}</p>
          <button type="button" aria-label="Cerrar notificación" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}

      <section className="container admin-shell">
        <div className="section-header">
          <span className="section-kicker">Administración</span>
        </div>

        {loadingSession || !user ? (
          <div className="panel admin-session-skeleton" aria-label={loadingSession ? 'Cargando sesión' : 'Redirigiendo al login'} />
        ) : !canManage ? (
          <section className="panel">
            <p>Tu rol actual no puede gestionar productos.</p>
            <button className="btn btn-secondary" type="button" onClick={() => void performLogout()}>
              Cerrar sesión
            </button>
          </section>
        ) : (
          <>
            <AdminSessionBar
              user={user}
              timeoutMinutes={Math.floor(SESSION_TIMEOUT_MS / 60000)}
              onLogout={() => void performLogout()}
            />

            <section className="panel admin-dashboard" aria-label="Panel de administración">
              <div className="admin-dashboard-head">
                <div>
                  <span className="admin-panel-eyebrow">Panel</span>
                  <h1>Gestión del sitio</h1>
                  <p className="admin-muted">Administrá productos, categorías e historial sin depender de una página extensa.</p>
                </div>

                <button className="btn btn-primary admin-new-product-btn" type="button" onClick={openNewProductForm}>
                  + Nuevo producto
                </button>
              </div>

              <nav className="admin-section-tabs" aria-label="Secciones del panel">
                <button
                  type="button"
                  className={`admin-section-tab ${activeSection === 'products' ? 'is-active' : ''}`}
                  onClick={() => setActiveSection('products')}
                  aria-pressed={activeSection === 'products'}
                >
                  Productos
                </button>
                <button
                  type="button"
                  className={`admin-section-tab ${activeSection === 'categories' ? 'is-active' : ''}`}
                  onClick={() => setActiveSection('categories')}
                  aria-pressed={activeSection === 'categories'}
                >
                  Categorías
                </button>
                <button
                  type="button"
                  className={`admin-section-tab ${activeSection === 'landing-categories' ? 'is-active' : ''}`}
                  onClick={() => setActiveSection('landing-categories')}
                  aria-pressed={activeSection === 'landing-categories'}
                >
                  Cards landing
                </button>
                <button
                  type="button"
                  className={`admin-section-tab ${activeSection === 'visual-content' ? 'is-active' : ''}`}
                  onClick={() => setActiveSection('visual-content')}
                  aria-pressed={activeSection === 'visual-content'}
                >
                  Contenido visual
                </button>
                <button
                  type="button"
                  className={`admin-section-tab ${activeSection === 'personalizados' ? 'is-active' : ''}`}
                  onClick={() => setActiveSection('personalizados')}
                  aria-pressed={activeSection === 'personalizados'}
                >
                  Personalizados
                </button>
                <button
                  type="button"
                  className={`admin-section-tab ${activeSection === 'mayorista' ? 'is-active' : ''}`}
                  onClick={() => setActiveSection('mayorista')}
                  aria-pressed={activeSection === 'mayorista'}
                >
                  Mayorista
                </button>
                <button
                  type="button"
                  className={`admin-section-tab ${activeSection === 'audit' ? 'is-active' : ''}`}
                  onClick={() => setActiveSection('audit')}
                  aria-pressed={activeSection === 'audit'}
                >
                  Auditoría
                </button>
                {activeSection === 'product-form' ? (
                  <button
                    type="button"
                    className="admin-section-tab is-active"
                    onClick={() => setActiveSection('product-form')}
                    aria-pressed="true"
                  >
                    {editingId ? 'Editar producto' : 'Nuevo producto'}
                  </button>
                ) : null}
              </nav>
            </section>

            <div className="admin-section-content">
              {activeSection === 'product-form' ? (
                <ProductEditorForm
                  title={formTitle}
                  editing={Boolean(editingId)}
                  form={form}
                  colorRows={colorRows}
                  errors={formErrors}
                  colors={uniqueColorOptions(colors)}
                  colorDraft={colorDraft}
                  colorSaving={colorSaving}
                  colorError={colorError}
                  requestError={requestError}
                  saving={saving}
                  uploading={uploading}
                  onSubmit={handleSubmit}
                  onReset={closeProductForm}
                  onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                  onMainUpload={(file) => void handleMainImageUpload(file)}
                  onMainDetach={() => void clearMainImage(false)}
                  onMainDeleteFile={() => void clearMainImage(true)}
                  onColorRowChange={(rowId, patch) => {
                    if (patch.colorSlug) {
                      patchColorRowFromSlug(rowId, patch.colorSlug);
                      return;
                    }

                    setColorRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
                  }}
                  onColorUpload={(rowId, file) => void handleColorImageUpload(rowId, file)}
                  onColorDetach={(rowId) => void clearColorImage(rowId, false)}
                  onColorDeleteFile={(rowId) => void clearColorImage(rowId, true)}
                  onAddColorRow={() => setColorRows((prev) => [...prev, newColorRow()])}
                  onRemoveColorRow={(rowId) => setColorRows((prev) => prev.filter((row) => row.id !== rowId))}
                  onColorDraftChange={(patch) => setColorDraft((prev) => ({ ...prev, ...patch }))}
                  onCreateColor={() => void createColorFromDraft()}
                  onDeleteColor={(color) => void deleteCustomColor(color)}
                />
              ) : null}

              {activeSection === 'visual-content' ? (
                <SiteContentEditor
                  form={siteContent}
                  errors={siteContentErrors}
                  loading={siteContentLoading}
                  saving={siteContentSaving}
                  uploading={uploading}
                  requestError={requestError}
                  onChange={(patch) => setSiteContent((prev) => ({ ...prev, ...patch }))}
                  onSubmit={saveSiteContent}
                  onReload={() => void loadSiteContent()}
                  onImageUpload={(field, file) => void handleSiteImageUpload(field, file)}
                  onImageDetach={(field) => void clearSiteImage(field, false)}
                  onImageDeleteFile={(field) => void clearSiteImage(field, true)}
                />
              ) : null}

              {activeSection === 'personalizados' ? (
                <SalesPageEditor page="personalizados" />
              ) : null}

              {activeSection === 'mayorista' ? (
                <SalesPageEditor page="mayorista" />
              ) : null}

              {activeSection === 'categories' ? (
                <CategoryManager
                  categories={categories}
                  loading={loadingProducts}
                  canManage={canDelete}
                  onRename={(from, to) => renameCategory(from, to)}
                  onDelete={(category) => deleteCategory(category)}
                />
              ) : null}

              {activeSection === 'landing-categories' ? (
                landingCatsLoading ? (
                  <p style={{ color: 'rgba(241,221,178,0.5)', padding: '2rem 0' }}>Cargando…</p>
                ) : (
                  <LandingCategoryManager initialCategories={landingCategories} />
                )
              ) : null}

              {activeSection === 'products' ? (
                <ProductTable
                  products={products}
                  loading={loadingProducts}
                  canDelete={canDelete}
                  query={productQuery}
                  category={productCategory}
                  status={productStatus}
                  sort={productSort}
                  page={productPage}
                  limit={productLimit}
                  total={productTotal}
                  pages={productPages}
                  categories={categories}
                  onQueryChange={(value) => {
                    setProductQuery(value);
                    setProductPage(1);
                  }}
                  onCategoryChange={(value) => {
                    setProductCategory(value);
                    setProductPage(1);
                  }}
                  onStatusChange={(value) => {
                    setProductStatus(value);
                    setProductPage(1);
                  }}
                  onSortChange={(value) => {
                    setProductSort(value);
                    setProductPage(1);
                  }}
                  onLimitChange={(value) => {
                    setProductLimit(value);
                    setProductPage(1);
                  }}
                  onResetFilters={() => {
                    setProductQuery('');
                    setProductCategory('');
                    setProductStatus('all');
                    setProductSort('featured');
                    setProductPage(1);
                  }}
                  onPageChange={setProductPage}
                  onEdit={editProduct}
                  onDelete={(id) => void deleteProduct(id)}
                  onHardDelete={(product) => void hardDeleteProduct(product)}
                />
              ) : null}

              {activeSection === 'audit' ? <AuditLogPanel /> : null}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
