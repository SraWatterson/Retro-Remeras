'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type AuditActionFilter =
  | 'all'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_REACTIVATED'
  | 'PRODUCT_DEACTIVATED'
  | 'IMAGE_UPLOADED'
  | 'IMAGE_DELETED';

type AuditRangeFilter = 'all' | 'today' | '7d' | '30d';

type AuditLogItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  actorId: string | null;
  metadata: unknown;
  createdAt: string;
};

type AuditResponse = {
  items?: AuditLogItem[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  error?: string;
};

const ACTION_OPTIONS: Array<{ value: AuditActionFilter; label: string }> = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'LOGIN_SUCCESS', label: 'Login exitoso' },
  { value: 'LOGIN_FAILED', label: 'Login fallido' },
  { value: 'PRODUCT_CREATED', label: 'Producto creado' },
  { value: 'PRODUCT_UPDATED', label: 'Producto editado' },
  { value: 'PRODUCT_REACTIVATED', label: 'Producto reactivado' },
  { value: 'PRODUCT_DEACTIVATED', label: 'Producto eliminado/desactivado' },
  { value: 'IMAGE_UPLOADED', label: 'Imagen subida' },
  { value: 'IMAGE_DELETED', label: 'Imagen eliminada' },
];

const RANGE_OPTIONS: Array<{ value: AuditRangeFilter; label: string }> = [
  { value: 'all', label: 'Todo el historial' },
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(metadata: unknown, key: string) {
  if (!isRecord(metadata)) return '';
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
}

function getNumber(metadata: unknown, key: string) {
  if (!isRecord(metadata)) return null;
  const value = metadata[key];
  return typeof value === 'number' ? value : null;
}

function getBoolean(metadata: unknown, key: string) {
  if (!isRecord(metadata)) return false;
  return metadata[key] === true;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getAuditPresentation(item: AuditLogItem) {
  const hardDelete = getBoolean(item.metadata, 'hardDelete');
  const deletedCategory = getString(item.metadata, 'deletedCategory');
  const from = getString(item.metadata, 'from');
  const to = getString(item.metadata, 'to');

  if (item.entity === 'Category' && deletedCategory) {
    return { label: 'Categoría eliminada', tone: 'danger' as const };
  }

  if (item.entity === 'Category' && from && to) {
    return { label: 'Categoría editada', tone: 'warning' as const };
  }

  if (item.action === 'LOGIN_SUCCESS') {
    return { label: 'Login exitoso', tone: 'success' as const };
  }

  if (item.action === 'LOGIN_FAILED') {
    return { label: 'Login fallido', tone: 'danger' as const };
  }

  if (item.action === 'PRODUCT_CREATED') {
    return { label: 'Producto creado', tone: 'success' as const };
  }

  if (item.action === 'PRODUCT_UPDATED') {
    return { label: 'Producto editado', tone: 'info' as const };
  }

  if (item.action === 'PRODUCT_REACTIVATED') {
    return { label: 'Producto reactivado', tone: 'success' as const };
  }

  if (item.action === 'PRODUCT_DEACTIVATED') {
    return { label: hardDelete ? 'Producto eliminado' : 'Producto desactivado', tone: 'danger' as const };
  }

  if (item.action === 'IMAGE_UPLOADED') {
    return { label: 'Imagen subida', tone: 'info' as const };
  }

  if (item.action === 'IMAGE_DELETED') {
    return { label: 'Imagen eliminada', tone: 'warning' as const };
  }

  return { label: item.action.replaceAll('_', ' ').toLowerCase(), tone: 'info' as const };
}

function summarizeAudit(item: AuditLogItem) {
  const email = getString(item.metadata, 'email');
  const reason = getString(item.metadata, 'reason');
  const nombre = getString(item.metadata, 'nombre');
  const slug = getString(item.metadata, 'slug');
  const categoria = getString(item.metadata, 'categoria');
  const from = getString(item.metadata, 'from');
  const to = getString(item.metadata, 'to');
  const deletedCategory = getString(item.metadata, 'deletedCategory');
  const movedTo = getString(item.metadata, 'movedTo');
  const updatedProducts = getNumber(item.metadata, 'updatedProducts');
  const path = getString(item.metadata, 'path');

  if (item.entity === 'Category' && deletedCategory) {
    return `Se eliminó "${deletedCategory}" y se movieron ${updatedProducts ?? 0} producto(s) a "${movedTo || 'Variados'}".`;
  }

  if (item.entity === 'Category' && from && to) {
    return `Se renombró "${from}" a "${to}". Productos actualizados: ${updatedProducts ?? 0}.`;
  }

  if (item.action === 'LOGIN_SUCCESS') {
    return `Ingreso correcto${email ? ` de ${email}` : ''}.`;
  }

  if (item.action === 'LOGIN_FAILED') {
    return `Intento fallido${email ? ` de ${email}` : ''}${reason ? ` (${reason})` : ''}.`;
  }

  if (item.action === 'IMAGE_UPLOADED') {
    return `Archivo subido${path ? `: ${path}` : ''}.`;
  }

  if (item.action === 'IMAGE_DELETED') {
    return `Archivo eliminado${path ? `: ${path}` : ''}.`;
  }

  if (nombre) {
    return `${nombre}${categoria ? ` · ${categoria}` : ''}${slug ? ` · ${slug}` : ''}.`;
  }

  if (slug) {
    return `Producto: ${slug}.`;
  }

  if (item.entityId) {
    return `${item.entity} · ${item.entityId}`;
  }

  return item.entity;
}

function getVisiblePages(page: number, pages: number) {
  if (pages <= 3) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  if (page <= 2) return [1, 2, pages];
  if (page >= pages - 1) return [1, pages - 1, pages];
  return [1, page, pages];
}

export function AuditLogPanel() {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [action, setAction] = useState<AuditActionFilter>('all');
  const [range, setRange] = useState<AuditRangeFilter>('7d');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const visiblePages = useMemo(() => getVisiblePages(page, pages), [page, pages]);
  const hasFilters = Boolean(action !== 'all' || range !== '7d' || search.trim());

  async function loadAuditLogs(nextPage = page) {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: '10',
        action,
        range,
      });

      if (search.trim()) {
        params.set('search', search.trim());
      }

      const response = await fetch('/api/audit?' + params.toString(), { cache: 'no-store' });
      const data = (await response.json()) as AuditResponse;

      if (!response.ok || !Array.isArray(data.items)) {
        setError(data.error || 'No se pudo cargar el historial.');
        setItems([]);
        return;
      }

      setItems(data.items);
      setTotal(Number(data.total) || 0);
      setPages(Number(data.pages) || 1);
      setPage(Number(data.page) || nextPage);
    } catch {
      setError('No se pudo cargar el historial.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAuditLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, range]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    void loadAuditLogs(1);
  }

  function resetFilters() {
    setAction('all');
    setRange('7d');
    setSearch('');
    setPage(1);
  }

  function goToPage(nextPage: number) {
    const safePage = Math.max(1, Math.min(nextPage, pages));
    setPage(safePage);
    void loadAuditLogs(safePage);
  }

  return (
    <section className="panel admin-audit-panel">
      <div className="admin-list-header admin-audit-header">
        <div>
          <span className="admin-panel-eyebrow">Auditoría</span>
          <h2>Historial ({total})</h2>
          <p className="admin-muted">Registro simple de acciones importantes del panel.</p>
        </div>
        <button className="btn btn-secondary" type="button" disabled={loading} onClick={() => void loadAuditLogs(page)}>
          Actualizar
        </button>
      </div>

      <form className="admin-audit-toolbar" onSubmit={handleSubmit}>
        <label className="admin-search-label admin-search-label--wide">
          <span>Buscar</span>
          <input
            className="input"
            type="search"
            placeholder="Ej: Product, email, id..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className="admin-search-label">
          <span>Acción</span>
          <select
            className="input"
            value={action}
            onChange={(event) => {
              setAction(event.target.value as AuditActionFilter);
              setPage(1);
            }}
          >
            {ACTION_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="admin-search-label">
          <span>Fecha</span>
          <select
            className="input"
            value={range}
            onChange={(event) => {
              setRange(event.target.value as AuditRangeFilter);
              setPage(1);
            }}
          >
            {RANGE_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className="admin-audit-actions">
          <button className="btn btn-secondary" type="submit" disabled={loading}>Buscar</button>
          <button className="btn btn-ghost" type="button" disabled={!hasFilters || loading} onClick={resetFilters}>
            Limpiar
          </button>
        </div>
      </form>

      {error ? <p className="admin-error">{error}</p> : null}

      {loading ? (
        <div className="admin-skeleton-list" aria-label="Cargando historial">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="admin-skeleton-row" key={index} />
          ))}
        </div>
      ) : !items.length ? (
        <div className="admin-empty-state">
          <h3>No hay registros para mostrar</h3>
          <p>Probá cambiar los filtros o ejecutar alguna acción desde el panel.</p>
        </div>
      ) : (
        <>
          <div className="admin-audit-list">
            {items.map((item) => {
              const presentation = getAuditPresentation(item);

              return (
                <article className="admin-audit-item" key={item.id}>
                  <div className="admin-audit-item-top">
                    <span className={`admin-audit-badge admin-audit-badge--${presentation.tone}`}>{presentation.label}</span>
                    <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                  </div>

                  <p className="admin-audit-summary">{summarizeAudit(item)}</p>

                  <div className="admin-audit-meta">
                    <span>{item.entity}</span>
                    {item.entityId ? <span>ID: {item.entityId.slice(0, 8)}…</span> : null}
                    {item.actorId ? <span>Actor: {item.actorId.slice(0, 8)}…</span> : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="admin-pagination admin-audit-pagination" aria-label="Paginación de auditoría">
            <button className="btn btn-secondary" type="button" disabled={page <= 1 || loading} onClick={() => goToPage(page - 1)}>
              Anterior
            </button>

            <div className="admin-page-numbers" aria-label={`Página ${page} de ${pages}`}>
              {visiblePages.map((pageNumber, index) => {
                const previous = visiblePages[index - 1];
                const showGap = previous && pageNumber - previous > 1;

                return (
                  <span className="admin-page-number-group" key={pageNumber}>
                    {showGap ? <span className="admin-page-gap">…</span> : null}
                    <button
                      type="button"
                      className={pageNumber === page ? 'admin-page-number is-active' : 'admin-page-number'}
                      aria-current={pageNumber === page ? 'page' : undefined}
                      disabled={loading}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </span>
                );
              })}
            </div>

            <button className="btn btn-secondary" type="button" disabled={page >= pages || loading} onClick={() => goToPage(page + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </section>
  );
}
