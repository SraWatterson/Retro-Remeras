'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FaInstagram, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { createWhatsAppLink } from '@/lib/shop';

const INSTAGRAM_URL = 'https://www.instagram.com/retro.remeras/';

const MAPS_URL =
  'https://www.google.com/maps/place/Retro+Remeras/@-34.683511,-58.6405952,13.75z/data=!4m10!1m2!2m1!1sRetro+Remeras+Buenos+Aires!3m6!1s0x95bcc783d44ac483:0x7779caf3aad85e22!8m2!3d-34.6928604!4d-58.6065624!15sChpSZXRybyBSZW1lcmFzIEJ1ZW5vcyBBaXJlc1ocIhpyZXRybyByZW1lcmFzIGJ1ZW5vcyBhaXJlc5IBDmNsb3RoaW5nX3N0b3JlmgFEQ2k5RFFVbFJRVU52WkVOb2RIbGpSamx2VDI1Vk1FOVhhRFJqVlRGc1VWWkdTazVGY0VsTlZGWXlaRlk0TlU5WVl4QULgAQD6AQQIABAX!16s%2Fg%2F11yht175vp?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D';

const MAP_EMBED_URL =
  'https://www.google.com/maps?q=Retro%20Remeras%20Buenos%20Aires&ll=-34.6928604,-58.6065624&z=15&output=embed';

const ROWS = [
  {
    key: 'whatsapp',
    Icon: FaWhatsapp,
    label: 'WhatsApp',
    value: '+54 9 11 2362-0076',
    href: createWhatsAppLink('Hola! Quiero hacer una consulta sobre las remeras.'),
    external: true,
    cta: 'Escribinos',
  },
  {
    key: 'instagram',
    Icon: FaInstagram,
    label: 'Instagram',
    value: '@retro.remeras',
    href: INSTAGRAM_URL,
    external: true,
  },
  {
    key: 'retiro',
    Icon: FaMapMarkerAlt,
    label: 'Retiro y envíos',
    value: 'Zona Oeste, Buenos Aires · Envíos a todo el país',
    href: MAPS_URL,
    external: true,
  },
] as const;

/**
 * Contacto + ubicación en una sola sección (antes eran dos: "Dónde estamos"
 * y "Hablemos"). Izquierda: lista de canales; derecha: mapa en versión oscura.
 * Mantiene los anclas #contacto y #ubicacion que usan el menú y el footer.
 */
export function ContactSection() {
  const prefersReducedMotion = useReducedMotion();
  const enter = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] as const, delay },
        };

  return (
    <section id="contacto" className="section contact-section cx-section" aria-labelledby="contact-title">
      <span id="ubicacion" className="cx-anchor" aria-hidden="true" />
      <div className="container">
        <div className="cx">
          <motion.div className="cx__info" {...enter()}>
            <div className="cx__head">
              <span className="cx__kicker">Contacto</span>
              <h2 id="contact-title" className="cx__title">
                Hablemos
              </h2>
              <p className="cx__lead">
                ¿Dudas con el talle, una idea para personalizar o un pedido grande? Escribinos por WhatsApp y lo charlamos.
              </p>
            </div>

            <ul className="cx__list">
              {ROWS.map((row) => (
                <li key={row.key}>
                  <a
                    className={`cx__row cx__row--${row.key}`}
                    href={row.href}
                    {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className="cx__icon" aria-hidden="true">
                      <row.Icon size={15} />
                    </span>
                    <span className="cx__text">
                      <small>{row.label}</small>
                      <b>{row.value}</b>
                    </span>
                    {'cta' in row ? (
                      <span className="btn btn-primary cx__cta">{row.cta}</span>
                    ) : (
                      <span className="cx__arrow" aria-hidden="true">↗</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div className="cx__map" {...enter(0.08)}>
            <iframe
              src={MAP_EMBED_URL}
              title="Mapa de Retro Remeras en Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="cx__pin">
              <span>
                <b>Retro Remeras</b>
                <small>Zona Oeste · Buenos Aires</small>
              </span>
              <a className="btn btn-primary" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                Cómo llegar
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
