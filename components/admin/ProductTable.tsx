'use client';

import Image from 'next/image';
import { Product, formatPrice, normalizeImageUrl } from '@/lib/shop';

export type ProductStatusFilter = 'all' | 'active' | 'inactive' | 'unavailable';
export type ProductSortOption = 'featured' | 'name' | 'newest' | 'price-asc' | 'price-desc';

const PAGE_LIMIT_OPTIONS = [10, 20, 40, 80];

type Props = {
  products: Product[];
  loading: boolean;
  canDelete: boolean;
  query: string;
  category: string;
  status: ProductStatusFilter;
  sort: ProductSortOption;
  page: number;
  limit: number;
  total: number;
  pages: number;
  categories: string[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: ProductStatusFilter) => void;
  onSortChange: (value: ProductSortOption) => void;
  onLimitChange: (value: number) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onHardDelete: (product: Product) => void;
};

function productStatus(product: Product) {
  if (product.deletedAt || !product.activo) {
    return {
      label: 'Inactivo',
      tone: 'inactive',
    } as const;
  }

  if (!product.disponible) {
    return {
      label: 'No disponible',
      tone: 'warning',
    } as const;
  }

  return {
    label: 'Disponible',
    tone: 'success',
  } as const;
}

function getVisiblePages(page: number, pages: number) {
  if (pages <= 5) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, pages];
  }

  if (page >= pages - 2) {
    return [1, pages - 3, pages - 2, pages - 1, pages];
  }

  return [1, page - 1, page, page + 1, pages];
}

export function ProductTable({
  products,
  loading,
  canDelete,
  query,
  category,
  status,
  sort,
  page,
  limit,
  total,
  pages,
  categories,
  onQueryChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onLimitChange,
  onResetFilters,
  onPageChange,
  onEdit,
  onDelete,
  onHardDelete,
}: Props) {
  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);
  const hasActiveFilters = Boolean(query.trim() || category || status !== 'all' || sort !== 'featured');
  const visiblePages = getVisiblePages(page, pages);

  return (
    <section className="panel admin-list-panel">
      <div className="admin-list-header">
        <div>
          <span className="admin-panel-eyebrow">Listado</span>
          <h2>Productos ({total})</h2>
          <p className="admin-muted">
            {total ? `Mostrando ${firstItem}-${lastItem} de ${total}.` : 'Buscá o creá tu primer producto.'}
          </p>
        </div>
      </div>

      <div className="admin-table-toolbar" aria-label="Filtros de productos">
        <label className="admin-search-label admin-search-label--wide">
          <span>Buscar</span>
          <input
            className="input"
            type="search"
            placeholder="Ej: Atari, Anime, vintage..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>

        <label className="admin-search-label">
          <span>Categoría</span>
          <select className="input" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
            <option value="">Todas</option>
            {categories.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="admin-search-label">
          <span>Estado</span>
          <select className="input" value={status} onChange={(event) => onStatusChange(event.target.value as ProductStatusFilter)}>
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="unavailable">No disponibles</option>
            <option value="inactive">Inactivos</option>
          </select>
        </label>

        <label className="admin-search-label">
          <span>Orden</span>
          <select className="input" value={sort} onChange={(event) => onSortChange(event.target.value as ProductSortOption)}>
            <option value="featured">Destacados primero</option>
            <option value="name">Nombre A-Z</option>
            <option value="newest">Más recientes</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
          </select>
        </label>

        <label className="admin-search-label admin-limit-label">
          <span>Por página</span>
          <select className="input" value={limit} onChange={(event) => onLimitChange(Number(event.target.value))}>
            {PAGE_LIMIT_OPTIONS.map((option) => (
              <option value={option} key={option}>{option}</option>
            ))}
          </select>
        </label>

        <div className="admin-toolbar-actions">
          <button
            className="btn btn-secondary admin-reset-btn"
            type="button"
            disabled={!hasActiveFilters || loading}
            onClick={onResetFilters}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="admin-active-filters" aria-label="Filtros activos">
          {query.trim() ? <span>Texto: {query.trim()}</span> : null}
          {category ? <span>Categoría: {category}</span> : null}
          {status !== 'all' ? <span>Estado: {status === 'active' ? 'Activos' : status === 'inactive' ? 'Inactivos' : 'No disponibles'}</span> : null}
          {sort !== 'featured' ? <span>Orden personalizado</span> : null}
        </div>
      ) : null}

      {loading ? (
        <div className="admin-skeleton-list" aria-label="Cargando productos">
          {Array.from({ length: Math.min(limit, 8) }).map((_, index) => (
            <div className="admin-skeleton-row" key={index} />
          ))}
        </div>
      ) : !products.length ? (
        <div className="admin-empty-state">
          <h3>No hay productos para mostrar</h3>
          <p>Probá limpiar filtros o crear un producto nuevo desde el formulario.</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--products">
              <colgroup>
                <col className="admin-col-image" />
                <col className="admin-col-product" />
                <col className="admin-col-category" />
                <col className="admin-col-price" />
                <col className="admin-col-status" />
                <col className="admin-col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const statusInfo = productStatus(product);

                  return (
                    <tr key={product.id}>
                      <td>
                        {product.imagen ? (
                          <Image className="admin-thumb" src={normalizeImageUrl(product.imagen)} alt={product.nombre} width={72} height={72} sizes="72px" />
                        ) : (
                          <span className="admin-thumb admin-thumb--empty">Sin imagen</span>
                        )}
                      </td>
                      <td>
                        <strong className="admin-product-name">{product.nombre}</strong>
                        {product.destacado ? <span className="admin-mini-tag">Destacado</span> : null}
                      </td>
                      <td>{product.categoria}</td>
                      <td>{formatPrice(product.precio)}</td>
                      <td>
                        <span className={`admin-status admin-status--${statusInfo.tone}`}>{statusInfo.label}</span>
                      </td>
                      <td className="admin-actions-cell">
                        <div className="admin-row-actions">
                          <button className="btn btn-secondary" type="button" onClick={() => onEdit(product)}>
                            Editar
                          </button>
                          {canDelete && !product.deletedAt ? (
                            <button className="btn btn-ghost" type="button" onClick={() => onDelete(product.id)}>
                              Desactivar
                            </button>
                          ) : null}
                          {canDelete ? (
                            <button
                              className="btn admin-danger-btn"
                              type="button"
                              onClick={() => onHardDelete(product)}
                            >
                              Eliminar
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination" aria-label="Paginación de productos">
            <button className="btn btn-secondary" type="button" disabled={page <= 1 || loading} onClick={() => onPageChange(1)}>
              Primero
            </button>
            <button className="btn btn-secondary" type="button" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>
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
                      onClick={() => onPageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </span>
                );
              })}
            </div>

            <button className="btn btn-secondary" type="button" disabled={page >= pages || loading} onClick={() => onPageChange(page + 1)}>
              Siguiente
            </button>
            <button className="btn btn-secondary" type="button" disabled={page >= pages || loading} onClick={() => onPageChange(pages)}>
              Último
            </button>
          </div>
        </>
      )}
    </section>
  );
}
