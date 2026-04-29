'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '1',
    title: 'Elegí un diseño',
    description: 'Recorré las categorías o entrá al catálogo completo para encontrar tu remera.',
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
  return (
    <section id="como-funciona" className="section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-kicker">Cómo funciona</span>
          <h2 className="section-title">Pedí tu remera en 3 pasos simples</h2>
          <p className="section-subtitle">Del catálogo a tu pedido por WhatsApp, sin vueltas.</p>
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
          {steps.map((step) => (
            <motion.article
              key={step.number}
              className="info-card"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}