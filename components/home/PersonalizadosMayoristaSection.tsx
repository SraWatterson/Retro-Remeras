'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const SOLUTION_CARDS = [
  {
    eyebrow: 'Desde 1 unidad',
    title: 'Tu diseño, tu estilo',
    text: 'Mandanos tu imagen, frase o idea y la convertimos en una remera única para vos o para regalar.',
    href: '/personalizados',
    cta: 'Quiero personalizar',
    image: '/assets/pets/Postales_1_4.png',
    alt: 'Postal visual para pedidos personalizados',
  },
  {
    eyebrow: 'Por cantidad',
    title: 'Impulsá tu marca o evento',
    text: 'Producción para empresas, institutos, emprendimientos, equipos, eventos y revendedores.',
    href: '/mayorista',
    cta: 'Ver mayorista',
    image: '/assets/pets/Postales_1_5.png',
    alt: 'Postal visual para pedidos mayoristas',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
};

export function PersonalizadosMayoristaSection() {
  return (
    <section className="section section--personalizados-mayorista" aria-labelledby="personalizados-mayorista-title">
      <div className="container">
        <motion.div
          className="section-header personalizados-mayorista-section__header"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-kicker">Pedidos a medida</span>
          <h2 id="personalizados-mayorista-title" className="section-title">Personalizados y mayorista</h2>
          <p className="section-subtitle">
            Desde una remera personalizada hasta producciones por cantidad para marcas, empresas, institutos y eventos.
          </p>
        </motion.div>

        <motion.div
          className="personalizados-mayorista-cards"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {SOLUTION_CARDS.map((card) => (
            <motion.article
              className="personalizados-mayorista-card"
              variants={cardVariants}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              key={card.href}
            >
              <Link className="personalizados-mayorista-card__link" href={card.href}>
                <Image
                  src={card.image}
                  alt={card.alt}
                  width={1100}
                  height={820}
                  quality={90}
                  sizes="(max-width: 767px) 92vw, (max-width: 1199px) 44vw, 560px"
                />
                <span className="personalizados-mayorista-card__badge">{card.eyebrow}</span>
                <span className="personalizados-mayorista-card__arrow" aria-hidden="true">→</span>
                <div className="personalizados-mayorista-card__content">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span className="btn btn-primary personalizados-mayorista-card__cta" aria-hidden="true">{card.cta}</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
