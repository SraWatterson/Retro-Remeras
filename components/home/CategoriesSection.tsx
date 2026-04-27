'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    title: 'Fútbol',
    description: 'Clásicos, ídolos, momentos épicos y mística de cancha.',
    image: '/assets/category-cards/coleccion-futbol-retro.webp',
  },
  {
    title: 'Anime',
    description: 'Diseños con energía, ciudad, nostalgia y mucha personalidad.',
    image: '/assets/category-cards/anime-retro.jpg',
  },
  {
    title: 'Cine / Películas',
    description: 'Posters, VHS, culto y referencias que sí se entienden.',
    image: '/assets/category-cards/cine-retro.jpg',
  },
  {
    title: 'Videojuegos',
    description: 'Arcade, pixel, boss fights y una buena cuota de nostalgia.',
    image: '/assets/category-cards/retro-gaming.webp',
  },
  {
    title: 'Variados',
    description: 'Rock, cultura urbana, conceptos visuales y diseños sueltos.',
    image: '/assets/category-cards/random-retro.jpg',
  },
  {
    title: 'Vintage',
    description: 'Cartelería, color cálido, tipografías con historia y buen gusto.',
    image: '/assets/category-cards/vintage-retro.png',
  },
];

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 36,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function CategoriesSection() {
  return (
    <section className="section section--categories">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-kicker">Categorías destacadas</span>
          <h2 className="section-title">Diseños que representan lo que te gusta</h2>
          <p className="section-subtitle">
            Explorá nuestras colecciones y encontrá el diseño que más te representa.
          </p>
        </motion.div>

        <motion.div
          className="grid-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {CATEGORIES.map((category) => (
            <motion.article
              key={category.title}
              className="category-card"
              style={{ '--category-image': `url('${category.image}')` } as CSSProperties}
              variants={itemVariants}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={category.image} alt={category.title} loading="lazy" decoding="async" width={900} height={700} />

              <div className="category-card-content">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>

              <Link className="btn btn-explore" href="/catalogo">
                Explorar
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}