'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Product, formatPrice, normalizeImageUrl } from '@/lib/shop';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      const response = await fetch('/api/products', { cache: 'no-store' });
      const data = await response.json();
      if (!ignore && Array.isArray(data)) {
        setProducts(data);
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const featured = useMemo(() => products.filter((product) => product.destacado).slice(0, 6), [products]);

  return (
    <section className="section" data-carousel>
      <div className="container">
        <div className="section-header">
          <span className="section-kicker">Catálogo destacado</span>
          <h2 className="section-title">Algunos de nuestros diseños más pedidos</h2>
          <p className="section-subtitle">Explorá el catálogo completo y entrá al detalle de cada producto.</p>
        </div>

        <div className="catalog-grid">
          {featured.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-media">
                <img src={normalizeImageUrl(product.imagen)} alt={product.nombre} loading="lazy" decoding="async" />
              </div>
              <div className="product-content">
                <div className="product-category">{product.categoria}</div>
                <h3 className="product-title">{product.nombre}</h3>
                <p className="product-description">{product.descripcion}</p>
                <div className="price-row">
                  <span className="product-price">{formatPrice(product.precio)}</span>
                </div>
                <Link className="btn btn-secondary" href={`/producto?id=${product.id}`}>
                  Ver producto
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
