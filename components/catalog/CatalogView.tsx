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
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => { counts[p.categoria] = (counts[p.categoria] ?? 0) + 1; });
    return counts;
  }, [products]);

  const handlePillClick = (category: string) => {
    setActiveCategory((prev) => prev === category && category !== 'Todos' ? 'Todos' : category);
  };

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
          <div className="catalog-controls">
            <div className="catalog-category-picker">
              <button
                className={`picker-toggle${dropdownOpen ? ' is-open' : ''}`}
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
              >
                <svg className="picker-toggle__icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="1" y="2" width="12" height="1.4" rx="0.7" fill="currentColor" />
                  <rect x="3" y="6.3" width="8" height="1.4" rx="0.7" fill="currentColor" />
                  <rect x="5" y="10.6" width="4" height="1.4" rx="0.7" fill="currentColor" />
                </svg>
                <span className="picker-toggle__label">{activeCategory}</span>
                {activeCategory !== 'Todos' && (
                  <span className="pill-count">{categoryCounts[activeCategory] ?? 0}</span>
                )}
                <svg className="picker-toggle__chevron" width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                  <path d="M2 3.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="picker-backdrop" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
                  <div className="picker-panel" role="listbox" aria-label="Seleccionar categoría">
                    {categoryList.map((category) => {
                      const count = category === 'Todos' ? products.length : (categoryCounts[category] ?? 0);
                      return (
                        <button
                          key={category}
                          className={`picker-option${activeCategory === category ? ' is-selected' : ''}`}
                          role="option"
                          aria-selected={activeCategory === category}
                          type="button"
                          onClick={() => {
                            handlePillClick(category);
                            setDropdownOpen(false);
                          }}
                        >
                          <span>{category}</span>
                          <span className="pill-count">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="catalog-bar-row">
              <span key={filtered.length} className="catalog-results-count" aria-live="polite">
                {loading ? 'Cargando…' : `${filtered.length} diseño${filtered.length === 1 ? '' : 's'}`}
                {activeCategory !== 'Todos' ? <span className="catalog-active-filter"> · {activeCategory}</span> : null}
              </span>

              <div className="catalog-sort-group" role="group" aria-label="Ordenar por precio">
                <button className={`sort-btn${priceOrder === 'default' ? ' is-active' : ''}`} type="button" onClick={() => setPriceOrder('default')} aria-pressed={priceOrder === 'default'}>
                  Original
                </button>
                <button className={`sort-btn${priceOrder === 'price-asc' ? ' is-active' : ''}`} type="button" onClick={() => setPriceOrder('price-asc')} aria-pressed={priceOrder === 'price-asc'}>
                  ↑ Precio
                </button>
                <button className={`sort-btn${priceOrder === 'price-desc' ? ' is-active' : ''}`} type="button" onClick={() => setPriceOrder('price-desc')} aria-pressed={priceOrder === 'price-desc'}>
                  ↓ Precio
                </button>
              </div>
            </div>
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
