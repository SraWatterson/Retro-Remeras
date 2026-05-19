'use client';

import { motion, useReducedMotion } from 'framer-motion';

const steps = [
  {
    number: '1',
    title: 'Elegí un diseño',
    description: 'Recorré las categorías o explorá todos los productos para encontrar tu remera.',
  },
  {
    number: '2',
    title: 'Seleccioná color, tipo y talle',
    description: 'Configurá el modelo con las opciones disponibles antes de armar el pedido.',
  },
  {
    number: '3',
    title: 'Confirmá por WhatsApp',
    description: 'Enviá tu pedido listo para coordinar disponibilidad, pago y entrega.',
  },
];

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function StepsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="como-funciona" className="section section--steps">
      <div className="container">
        <motion.div
          className="section-header"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-kicker">Cómo funciona</span>
          <h2 className="section-title">Pedí tu remera en 3 pasos simples</h2>
        </motion.div>

        <motion.div
          className="grid-3 steps-track"
          initial={prefersReducedMotion ? undefined : 'hidden'}
          whileInView={prefersReducedMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-80px' }}
          variants={prefersReducedMotion ? undefined : {
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {steps.map((step, index) => (
            <motion.article
              key={step.number}
              className="step-item"
              variants={prefersReducedMotion ? undefined : itemVariants}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="step-item__dot-wrap">
                <span className="step-item__dot" aria-hidden="true" />
              </div>
              <span className="step-item__num" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}