'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useState, type CSSProperties } from 'react';

export type MarqueeCategory = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  /** Página de la colección; si no tiene remeras todavía, va al catálogo filtrado. */
  href?: string;
  /** Texto alternativo de la imagen (si no hay, se usa el título). */
  alt?: string;
};

type Props = {
  categories: MarqueeCategory[];
};

/** Segundos que tarda cada tarjeta en cruzar: más categorías, vuelta más larga, misma velocidad. */
const SECONDS_PER_CARD = 6;

function CategoryCard({ category, hidden }: { category: MarqueeCategory; hidden?: boolean }) {
  return (
    <div className="category-card-shell cat-marquee__item" aria-hidden={hidden || undefined}>
      <Link
        className="category-card"
        href={category.href ?? `/productos?categoria=${category.slug}`}
        aria-label={`Explorar categoría ${category.title}`}
        tabIndex={hidden ? -1 : undefined}
        style={{ '--category-image': `url('${category.image}')` } as CSSProperties}
        draggable={false}
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={hidden ? '' : category.alt || category.title}
            width={1100}
            height={820}
            quality={85}
            sizes="(max-width: 767px) 72vw, 340px"
            draggable={false}
          />
        ) : null}

        <div className="category-card-content">
          <h3>{category.title}</h3>
          {category.description ? <p>{category.description}</p> : null}
        </div>

        <span className="btn btn-explore" aria-hidden="true">
          Explorar
        </span>
      </Link>
    </div>
  );
}

/**
 * Cinta infinita de categorías: las tarjetas se deslizan solas en loop.
 * - Se frena al pasar el mouse, al tocarla en el celular o al navegar con Tab.
 * - Con "reducir movimiento" activado no se mueve: queda como fila deslizable a mano.
 * La lista se renderiza dos veces seguidas y la animación corre exactamente una
 * copia (-50 %), así el salto al reiniciar no se nota. La segunda copia queda
 * oculta para lectores de pantalla y fuera del orden de Tab.
 */
export function CategoryMarquee({ categories }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [touchPaused, setTouchPaused] = useState(false);

  if (!categories.length) return null;

  const animated = !prefersReducedMotion;
  const duration = `${Math.max(categories.length, 4) * SECONDS_PER_CARD}s`;

  return (
    <motion.div
      className={`cat-marquee${animated ? ' is-animated' : ' is-static'}${touchPaused ? ' is-paused' : ''}`}
      initial={animated ? { opacity: 0, y: 28 } : undefined}
      whileInView={animated ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onTouchStart={() => setTouchPaused(true)}
      onTouchEnd={() => setTouchPaused(false)}
      onTouchCancel={() => setTouchPaused(false)}
    >
      <div className="cat-marquee__track" style={{ '--cat-marquee-duration': duration } as CSSProperties}>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
        {animated
          ? categories.map((category) => <CategoryCard key={`${category.id}-copia`} category={category} hidden />)
          : null}
      </div>
    </motion.div>
  );
}
