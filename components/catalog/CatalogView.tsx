'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CATEGORY_LIST, Product, createWhatsAppLink, formatPrice, normalizeImageUrl, normalizeText } from '@/lib/shop';

type Props = {
  initialCategory?: string;
  initialSearch?: string;
  initialProducts: Product[];
};

export function CatalogView({ initialCategory, initialSearch, initialProducts }: Props) {
  const products = useMemo(() => initialProducts, [initialProducts]);
  const loading = false;
  const [search, setSearch] = useState(initialSearch || '');
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && CATEGORY_LIST.includes(initialCategory) ? initialCategory : 'Todos'
  );


  const filtered = useMemo(() => {
    const searchText = normalizeText(search);

    return products.filter((product) => {
      const matchCategory = activeCategory === 'Todos' || product.categoria === activeCategory;
      const haystack = normalizeText(`${product.nombre} ${product.categoria} ${product.descripcion}`);
      const matchSearch = !searchText || haystack.includes(searchText);
      return matchCategory && matchSearch;
    });
  }, [activeCategory, products, search]);

  return (
    <main className="catalog-main">
      <section className="catalog-hero">
        <div className="container">
          <span className="section-kicker">Catálogo</span>
          <h1 className="section-title">Todos nuestros diseños disponibles</h1>
          <p className="section-subtitle">Filtrá por categoría, buscá por nombre y entrá al detalle de cada remera.</p>
        </div>
      </section>

      <section>
        <div className="container catalog-shell">
          <aside className="filters panel">
            <div className="section-header">
              <h2>Buscá tu estilo</h2>
              <p className="section-subtitle">Filtrá por categoría o escribí una palabra clave.</p>
            </div>

            <div className="filters-fields">
              <div className="form-group">
                <label className="form-label" htmlFor="catalog-search">Buscar producto</label>
                <input
                  className="input"
                  id="catalog-search"
                  type="search"
                  placeholder="Ej: maradona, arcade, vintage..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="form-group">
                <span className="form-label">Categorías</span>
                <div className="filter-pills">
                  {CATEGORY_LIST.map((category) => (
                    <button
                      key={category}
                      className={`filter-pill ${activeCategory === category ? 'is-active' : ''}`}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="catalog-stats panel">
              <div>
                <strong>{loading ? 'Cargando...' : `${filtered.length} diseño${filtered.length === 1 ? '' : 's'}`}</strong>
                <p className="catalog-meta">Filtro activo: <span>{activeCategory === 'Todos' ? 'Todas las categorías' : activeCategory}</span></p>
              </div>
            </div>

            <div className="catalog-grid">
              {!loading && !filtered.length ? (
                <div className="empty-state">
                  <h3>No encontramos resultados</h3>
                  <p>Probá con otra categoría o cambiando el texto de búsqueda.</p>
                </div>
              ) : (
                filtered.map((product) => {
                  const message = `Hola! Me interesa la remera ${product.nombre}. ¿Está disponible?`;

                  return (
                    <article className="product-card product-card--linked" key={product.id}>
                      <Link className="product-card-link" href={`/producto?id=${product.id}`} aria-label={`Ver ${product.nombre}`}>
                        <div className="product-media">
                          <img src={normalizeImageUrl(product.imagen)} alt={product.nombre} loading="lazy" decoding="async" width={900} height={900} />
                          {product.destacado ? <span className="cat-visual__badge">Destacado</span> : null}
                        </div>
                      </Link>

                      <div className="product-content">
                        <div className="product-category">{product.categoria}</div>
                        <h3 className="product-title">
                          <Link className="product-title-link" href={`/producto?id=${product.id}`}>
                            {product.nombre}
                          </Link>
                        </h3>
                        <p className="product-description">{product.descripcion}</p>

                        <div className="price-row">
                          <span className="product-price">{formatPrice(product.precio)}</span>
                          <span className="tag">{product.disponible ? 'Disponible' : 'Consultar'}</span>
                        </div>

                        <div className="product-actions product-actions--spaced">
                          <Link className="btn btn-secondary" href={`/producto?id=${product.id}`}>
                            Ver producto
                          </Link>
                          <a className="btn btn-primary" href={createWhatsAppLink(message)} target="_blank" rel="noopener noreferrer">
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
