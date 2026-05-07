'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { Product, formatPrice, normalizeImageUrl } from '@/lib/shop';

const AUTOPLAY_DELAY = 3600;
const SWIPE_THRESHOLD = 75;
const MAX_FEATURED_PRODUCTS = 9;

type Props = {
  initialProducts: Product[];
};

type FeaturedCardProps = {
  product: Product;
  index: number;
  activeIndex: number;
  totalCards: number;
};

type IconProps = {
  className?: string;
};

function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function FeaturedProducts({ initialProducts }: Props) {
  const products = useMemo(() => initialProducts || [], [initialProducts]);

  const featured = useMemo(() => {
    const activeProducts = products.filter((product) => product.activo !== false);
    const highlighted = activeProducts.filter((product) => product.destacado);
    const source = highlighted.length ? highlighted : activeProducts;

    return source.slice(0, MAX_FEATURED_PRODUCTS);
  }, [products]);

  const getMiddleIndex = useCallback(() => Math.floor(featured.length / 2), [featured.length]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayIntervalRef = useRef<number | null>(null);
  const previousLengthRef = useRef(0);

  const clearAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      window.clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    clearAutoplay();

    if (isPaused || featured.length <= 1) return;

    autoplayIntervalRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featured.length);
    }, AUTOPLAY_DELAY);
  }, [clearAutoplay, featured.length, isPaused]);

  const changeSlide = useCallback(
    (newIndex: number) => {
      if (!featured.length) return;

      const safeIndex = (newIndex + featured.length) % featured.length;
      setActiveIndex(safeIndex);

      if (!isPaused) {
        window.setTimeout(startAutoplay, 0);
      }
    },
    [featured.length, isPaused, startAutoplay]
  );

  const goToNext = useCallback(() => {
    changeSlide(activeIndex + 1);
  }, [activeIndex, changeSlide]);

  const goToPrevious = useCallback(() => {
    changeSlide(activeIndex - 1);
  }, [activeIndex, changeSlide]);

  useEffect(() => {
    if (!featured.length) {
      setActiveIndex(0);
      previousLengthRef.current = 0;
      return;
    }

    if (previousLengthRef.current !== featured.length) {
      setActiveIndex(Math.floor(featured.length / 2));
      previousLengthRef.current = featured.length;
      return;
    }

    if (activeIndex >= featured.length) {
      setActiveIndex(getMiddleIndex());
    }
  }, [activeIndex, featured.length, getMiddleIndex]);

  useEffect(() => {
    startAutoplay();

    return clearAutoplay;
  }, [clearAutoplay, startAutoplay]);

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (featured.length <= 1) return;

    const dragOffset = info.offset.x;

    if (dragOffset > SWIPE_THRESHOLD) {
      changeSlide(activeIndex - 1);
    } else if (dragOffset < -SWIPE_THRESHOLD) {
      changeSlide(activeIndex + 1);
    }
  };

  if (!featured.length) {
    return null;
  }

  return (
    <section
      className="section featured-products-section"
      data-carousel
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="container">
        <motion.div
          className="featured-showcase featured-showcase--title-only"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="featured-showcase__intro">
            <span className="featured-showcase__kicker">
              Catálogo destacado
            </span>

            <h2 className="featured-showcase__title">
              Algunos de nuestros diseños más pedidos
            </h2>
          </div>

          <div className="featured-showcase__body">
            <div className="featured-carousel-viewport">
              <motion.div
                className="featured-carousel-stage"
                drag={featured.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                aria-live="polite"
              >
                {featured.map((product, index) => (
                  <FeaturedCarouselCard
                    key={product.id}
                    product={product}
                    index={index}
                    activeIndex={activeIndex}
                    totalCards={featured.length}
                  />
                ))}
              </motion.div>
            </div>

            {featured.length > 1 ? (
              <div className="featured-carousel-controls">
                <button
                  type="button"
                  className="featured-carousel-arrow"
                  onClick={goToPrevious}
                  aria-label="Producto anterior"
                >
                  <ChevronLeftIcon />
                </button>

                <div className="featured-carousel-dots" aria-label="Productos destacados">
                  {featured.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      className={`featured-carousel-dot${activeIndex === index ? ' is-active' : ''}`}
                      onClick={() => changeSlide(index)}
                      aria-label={`Ir a ${product.nombre}`}
                      aria-current={activeIndex === index ? 'true' : 'false'}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="featured-carousel-arrow"
                  onClick={goToNext}
                  aria-label="Producto siguiente"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedCarouselCard({ product, index, activeIndex, totalCards }: FeaturedCardProps) {
  let offset = index - activeIndex;

  if (offset > totalCards / 2) {
    offset -= totalCards;
  } else if (offset < -totalCards / 2) {
    offset += totalCards;
  }

  const isActive = offset === 0;
  const isVisible = Math.abs(offset) <= 1;

  const animate = {
    x: `${offset * 50}%`,
    scale: isActive ? 1 : 0.8,
    zIndex: totalCards - Math.abs(offset),
    opacity: isVisible ? 1 : 0,
    filter: isActive ? 'brightness(1)' : 'brightness(0.72) saturate(0.88)',
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 30,
    },
  };

  return (
    <motion.article
      className={`featured-carousel-card${isActive ? ' is-active' : ''}`}
      style={{ transformStyle: 'preserve-3d' }}
      animate={animate}
      initial={false}
      aria-hidden={!isVisible}
    >
      <Link
        href={`/producto?id=${product.id}`}
        className="featured-carousel-card__link"
        tabIndex={isActive ? 0 : -1}
        aria-label={`Ver ${product.nombre}`}
      >
        <Image
          src={normalizeImageUrl(product.imagen)}
          alt={product.nombre}
          width={900}
          height={1120}
          quality={90}
          sizes="(max-width: 767px) 72vw, (max-width: 1199px) 40vw, 420px"
          className="featured-carousel-card__image"
        />

        <span className="featured-carousel-card__shade" />

        <span className="featured-carousel-card__label">
          <span>{product.nombre}</span>
          <strong>{formatPrice(product.precio)}</strong>
        </span>
      </Link>
    </motion.article>
  );
}
