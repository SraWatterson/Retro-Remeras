'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { PricingTier, SalesItem } from '@/lib/site-content-defaults';

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
  benefitsKicker?: string;
  benefitsTitle: string;
  benefits: SalesItem[];
  pricingEnabled?: boolean;
  pricingTitle?: string;
  pricingSubtitle?: string;
  pricingNote?: string;
  pricingTiers?: PricingTier[];
  processTitle: string;
  process: SalesItem[];
  noteTitle: string;
  noteText: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function SalesPage({
  eyebrow,
  title,
  highlight,
  description,
  primaryCta,
  whatsappHref,
  secondaryCta = 'Ver productos',
  secondaryHref = '/productos',
  image,
  imageAlt,
  benefitsKicker,
  benefitsTitle,
  benefits,
  pricingEnabled = false,
  pricingTitle = '',
  pricingSubtitle = '',
  pricingNote = '',
  pricingTiers = [],
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
            className="sales-benefits-list"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <motion.div
              className="sales-benefits-list__title"
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {benefitsKicker ? <span className="section-kicker">{benefitsKicker}</span> : null}
              <h2>{benefitsTitle}</h2>
            </motion.div>

            {benefits.map((benefit, index) => (
              <motion.div
                className="sales-benefit-item"
                variants={fadeUp}
                transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
                key={benefit.title}
              >
                <span className="sales-benefit-item__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {pricingEnabled && pricingTiers.filter((t) => t.active).length > 0 ? (
        <section className="sales-section sales-section--pricing">
          <div className="container">
            <motion.div
              className="sales-section__header"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            >
              {pricingTitle ? <h2>{pricingTitle}</h2> : null}
              {pricingSubtitle ? <p className="sales-section__subtitle">{pricingSubtitle}</p> : null}
            </motion.div>

            <motion.div
              className="sales-pricing-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {pricingTiers.filter((t) => t.active).map((tier) => (
                <motion.div
                  key={tier.id}
                  className="sales-pricing-card"
                  variants={fadeUp}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="sales-pricing-card__label">{tier.label}</span>
                  <span className="sales-pricing-card__range">{tier.range}</span>
                </motion.div>
              ))}
            </motion.div>

            {pricingNote ? (
              <motion.p
                className="sales-pricing-note"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {pricingNote}
              </motion.p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="sales-section sales-section--process">
        <div className="container sales-process">
          <motion.div
            className="sales-process__header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2>{processTitle}</h2>
          </motion.div>

          <motion.div
            className="sales-process-track"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {process.map((step, index) => (
              <motion.div
                className="sales-process-step"
                variants={fadeUp}
                transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
                key={step.title}
              >
                <div className="sales-process-step__head">
                  <span className="sales-process-step__num" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </motion.div>
            ))}
          </motion.div>
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
