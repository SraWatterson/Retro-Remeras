'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const MAPS_URL =
  'https://www.google.com/maps/place/Retro+Remeras/@-34.683511,-58.6405952,13.75z/data=!4m10!1m2!2m1!1sRetro+Remeras+Buenos+Aires!3m6!1s0x95bcc783d44ac483:0x7779caf3aad85e22!8m2!3d-34.6928604!4d-58.6065624!15sChpSZXRybyBSZW1lcmFzIEJ1ZW5vcyBBaXJlc1ocIhpyZXRybyByZW1lcmFzIGJ1ZW5vcyBhaXJlc5IBDmNsb3RoaW5nX3N0b3JlmgFEQ2k5RFFVbFJRVU52WkVOb2RIbGpSamx2VDI1Vk1FOVhhRFJqVlRGc1VWWkdTazVGY0VsTlZGWXlaRlk0TlU5WVl4QULgAQD6AQQIABAX!16s%2Fg%2F11yht175vp?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D';

const MAP_EMBED_URL =
  'https://www.google.com/maps?q=Retro%20Remeras%20Buenos%20Aires&ll=-34.6928604,-58.6065624&z=15&output=embed';

export function LocationSection() {
  return (
    <section id="ubicacion" className="section location-section" aria-labelledby="location-title">
      <div className="container location-section__container">
        <motion.div
          className="location-section__content"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-kicker">Ubicación</span>
          <h2 id="location-title" className="section-title location-section__title">Dónde estamos</h2>
          <p className="section-subtitle location-section__subtitle">
            Encontranos en Google Maps
          </p>

          <div className="location-section__actions">
            <Link className="btn btn-primary" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              Cómo llegar
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="location-section__map-card"
          initial={{ opacity: 0, y: 28, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        >
          <div className="location-section__map-frame">
            <iframe
              src={MAP_EMBED_URL}
              title="Mapa de Retro Remeras en Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
