'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Tienda temática · Buenos Aires
          </motion.span>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            Remeras con <span>estilo</span>, nostalgia y personalidad
          </motion.h1>

          <motion.p
            className="hero-text"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
          >
            En Retro Remeras mezclamos cultura pop, estética vintage y diseños con identidad. Elegí una categoría,
            encontrá tu estilo y armá tu pedido desde la página de cada producto.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
          >
            <Link className="btn btn-primary" href="/catalogo">
              Ver catálogo
            </Link>
            <Link className="btn btn-secondary" href="/carrito">
              Ver carrito
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, y: 36, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
        >
          <div className="poster-stack">
            <article className="poster-main poster-frame poster-frame--featured">
              <Image src="/assets/img/ejemplo-vintage.jpg" alt="Diseño vintage destacado" width={1100} height={1320} quality={92} sizes="(max-width: 767px) 72vw, (max-width: 1199px) 38vw, 430px" priority />
              <div className="poster-badge">Colecciones con impronta retro</div>
            </article>

            <div className="poster-side" aria-label="Diseños destacados">
              <article className="poster-main poster-frame">
                <Image src="/assets/img/remera-goku.jpg" alt="Diseño anime destacado" width={1100} height={1320} quality={92} sizes="(max-width: 767px) 34vw, (max-width: 1199px) 18vw, 210px" />
              </article>

              <article className="poster-main poster-frame">
                <Image src="/assets/img/ejemplo-gaming.jpg" alt="Diseño videojuegos destacado" width={1100} height={1320} quality={92} sizes="(max-width: 767px) 34vw, (max-width: 1199px) 18vw, 210px" />
              </article>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}