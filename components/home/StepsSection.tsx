'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { createWhatsAppLink } from '@/lib/shop';

const ICON_PROPS = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const steps: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: 'Elegí un diseño',
    description: 'Recorré las colecciones y quedate con la que más te represente: anime, rock, gaming y más.',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M8 3 3 6l2 5 3-1.5V21h8V9.5l3 1.5 2-5-5-3c-.7 1.6-2.2 2.5-4 2.5S8.7 4.6 8 3z" />
      </svg>
    ),
  },
  {
    title: 'Armá tu remera',
    description: 'Elegí color, corte (regular u oversize) y talle. Si dudás, la tabla de medidas te salva.',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
        <circle cx="15" cy="6" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
  },
  {
    title: 'Confirmá por WhatsApp',
    description: 'Nos llega tu pedido armado y coordinamos pago y entrega por chat. Así de simple.',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z" />
        <path d="M8.5 10.5h7M8.5 13.5h4.5" />
      </svg>
    ),
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function StepsSection() {
  const prefersReducedMotion = useReducedMotion();
  const animate = !prefersReducedMotion;

  return (
    <section id="como-funciona" className="section section--steps">
      <div className="container">
        <motion.div
          className="section-header"
          initial={animate ? { opacity: 0, y: 24 } : undefined}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-kicker">Cómo funciona</span>
          <h2 className="section-title">Pedí tu remera en 3 pasos simples</h2>
        </motion.div>

        <motion.ol
          className="steps-flow"
          initial={animate ? 'hidden' : undefined}
          whileInView={animate ? 'visible' : undefined}
          viewport={{ once: true, margin: '-80px' }}
          variants={animate ? { hidden: {}, visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } } : undefined}
        >
          {/* Línea que une los pasos: se dibuja cuando la sección aparece. */}
          <motion.span
            className="steps-flow__line"
            aria-hidden="true"
            variants={animate ? { hidden: { scaleX: 0, scaleY: 0 }, visible: { scaleX: 1, scaleY: 1 } } : undefined}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />

          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              className="steps-flow__item"
              variants={animate ? itemVariants : undefined}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Compu: emblema sobre la línea + número grande. */}
              <span className="steps-flow__emblem" aria-hidden="true">
                <svg viewBox="0 0 40 40" width="40" height="40">
                  <path className="steps-flow__emblem-outer" d="M20 2.5 37.5 20 20 37.5 2.5 20Z" />
                  <path className="steps-flow__emblem-mid" d="M20 9 31 20 20 31 9 20Z" />
                  <path className="steps-flow__emblem-core" d="M20 14.5 25.5 20 20 25.5 14.5 20Z" />
                </svg>
              </span>
              <span className="steps-flow__big" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>

              {/* Celular: medallón con ícono para la línea de tiempo vertical. */}
              <span className="steps-flow__medal">
                {step.icon}
                <span className="steps-flow__num" aria-hidden="true">{index + 1}</span>
              </span>
              <div className="steps-flow__body">
                <span className="steps-flow__label">Paso {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>

        <motion.div
          className="steps-flow__actions"
          initial={animate ? { opacity: 0, y: 20 } : undefined}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link className="btn btn-primary" href="/productos">Ver los diseños</Link>
          <a
            className="btn btn-secondary"
            href={createWhatsAppLink('Hola! Quiero hacer una consulta sobre las remeras.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar por WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
