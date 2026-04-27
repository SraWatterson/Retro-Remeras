'use client';

import { Product, formatPrice } from '@/lib/shop';

export type ProductStatusFilter = 'all' | 'active' | 'inactive' | 'unavailable';
export type ProductSortOption = 'featured' | 'name' | 'newest' | 'price-asc' | 'price-desc';

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
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
};

function productStatus(product: Product) {
  if (product.deletedAt || !product.activo) return 'Inactivo';
  return product.disponible ? 'Disponible' : 'No disponible';
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
  onPageChange,
  onEdit,
  onDelete,
}: Props) {
  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);

  return (
    <section className="panel admin-list-panel">
      <div className="admin-list-header">
        <div>
          <h2>Productos ({total})</h2>
          <p className="admin-muted">
            {total ? `Mostrando ${firstItem}-${lastItem} de ${total}.` : 'Buscá o creá tu primer producto.'}
          </p>
        </div>
      </div>

      <div className="admin-table-filters" aria-label="Filtros de productos">
        <label className="admin-search-label">
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
      </div>

      {loading ? (
        <div className="admin-skeleton-list" aria-label="Cargando productos">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="admin-skeleton-row" key={index} />
          ))}
        </div>
      ) : !products.length ? (
        <p>No hay productos para mostrar.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.imagen ? (
                        <img className="admin-thumb" src={product.imagen} alt={product.nombre} loading="lazy" />
                      ) : (
                        <span className="admin-thumb admin-thumb--empty">Sin imagen</span>
                      )}
                    </td>
                    <td>{product.nombre}</td>
                    <td>{product.categoria}</td>
                    <td>{formatPrice(product.precio)}</td>
                    <td>{productStatus(product)}</td>
                    <td className="admin-row-actions">
                      <button className="btn btn-secondary" type="button" onClick={() => onEdit(product)}>
                        Editar
                      </button>
                      {canDelete && !product.deletedAt ? (
                        <button className="btn btn-ghost" type="button" onClick={() => onDelete(product.id)}>
                          Desactivar
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 ? (
            <div className="admin-pagination" aria-label="Paginación de productos">
              <button className="btn btn-secondary" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                Anterior
              </button>
              <span>
                Página {page} de {pages}
              </span>
              <button className="btn btn-secondary" type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
                Siguiente
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
