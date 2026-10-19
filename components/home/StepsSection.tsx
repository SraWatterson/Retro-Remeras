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
    description: 'Recorré las categorías o explorá todos los productos para encontrar tu remera.',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M8 3 3 6l2 5 3-1.5V21h8V9.5l3 1.5 2-5-5-3c-.7 1.6-2.2 2.5-4 2.5S8.7 4.6 8 3z" />
      </svg>
    ),
  },
  {
    title: 'Seleccioná color, tipo y talle',
    description: 'Configurá el modelo con las opciones disponibles antes de armar el pedido.',
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
    description: 'Enviá tu pedido listo para coordinar disponibilidad, pago y entrega.',
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
