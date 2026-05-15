'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Benefit = {
  title: string;
  text: string;
};

type ProcessStep = {
  title: string;
  text: string;
};

type SalesPageProps = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  primaryCta: string;
  whatsappHref: string;
  secondaryCta?: string;
  secondaryHref?: string;
  image: string;
  imageAlt: string;
  benefitsTitle: string;
  benefits: Benefit[];
  processTitle: string;
  process: ProcessStep[];
  noteTitle: string;
  noteText: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function SalesPage({
  eyebrow,
  title,
  highlight,
  description,
  primaryCta,
  whatsappHref,
  secondaryCta = 'Ver catálogo',
  secondaryHref = '/catalogo',
  image,
  imageAlt,
  benefitsTitle,
  benefits,
  processTitle,
  process,
  noteTitle,
  noteText,
}: SalesPageProps) {
  return (
    <main className="sales-page">
      <section className="sales-hero">
        <div className="container sales-hero__grid">
          <motion.div
            className="sales-hero__copy"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="section-kicker">{eyebrow}</span>
            <h1>{title} <span>{highlight}</span></h1>
            <p>{description}</p>
            <div className="sales-hero__actions">
              <Link className="btn btn-primary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {primaryCta}
              </Link>
              <Link className="btn btn-secondary" href={secondaryHref}>
                {secondaryCta}
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="sales-hero__visual"
            initial={{ opacity: 0, y: 34, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            <Image
              src={image}
              alt={imageAlt}
              width={1100}
              height={1320}
              quality={92}
              sizes="(max-width: 767px) 92vw, (max-width: 1199px) 42vw, 520px"
              priority
            />
          </motion.div>
        </div>
      </section>

      <section className="sales-section">
        <div className="container">
          <motion.div
            className="sales-section__header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2>{benefitsTitle}</h2>
          </motion.div>

          <motion.div
            className="sales-benefits"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {benefits.map((benefit) => (
              <motion.article
                className="sales-benefit-card"
                variants={fadeUp}
                transition={{ duration: 0.54, ease: [0.22, 1, 0.36, 1] }}
                key={benefit.title}
              >
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="sales-section sales-section--process">
        <div className="container sales-process">
          <motion.div
            className="sales-section__header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2>{processTitle}</h2>
          </motion.div>

          <div className="sales-process__steps">
            {process.map((step, index) => (
              <motion.article
                className="sales-process-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
                key={step.title}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="sales-section sales-section--cta">
        <div className="container">
          <motion.div
            className="sales-cta-card"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="section-kicker">{noteTitle}</span>
            <h2>{noteText}</h2>
            <Link className="btn btn-primary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              {primaryCta}
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
