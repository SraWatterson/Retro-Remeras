'use client';

import { motion } from 'framer-motion';
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
  if (stagger) {
    return (
      <motion.div
        className="grid-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {Children.map(children, (child) => (
          <motion.div
            variants={itemVariants}
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
