'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@/lib/shop';
import { AdminLoginForm } from './AdminLoginForm';
import { AdminSessionBar } from './AdminSessionBar';
import { ProductEditorForm } from './ProductEditorForm';
import { ProductSortOption, ProductStatusFilter, ProductTable } from './ProductTable';
import { ColorImageRow, ProductFormErrors, ProductFormState, SessionUser } from './types';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_REFRESH_INTERVAL_MS = 90 * 60 * 1000;

type AdminToast = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};

const EMPTY_FORM: ProductFormState = {
  legacyId: '',
  slug: '',
  nombre: '',
  categoria: '',
  precio: '',
  imagen: '',
  descripcion: '',
  disponible: true,
  destacado: false,
  activo: true,
};

function newColorRow(initial?: Partial<ColorImageRow>): ColorImageRow {
  return {
    id: crypto.randomUUID(),
    color: initial?.color || '',
    path: initial?.path || '',
  };
}

function colorRowsToRecord(rows: ColorImageRow[]) {
  const record: Record<string, string> = {};

  rows.forEach((row) => {
    const color = row.color.trim();
    const path = row.path.trim();
    if (color && path) {
      record[color] = path;
    }
  });

  return record;
}

function normalizeCategoryInput(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function validateProductInput(values: ProductFormState, colorRows: ColorImageRow[]) {
  const errors: ProductFormErrors = {};

  const slug = values.slug.trim();
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
    const hasColor = Boolean(row.color.trim());
    const hasPath = Boolean(row.path.trim());
    return hasColor !== hasPath;
  });

  if (invalidRow) {
    errors.colorImages = 'Cada fila de color debe tener color e imagen.';
  }

  return errors;
}

function toPayload(values: ProductFormState, colorRows: ColorImageRow[]) {
  const payload: Record<string, unknown> = {
    slug: values.slug.trim(),
    nombre: values.nombre.trim(),
    categoria: normalizeCategoryInput(values.categoria),
    precio: Number(values.precio),
    imagen: values.imagen.trim(),
    imagenesPorColor: colorRowsToRecord(colorRows),
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
  const rows = Object.entries(product.imagenesPorColor || {}).map(([color, path]) =>
    newColorRow({ color, path })
  );

  return {
    form: {
      legacyId: product.legacyId || '',
      slug: product.slug,
      nombre: product.nombre,
      categoria: product.categoria,
      precio: String(product.precio),
      imagen: product.imagen || '',
      descripcion: product.descripcion,
      disponible: Boolean(product.disponible),
      destacado: Boolean(product.destacado),
      activo: Boolean(product.activo),
    } satisfies ProductFormState,
    colorRows: rows.length ? rows : [newColorRow()],
  };
}

export function AdminPanel() {
  const [loadingSession, setLoadingSession] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStatus, setProductStatus] = useState<ProductStatusFilter>('all');
  const [productSort, setProductSort] = useState<ProductSortOption>('featured');
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productPages, setProductPages] = useState(1);
  const [requestError, setRequestError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [colorRows, setColorRows] = useState<ColorImageRow[]>([newColorRow()]);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<AdminToast | null>(null);

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

  const performLogout = useCallback(async (message?: string) => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProducts([]);
    resetForm();

    if (message) {
      setLoginError(message);
      showToast('info', message);
    } else {
      showToast('success', 'Sesión cerrada correctamente.');
    }
  }, [resetForm, showToast]);

  const refreshSessionTimer = useCallback(() => {
    if (!user) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void performLogout('Sesión cerrada por inactividad. Volvé a iniciar sesión.');
    }, SESSION_TIMEOUT_MS);
  }, [performLogout, user]);

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (canManage) {
      void loadProducts(productPage, productQuery, productCategory, productStatus, productSort);
      void loadCategories();
    }
  }, [canManage, productPage, productQuery, productCategory, productStatus, productSort]);

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
        await performLogout('Tu sesión expiró. Volvé a iniciar sesión.');
        return;
      }

      const data = await response.json();
      if (data?.user) {
        setUser(data.user);
      }
    } catch {
      await performLogout('No se pudo renovar la sesión. Volvé a iniciar sesión.');
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

  async function loadProducts(
    page = productPage,
    query = productQuery,
    category = productCategory,
    status = productStatus,
    sort = productSort
  ) {
    setLoadingProducts(true);
    setRequestError('');
    try {
      const params = new URLSearchParams({
        includeInactive: 'true',
        page: String(page),
        limit: '20',
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

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');

    if (!email.trim() || !password.trim()) {
      const message = 'Ingresá email y contraseña.';
      setLoginError(message);
      showToast('error', message);
      return;
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error || 'No se pudo iniciar sesión.';
      setLoginError(message);
      showToast('error', message);
      return;
    }

    setPassword('');
    setUser(data.user);
    showToast('success', 'Sesión iniciada correctamente.');
  }

  function editProduct(product: Product) {
    const mapped = fromProduct(product);
    setEditingId(product.id);
    setForm(mapped.form);
    setColorRows(mapped.colorRows);
    setFormErrors({});
    setRequestError('');
    showToast('info', `Editando ${product.nombre}.`);
  }

  async function uploadFile(file: File) {
    const body = new FormData();
    body.append('file', file);

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
    if (!path.startsWith('/uploads/products/')) return;

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
      await Promise.all([
        loadProducts(productPage, productQuery, productCategory, productStatus, productSort),
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
    if (!confirm('¿Eliminar producto? Esta acción lo desactiva.')) return;

    const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      const message = data?.error || 'No se pudo eliminar el producto.';
      setRequestError(message);
      showToast('error', message);
      return;
    }

    showToast('success', 'Producto desactivado correctamente.');
    await loadProducts(productPage, productQuery, productCategory, productStatus, productSort);
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

        {loadingSession ? (
          <div className="panel admin-session-skeleton" aria-label="Cargando sesión" />
        ) : !user ? (
          <AdminLoginForm
            email={email}
            password={password}
            error={loginError}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleLogin}
          />
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

            <div className="admin-grid">
              <ProductEditorForm
                title={formTitle}
                editing={Boolean(editingId)}
                form={form}
                colorRows={colorRows}
                errors={formErrors}
                categories={categories}
                requestError={requestError}
                saving={saving}
                uploading={uploading}
                onSubmit={handleSubmit}
                onReset={resetForm}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                onMainUpload={(file) => void handleMainImageUpload(file)}
                onMainDetach={() => void clearMainImage(false)}
                onMainDeleteFile={() => void clearMainImage(true)}
                onColorRowChange={(rowId, patch) =>
                  setColorRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)))
                }
                onColorUpload={(rowId, file) => void handleColorImageUpload(rowId, file)}
                onColorDetach={(rowId) => void clearColorImage(rowId, false)}
                onColorDeleteFile={(rowId) => void clearColorImage(rowId, true)}
                onAddColorRow={() => setColorRows((prev) => [...prev, newColorRow()])}
                onRemoveColorRow={(rowId) => setColorRows((prev) => prev.filter((row) => row.id !== rowId))}
              />

              <ProductTable
                products={products}
                loading={loadingProducts}
                canDelete={canDelete}
                query={productQuery}
                category={productCategory}
                status={productStatus}
                sort={productSort}
                page={productPage}
                limit={20}
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
                onPageChange={setProductPage}
                onEdit={editProduct}
                onDelete={(id) => void deleteProduct(id)}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
