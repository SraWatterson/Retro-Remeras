'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@/lib/shop';
import { AdminLoginForm } from './AdminLoginForm';
import { AdminSessionBar } from './AdminSessionBar';
import { ProductEditorForm } from './ProductEditorForm';
import { ProductTable } from './ProductTable';
import { ColorImageRow, ProductFormErrors, ProductFormState, SessionUser } from './types';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

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

function validateProductInput(values: ProductFormState, colorRows: ColorImageRow[]) {
  const errors: ProductFormErrors = {};

  const slug = values.slug.trim();
  if (slug.length < 2 || !/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Slug inválido. Usar minúsculas, números y guiones.';
  }

  if (values.nombre.trim().length < 2) {
    errors.nombre = 'Nombre requerido (mínimo 2 caracteres).';
  }

  if (values.categoria.trim().length < 2) {
    errors.categoria = 'Categoría requerida (mínimo 2 caracteres).';
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

  if (values.legacyId.trim().length > 0) {
    const legacy = Number(values.legacyId);
    if (!Number.isInteger(legacy) || legacy <= 0) {
      errors.legacyId = 'Legacy ID debe ser entero positivo.';
    }
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
    categoria: values.categoria.trim(),
    precio: Number(values.precio),
    imagen: values.imagen.trim(),
    imagenesPorColor: colorRowsToRecord(colorRows),
    descripcion: values.descripcion.trim(),
    disponible: values.disponible,
    destacado: values.destacado,
    activo: values.activo,
  };

  if (values.legacyId.trim()) {
    payload.legacyId = Number(values.legacyId);
  }

  return payload;
}

function fromProduct(product: Product) {
  const rows = Object.entries(product.imagenesPorColor || {}).map(([color, path]) =>
    newColorRow({ color, path })
  );

  return {
    form: {
      legacyId: product.legacyId ? String(product.legacyId) : '',
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
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [colorRows, setColorRows] = useState<ColorImageRow[]>([newColorRow()]);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canManage = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const canDelete = user?.role === 'ADMIN';
  const formTitle = useMemo(() => (editingId ? 'Editar producto' : 'Crear producto'), [editingId]);

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
    }
  }, [resetForm]);

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
      void loadProducts();
    }
  }, [canManage]);

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

  async function loadProducts() {
    setLoadingProducts(true);
    setRequestError('');
    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        setRequestError(data?.error || 'No se pudieron cargar productos.');
        return;
      }

      setProducts(data);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');

    if (!email.trim() || !password.trim()) {
      setLoginError('Ingresá email y contraseña.');
      return;
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setLoginError(data?.error || 'No se pudo iniciar sesión.');
      return;
    }

    setPassword('');
    setUser(data.user);
  }

  function editProduct(product: Product) {
    const mapped = fromProduct(product);
    setEditingId(product.id);
    setForm(mapped.form);
    setColorRows(mapped.colorRows);
    setFormErrors({});
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
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'No se pudo subir imagen.');
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
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'No se pudo subir imagen de color.');
    } finally {
      setUploading(false);
    }
  }

  async function clearMainImage(removeFile: boolean) {
    if (removeFile && form.imagen) await removeUploadedFile(form.imagen);
    setForm((prev) => ({ ...prev, imagen: '' }));
  }

  async function clearColorImage(rowId: string, removeFile: boolean) {
    const target = colorRows.find((row) => row.id === rowId);
    if (!target) return;

    if (removeFile && target.path) await removeUploadedFile(target.path);

    setColorRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, path: '' } : row)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateProductInput(form, colorRows);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

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
        setRequestError(data?.error || 'No se pudo guardar el producto.');
        return;
      }

      resetForm();
      await loadProducts();
    } catch {
      setRequestError('No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm('¿Eliminar producto? Esta acción lo desactiva.')) return;

    const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      setRequestError(data?.error || 'No se pudo eliminar el producto.');
      return;
    }

    await loadProducts();
  }

  return (
    <main className="admin-main">
      <section className="container admin-shell">
        <div className="section-header">
          <span className="section-kicker">Administración</span>
         
          
        </div>

        {loadingSession ? (
          <div className="panel">Cargando sesión...</div>
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
