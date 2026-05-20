'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Product, formatPrice, normalizeImageUrl, normalizeText } from '@/lib/shop';

const CATEGORIES_LIMIT = 6;
const COLORS_LIMIT = 8;

const SORT_OPTIONS = [
  { value: 'default',    label: 'Más nuevo' },
  { value: 'oldest',     label: 'Más antiguo' },
  { value: 'price-asc',  label: 'Precio: menor → mayor' },
  { value: 'price-desc', label: 'Precio: mayor → menor' },
  { value: 'name-asc',   label: 'A → Z' },
  { value: 'name-desc',  label: 'Z → A' },
];

type Props = {
  initialCategory?: string;
  initialProducts: Product[];
  categories: string[];
};

function findCategoryFromUrl(value: string | undefined, categories: string[]) {
  if (!value) return 'Todos';
  const decoded = decodeURIComponent(value);
  const normalized = normalizeText(decoded);
  return categories.find((c) => normalizeText(c) === normalized) || decoded;
}

export function CatalogView({ initialCategory, initialProducts, categories }: Props) {
  const products = useMemo(() => initialProducts, [initialProducts]);
  const initialCategoryValue = useMemo(
    () => findCategoryFromUrl(initialCategory, categories),
    [categories, initialCategory]
  );

  const categoryList = useMemo(() => {
    if (initialCategoryValue !== 'Todos' && !categories.some((c) => c === initialCategoryValue)) {
      return ['Todos', ...categories, initialCategoryValue];
    }
    return ['Todos', ...categories];
  }, [categories, initialCategoryValue]);

  const [activeCategory, setActiveCategory] = useState(initialCategoryValue);
  const [activeColors, setActiveColors] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState('default');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const availableColors = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; hex: string; count: number }>();
    products.forEach((product) => {
      if (!product.imagenesPorColor) return;
      Object.entries(product.imagenesPorColor).forEach(([slug, colorImg]) => {
        if (!map.has(slug)) {
          map.set(slug, { slug, name: colorImg.colorName, hex: colorImg.colorHex, count: 0 });
        }
        map.get(slug)!.count += 1;
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => { counts[p.categoria] = (counts[p.categoria] ?? 0) + 1; });
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    const catNorm = normalizeText(activeCategory);
    const result = products.filter((p) => {
      const catMatch = activeCategory === 'Todos' || normalizeText(p.categoria) === catNorm;
      if (!catMatch) return false;
      if (activeColors.size === 0) return true;
      const keys = p.imagenesPorColor ? Object.keys(p.imagenesPorColor) : [];
      return [...activeColors].some((slug) => keys.includes(slug));
    });

    switch (sortOrder) {
      case 'oldest':     return [...result].reverse();
      case 'price-asc':  return [...result].sort((a, b) => Number(a.precio || 0) - Number(b.precio || 0));
      case 'price-desc': return [...result].sort((a, b) => Number(b.precio || 0) - Number(a.precio || 0));
      case 'name-asc':   return [...result].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      case 'name-desc':  return [...result].sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
      default:           return result;
    }
  }, [activeCategory, activeColors, sortOrder, products]);

  const activeFiltersCount = (activeCategory !== 'Todos' ? 1 : 0) + activeColors.size;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortOrder)?.label ?? 'Ordenar';
  const visibleCategories = showAllCategories ? categoryList : categoryList.slice(0, CATEGORIES_LIMIT + 1);
  const visibleColors = showAllColors ? availableColors : availableColors.slice(0, COLORS_LIMIT);

  function toggleColor(slug: string) {
    setActiveColors((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  }

  function clearFilters() {
    setActiveCategory('Todos');
    setActiveColors(new Set());
  }

  const filterPanel = (
    <>
      <div className="cfilter-section">
        <p className="cfilter-section-title">Categoría</p>
        <ul className="cfilter-list">
          {visibleCategories.map((cat) => {
            const count = cat === 'Todos' ? products.length : (categoryCounts[cat] ?? 0);
            return (
              <li key={cat}>
                <button
                  type="button"
                  className={`cfilter-item${activeCategory === cat ? ' is-active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                >
                  <span className="cfilter-check" aria-hidden="true" />
                  <span className="cfilter-item__name">{cat}</span>
                  <span className="cfilter-item__count">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {categoryList.length > CATEGORIES_LIMIT + 1 && (
          <button type="button" className="cfilter-see-more" onClick={() => setShowAllCategories((p) => !p)}>
            {showAllCategories ? 'Ver menos' : `Ver más (${categoryList.length - CATEGORIES_LIMIT - 1})`}
          </button>
        )}
      </div>

      {availableColors.length > 0 && (
        <div className="cfilter-section">
          <p className="cfilter-section-title">Color</p>
          <ul className="cfilter-list">
            {visibleColors.map((color) => (
              <li key={color.slug}>
                <button
                  type="button"
                  className={`cfilter-item cfilter-item--color${activeColors.has(color.slug) ? ' is-active' : ''}`}
                  onClick={() => toggleColor(color.slug)}
                  aria-pressed={activeColors.has(color.slug)}
                  aria-label={`${color.name} (${color.count})`}
                >
                  <span className="cfilter-check" aria-hidden="true" />
                  <span className="cfilter-item__name">
                    {color.name}
                    <span className="cfilter-count-inline"> ({color.count})</span>
                  </span>
                  <span
                    className="cfilter-color-dot"
                    style={{ background: color.hex }}
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
          {availableColors.length > COLORS_LIMIT && (
            <button type="button" className="cfilter-see-more" onClick={() => setShowAllColors((p) => !p)}>
              {showAllColors ? 'Ver menos' : `Ver más (${availableColors.length - COLORS_LIMIT})`}
            </button>
          )}
        </div>
      )}

      {activeFiltersCount > 0 && (
        <button type="button" className="cfilter-clear" onClick={clearFilters}>
          Limpiar filtros
        </button>
      )}
    </>
  );

  return (
    <>
    <main className="catalog-main">
      <section className="catalog-hero">
        <div className="container">
          <span className="section-kicker">Productos</span>
          <h1 className="section-title">Todos nuestros diseños disponibles</h1>
          <p className="section-subtitle">Filtrá por categoría y encontrá la remera perfecta.</p>
        </div>
      </section>

      <section className="catalog-section" aria-label="Catálogo de productos">
        <div className="container catalog-layout">

          {/* Desktop sidebar */}
          <aside className="catalog-sidebar" aria-label="Filtros">
            <div className="cfilter-header">
              <span className="cfilter-title">Filtrar por</span>
              {activeFiltersCount > 0 && (
                <span className="cfilter-badge">{activeFiltersCount}</span>
              )}
            </div>
            {filterPanel}
          </aside>

          {/* Main content area */}
          <div className="catalog-area">
            {/* Top bar */}
            <div className="catalog-topbar">
              <button
                type="button"
                className={`catalog-filter-btn${activeFiltersCount > 0 ? ' has-filters' : ''}`}
                onClick={() => setFiltersOpen(true)}
                aria-haspopup="dialog"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M1.5 3.5h12M3.5 7.5h8M5.5 11.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Filtrar
                {activeFiltersCount > 0 && (
                  <span className="catalog-filter-btn__badge">{activeFiltersCount}</span>
                )}
              </button>

              <span key={filtered.length} className="catalog-results-count" aria-live="polite">
                {filtered.length} diseño{filtered.length !== 1 ? 's' : ''}
                {activeCategory !== 'Todos' && (
                  <span className="catalog-active-filter"> · {activeCategory}</span>
                )}
              </span>

              <div className="catalog-sort">
                <button
                  type="button"
                  className={`catalog-sort-toggle${sortDropdownOpen ? ' is-open' : ''}`}
                  onClick={() => setSortDropdownOpen((p) => !p)}
                  aria-expanded={sortDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M1 2.5h11M3 6.5h7M5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span>{sortLabel}</span>
                  <svg
                    className="catalog-sort-chevron"
                    width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
                  >
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {sortDropdownOpen && (
                  <>
                    <div className="picker-backdrop" onClick={() => setSortDropdownOpen(false)} aria-hidden="true" />
                    <div className="catalog-sort-panel" role="listbox" aria-label="Ordenar productos">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={sortOrder === opt.value}
                          className={`catalog-sort-option${sortOrder === opt.value ? ' is-selected' : ''}`}
                          onClick={() => { setSortOrder(opt.value); setSortDropdownOpen(false); }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Product grid */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${activeCategory}|${[...activeColors].sort().join(',')}|${sortOrder}`}
                className="catalog-grid"
                data-catalog-grid
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: 'easeInOut' }}
              >
                {!filtered.length ? (
                  <div className="empty-state">
                    <span className="section-kicker">Sin resultados</span>
                    <h3>No encontramos diseños para ese filtro</h3>
                    <p>Probá con otra categoría o limpiá los filtros activos.</p>
                    <button type="button" className="btn btn-primary" onClick={clearFilters}>
                      Ver todos
                    </button>
                  </div>
                ) : (
                  filtered.map((product) => (
                    <article className="product-card product-card--linked" key={product.id}>
                      <Link
                        className="product-card-link"
                        href={`/diseno?id=${product.id}`}
                        aria-label={`Ver ${product.nombre}`}
                      >
                        <div className="product-media">
                          <Image
                            src={normalizeImageUrl(product.imagen)}
                            alt={product.nombre}
                            width={800}
                            height={1000}
                            quality={90}
                            sizes="(max-width: 767px) 46vw, (max-width: 1199px) 28vw, 280px"
                          />
                          {product.destacado ? (
                            <span className="cat-visual__badge">Destacado</span>
                          ) : null}
                        </div>
                      </Link>

                      <div className="product-content">
                        <div className="product-category">{product.categoria}</div>
                        <h3 className="product-title">
                          <Link className="product-title-link" href={`/diseno?id=${product.id}`}>
                            {product.nombre}
                          </Link>
                        </h3>

                        <div className="price-row">
                          <span className="product-price">{formatPrice(product.precio)}</span>
                          {!product.disponible ? <span className="tag">A pedido</span> : null}
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

    </main>

    {/* Mobile bottom sheet — fuera de catalog-main para escapar overflow:clip */}
    <AnimatePresence>
      {filtersOpen && (
        <>
          <motion.div
            className="catalog-sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={() => setFiltersOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="catalog-filter-sheet"
              role="dialog"
              aria-label="Filtros y ordenamiento"
              aria-modal="true"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <div className="catalog-sheet-handle" aria-hidden="true" />
              <div className="catalog-sheet-header">
                <span className="catalog-sheet-title">Filtrar y ordenar</span>
                <button
                  type="button"
                  className="catalog-sheet-close"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Cerrar filtros"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="18" height="18" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="catalog-sheet-body">
                <div className="cfilter-section">
                  <p className="cfilter-section-title">Ordenar por</p>
                  <div className="cfilter-sort-wrap">
                    <select
                      className="cfilter-sort-native"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      aria-label="Ordenar productos"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <svg className="cfilter-sort-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                {filterPanel}
              </div>

              <div className="catalog-sheet-footer">
                <button
                  type="button"
                  className="btn btn-primary catalog-sheet-apply"
                  onClick={() => setFiltersOpen(false)}
                >
                  Ver {filtered.length} diseño{filtered.length !== 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
    </AnimatePresence>
    </>
  );
}
