'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5491123620076';
const CONTACT_EMAIL = 'admiretro.remeras@gmail.com';

const CHANNELS = [
  {
    key: 'email',
    Icon: FaEnvelope,
    label: 'Email',
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    className: 'contact-card--email',
    external: false,
  },
  {
    key: 'whatsapp',
    Icon: FaWhatsapp,
    label: 'WhatsApp',
    value: '+54 9 11 2362-0076',
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    className: 'contact-card--whatsapp',
    external: true,
  },
] as const;

export function ContactSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="contacto" className="section contact-section" aria-labelledby="contact-title">
      <div className="container contact-section__inner">
        <motion.div
          className="contact-section__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-kicker">Contacto</span>
          <h2 id="contact-title" className="section-title contact-section__title">Hablemos</h2>
          <span className="contact-section__title-accent" aria-hidden="true" />
          <p className="section-subtitle contact-section__subtitle">
            ¿Tenés una consulta o querés coordinar algo? Escribinos por el medio que prefieras.
          </p>
        </motion.div>

        <motion.div
          className="contact-section__cards"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.56, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {CHANNELS.map(({ key, Icon, label, value, href, className, external }) => (
            <a
              key={key}
              className={`contact-card ${className}`}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="contact-card__icon" aria-hidden="true">
                <Icon size={22} />
              </span>
              <span className="contact-card__body">
                <span className="contact-card__label">{label}</span>
                <span className="contact-card__value">{value}</span>
              </span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
