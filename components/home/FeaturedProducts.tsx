'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Product, formatPrice, normalizeImageUrl, productHref } from '@/lib/shop';

/** Cada cuánto pasa sola a la remera siguiente. */
const AUTOPLAY_MS = 4500;
/** Máximo de remeras en la lista (se usan las marcadas como "Destacado" en el panel). */
const MAX_FEATURED = 6;

type Props = {
  initialProducts: Product[];
};

function displayName(nombre: string) {
  return nombre.replace(/^Remera\s+/i, '');
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/**
 * "El índice": foto grande + lista tipográfica de los productos destacados.
 * - Pasa sola cada AUTOPLAY_MS mientras la sección está a la vista; una línea
 *   dorada se llena debajo del producto activo.
 * - En compu, al pasar el mouse (o navegar con Tab) por un nombre, la foto
 *   cambia a esa remera. Clic o toque en un nombre: va a la ficha.
 * - Se frena mientras el mouse está sobre la sección.
 * - Con "reducir movimiento" no avanza sola.
 */
export function FeaturedProducts({ initialProducts }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: '-15% 0px' });

  const featured = useMemo(
    () => initialProducts.filter((product) => product.imagen).slice(0, MAX_FEATURED),
    [initialProducts]
  );

  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [hovering, setHovering] = useState(false);

  const autoplay = !prefersReducedMotion && featured.length > 1;
  const running = autoplay && inView && !hovering;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % featured.length);
      setCycle((current) => current + 1);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [running, active, cycle, featured.length]);

  const select = (index: number) => {
    if (index === active) return;
    setActive(index);
    setCycle((current) => current + 1);
  };

  if (!featured.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="section featured-products-section fx-section"
      aria-labelledby="fx-title"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="container">
        <motion.div
          className="fx"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 32 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ '--fx-autoplay': `${AUTOPLAY_MS}ms` } as CSSProperties}
        >
          <div className="fx__head">
            <span className="fx__kicker">Los más pedidos</span>
            <h2 id="fx-title" className="fx__title">
              Elegí tu <span>próxima</span> remera
            </h2>
          </div>

          <Link
            className="fx__stage"
            href={productHref(featured[active])}
            aria-label={`Ver ${featured[active].nombre}`}
          >
            {featured.map((product, index) => (
              <Image
                key={product.id}
                className={index === active ? 'is-on' : undefined}
                src={normalizeImageUrl(product.imagen)}
                alt={index === active ? product.imagenAlt?.trim() || product.nombre : ''}
                fill
                quality={90}
                sizes="(max-width: 767px) 92vw, 540px"
              />
            ))}
            <span className="fx__count" aria-hidden="true">
              {pad(active + 1)} / {pad(featured.length)}
            </span>
          </Link>

          <div className="fx__side">
            <ol className="fx__list">
              {featured.map((product, index) => {
                const isActive = index === active;
                return (
                  <li key={product.id}>
                    <Link
                      className={`fx__row${isActive ? ' is-on' : ''}${isActive && running ? ' is-running' : ''}`}
                      href={productHref(product)}
                      aria-current={isActive ? 'true' : undefined}
                      onMouseEnter={() => select(index)}
                      onFocus={() => select(index)}
                    >
                      <span className="fx__num" aria-hidden="true">{pad(index + 1)}</span>
                      <span className="fx__text">
                        <small>{product.categoria}</small>
                        <b>{displayName(product.nombre)}</b>
                      </span>
                      <span className="fx__price">{formatPrice(product.precio)}</span>
                      {/* La clave cambia en cada vuelta para reiniciar la barra. */}
                      <span key={`${index}-${cycle}`} className="fx__progress" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ol>

            <Link className="fx__more" href="/productos">
              Ver todos los diseños <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
