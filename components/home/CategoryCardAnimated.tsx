'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Children, type ReactNode } from 'react';

const itemVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  children: ReactNode;
  stagger?: boolean;
};

export function CategoryCardAnimated({ children, stagger }: Props) {
  const prefersReducedMotion = useReducedMotion();

  if (stagger) {
    return (
      <motion.div
        className="grid-3"
        initial={prefersReducedMotion ? undefined : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-80px' }}
        variants={prefersReducedMotion ? undefined : { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {Children.map(children, (child) => (
          <motion.div
            variants={prefersReducedMotion ? undefined : itemVariants}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="section-header"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 32 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
