'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Product, createWhatsAppLink, formatPrice, normalizeImageUrl, normalizeText } from '@/lib/shop';

type Props = {
  initialCategory?: string;
  initialProducts: Product[];
  categories: string[];
};

function findCategoryFromUrl(value: string | undefined, categories: string[]) {
  if (!value) return 'Todos';

  const decodedValue = decodeURIComponent(value);
  const normalizedValue = normalizeText(decodedValue);
  const matchedCategory = categories.find((category) => normalizeText(category) === normalizedValue);

  return matchedCategory || decodedValue;
}

export function CatalogView({ initialCategory, initialProducts, categories }: Props) {
  const products = useMemo(() => initialProducts, [initialProducts]);
  const loading = false;
  const initialCategoryValue = useMemo(() => findCategoryFromUrl(initialCategory, categories), [categories, initialCategory]);
  const categoryList = useMemo(() => {
    if (initialCategoryValue !== 'Todos' && !categories.some((category) => category === initialCategoryValue)) {
      return ['Todos', ...categories, initialCategoryValue];
    }

    return ['Todos', ...categories];
  }, [categories, initialCategoryValue]);
  const [activeCategory, setActiveCategory] = useState(initialCategoryValue);
  const [priceOrder, setPriceOrder] = useState('default');

  const filtered = useMemo(() => {
    const categoryText = normalizeText(activeCategory);

    const result = products.filter((product) => {
      return activeCategory === 'Todos' || normalizeText(product.categoria) === categoryText;
    });

    if (priceOrder === 'price-asc') {
      return [...result].sort((a, b) => Number(a.precio || 0) - Number(b.precio || 0));
    }

    if (priceOrder === 'price-desc') {
      return [...result].sort((a, b) => Number(b.precio || 0) - Number(a.precio || 0));
    }

    return result;
  }, [activeCategory, priceOrder, products]);

  return (
    <main className="catalog-main">
      <section className="catalog-hero">
        <div className="container">
          <span className="section-kicker">Catálogo</span>
          <h1 className="section-title">Todos nuestros diseños disponibles</h1>
          <p className="section-subtitle">Filtrá por categoría y entrá al detalle de cada remera.</p>
        </div>
      </section>

      <section className="catalog-section" aria-label="Catálogo de productos">
        <div className="container catalog-shell">
          <div className="catalog-controls catalog-controls--simple panel">
            <div className="form-group catalog-category-field">
              <span className="form-label">Categorías</span>
              <div className="filter-pills" role="list" aria-label="Filtrar por categoría">
                {categoryList.map((category) => (
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

            <div className="form-group catalog-order-field">
              <label className="form-label" htmlFor="catalog-price-order">Ordenar por</label>
              <select
                className="input catalog-select"
                id="catalog-price-order"
                value={priceOrder}
                onChange={(event) => setPriceOrder(event.target.value)}
              >
                <option value="default">Orden original</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </div>
          </div>

          <div className="catalog-results-bar panel" aria-live="polite">
            <strong>{loading ? 'Cargando...' : `${filtered.length} diseño${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`}</strong>
            {activeCategory !== 'Todos' ? (
              <p className="catalog-meta">Filtro activo: <span>{activeCategory}</span></p>
            ) : null}
          </div>

          <div className="catalog-grid" data-catalog-grid>
            {!loading && !filtered.length ? (
              <div className="empty-state">
                <span className="section-kicker">Sin resultados</span>
                <h3>No encontramos diseños para esa categoría</h3>
                <p>Probá con otra categoría o volvé a ver todos los diseños.</p>
              </div>
            ) : (
              filtered.map((product) => {
                const message = `Hola! Me interesa la remera ${product.nombre}. ¿Está disponible?`;

                return (
                  <article className="product-card product-card--linked" key={product.id}>
                    <Link className="product-card-link" href={`/producto?id=${product.id}`} aria-label={`Ver ${product.nombre}`}>
                      <div className="product-media">
                        <Image src={normalizeImageUrl(product.imagen)} alt={product.nombre} width={1000} height={1000} quality={90} sizes="(max-width: 767px) 92vw, (max-width: 1199px) 44vw, 360px" />
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
                        <Link className="btn btn-primary" href={`/producto?id=${product.id}`}>
                          Ver producto
                        </Link>
                        <a className="btn btn-secondary btn-whatsapp-soft" href={createWhatsAppLink(message)} target="_blank" rel="noopener noreferrer">
                          Consultar
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
