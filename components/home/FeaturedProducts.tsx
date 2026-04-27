'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Product, createWhatsAppLink, formatPrice, normalizeImageUrl } from '@/lib/shop';

const WHATSAPP_MESSAGE = 'Hola! Me interesa la remera. ¿Está disponible?';
const AUTOPLAY_DELAY = 6000;
const SWIPE_THRESHOLD = 60;

type Props = {
  initialProducts: Product[];
};

export function FeaturedProducts({ initialProducts }: Props) {
  const products = useMemo(() => initialProducts, [initialProducts]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);


  const featured = useMemo(
    () => products.filter((product) => product.destacado).slice(0, 12),
    [products]
  );

  const goToPrevious = useCallback(() => {
    if (featured.length <= 1) return;

    setDirection(-1);
    setActiveIndex((current) =>
      current === 0 ? featured.length - 1 : current - 1
    );
  }, [featured.length]);

  const goToNext = useCallback(() => {
    if (featured.length <= 1) return;

    setDirection(1);
    setActiveIndex((current) =>
      current === featured.length - 1 ? 0 : current + 1
    );
  }, [featured.length]);

  const goToIndex = (index: number) => {
    if (index === activeIndex) return;

    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  useEffect(() => {
    if (activeIndex >= featured.length) {
      setActiveIndex(0);
    }
  }, [featured.length, activeIndex]);

  useEffect(() => {
    if (isPaused || featured.length <= 1) return;

    const interval = window.setInterval(() => {
      goToNext();
    }, AUTOPLAY_DELAY);

    return () => {
      window.clearInterval(interval);
    };
  }, [featured.length, goToNext, isPaused]);

  const activeProduct = featured[activeIndex];

  return (
    <section className="section" data-carousel>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-kicker">Catálogo destacado</span>
          <h2 className="section-title">Algunos de nuestros diseños más pedidos</h2>
          <p className="section-subtitle">
            Explorá el catálogo completo y entrá al detalle de cada producto.
          </p>
        </motion.div>

        <motion.div
          className="carousel-outer"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div className="carousel-track-wrap">
            <div className="carousel-track" data-carousel-track>
              <AnimatePresence mode="wait" custom={direction}>
                {activeProduct ? (
                  <motion.article
                    key={activeProduct.id}
                    className="carousel-item"
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 80 : -80, scale: 0.985 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: direction > 0 ? -80 : 80, scale: 0.985 }}
                    transition={{
                      duration: 0.48,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.16}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -SWIPE_THRESHOLD) {
                        goToNext();
                      }

                      if (info.offset.x > SWIPE_THRESHOLD) {
                        goToPrevious();
                      }
                    }}
                  >
                    <div className="product-card product-card--linked">
                      <Link
                        className="product-card-link"
                        href={`/producto?id=${activeProduct.id}`}
                        aria-label={`Ver ${activeProduct.nombre}`}
                      >
                        <div className="product-media">
                          <img
                            src={normalizeImageUrl(activeProduct.imagen)}
                            alt={activeProduct.nombre}
                            loading="lazy"
                            decoding="async"
                            width={900}
                            height={900}
                          />

                          {activeProduct.destacado ? (
                            <span className="cat-visual__badge">Destacado</span>
                          ) : null}
                        </div>
                      </Link>

                      <div className="product-content">
                        <div className="product-category">{activeProduct.categoria}</div>

                        <h3 className="product-title">
                          <Link
                            className="product-title-link"
                            href={`/producto?id=${activeProduct.id}`}
                          >
                            {activeProduct.nombre}
                          </Link>
                        </h3>

                        <p className="product-description">{activeProduct.descripcion}</p>

                        <div className="price-row">
                          <span className="product-price">
                            {formatPrice(activeProduct.precio)}
                          </span>
                          <span className="tag">
                            {activeProduct.disponible ? 'Disponible' : 'Consultar'}
                          </span>
                        </div>

                        <div className="product-actions">
                          <Link
                            className="btn btn-secondary"
                            href={`/producto?id=${activeProduct.id}`}
                          >
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
                  </motion.article>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <button
            type="button"
            className="carousel-arrow carousel-arrow--prev"
            onClick={goToPrevious}
            disabled={featured.length <= 1}
            aria-label="Anterior"
          />

          <button
            type="button"
            className="carousel-arrow carousel-arrow--next"
            onClick={goToNext}
            disabled={featured.length <= 1}
            aria-label="Siguiente"
          />
        </motion.div>

        {featured.length > 1 ? (
          <motion.div
            className="carousel-dots"
            data-carousel-dots
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          >
            {featured.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`carousel-dot${activeIndex === index ? ' is-active' : ''}`}
                onClick={() => goToIndex(index)}
                aria-label={`Ir al producto ${index + 1}`}
                aria-current={activeIndex === index ? 'true' : 'false'}
              />
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}