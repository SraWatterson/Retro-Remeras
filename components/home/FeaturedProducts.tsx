'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Product, createWhatsAppLink, formatPrice, normalizeImageUrl } from '@/lib/shop';

const WHATSAPP_MESSAGE = 'Hola! Me interesa la remera. ¿Está disponible?';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const featured = useMemo(
    () => products.filter((product) => product.destacado).slice(0, 12),
    [products]
  );

  useEffect(() => {
    if (activeIndex >= featured.length) {
      setActiveIndex(0);
    }
  }, [featured.length, activeIndex]);

  return (
    <section className="section" data-carousel>
      <div className="container">
        <div className="section-header">
          <span className="section-kicker">Catálogo destacado</span>
          <h2 className="section-title">Algunos de nuestros diseños más pedidos</h2>
          <p className="section-subtitle">Explorá el catálogo completo y entrá al detalle de cada producto.</p>
        </div>

        <div className="carousel-outer">
          <div className="carousel-track-wrap">
            <div className="carousel-track" data-carousel-track>
              {featured.map((product, index) => (
                <article
                  className="carousel-item"
                  key={product.id}
                  hidden={activeIndex !== index}
                  aria-hidden={activeIndex !== index}
                  style={{ display: activeIndex === index ? 'flex' : 'none' }}
                >
                  <div className="product-card product-card--linked">
                    <Link
                      className="product-card-link"
                      href={`/producto?id=${product.id}`}
                      aria-label={`Ver ${product.nombre}`}
                    >
                      <div className="product-media">
                        <img
                          src={normalizeImageUrl(product.imagen)}
                          alt={product.nombre}
                          loading="lazy"
                          decoding="async"
                        />
                        {product.destacado ? (
                          <span className="cat-visual__badge">Destacado</span>
                        ) : null}
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
                      <div className="product-actions">
                        <Link className="btn btn-secondary" href={`/producto?id=${product.id}`}>
                          Ver producto
                        </Link>
                        <a
                          className="btn btn-primary"
                          href={createWhatsAppLink(WHATSAPP_MESSAGE)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="carousel-arrow carousel-arrow--prev"
            onClick={() => setActiveIndex((current) => Math.max(current - 1, 0))}
            disabled={activeIndex === 0}
            aria-label="Anterior"
          />

          <button
            type="button"
            className="carousel-arrow carousel-arrow--next"
            onClick={() => setActiveIndex((current) => Math.min(current + 1, featured.length - 1))}
            disabled={activeIndex >= featured.length - 1}
            aria-label="Siguiente"
          />
        </div>

        <div className="carousel-dots" data-carousel-dots>
          {featured.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`carousel-dot${activeIndex === index ? ' is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ir al producto ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
