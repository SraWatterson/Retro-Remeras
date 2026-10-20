import Image from 'next/image';
import Link from 'next/link';
import { FaEnvelope, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const FOOTER_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Remeras' },
  { href: '/personalizados', label: 'Personalizados' },
  { href: '/mayorista', label: 'Mayorista' },
  { href: '/#contacto', label: 'Contacto' },
];

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5491123620076';
const CONTACT_EMAIL = 'admiretro.remeras@gmail.com';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand" href="/" aria-label="Ir al inicio de Retro Remeras">
            <Image src="/assets/logo/icono-banner.webp" alt="Retro Remeras" width={64} height={64} sizes="64px" />
          </Link>
          <p>
            Remeras con nostalgia y personalidad: anime, rock, videojuegos y cultura pop estampados en DTF. Sin mínimo de compra, con envíos a todo el país y atención por WhatsApp.
          </p>
          <small>© {new Date().getFullYear()} Retro Remeras. Todos los derechos reservados.</small>
          <a
            href="https://www.instagram.com/davidleonelhxc/"
            target="_blank"
            rel="noreferrer"
            className="footer-credit"
            aria-label="Instagram de David, desarrollador del sitio"
          >
            Desarrollo por <span className="footer-credit__name">David</span>
          </a>
          <a
            href="https://www.instagram.com/am.vittone/"
            target="_blank"
            rel="noreferrer"
            className="footer-credit"
            aria-label="Instagram de Aylen, diseño y contenido del sitio"
          >
            Diseño y contenido por <span className="footer-credit__name">Aylen</span>
          </a>
        </div>

        <nav className="footer-nav" aria-label="Navegación del sitio">
          <h3 className="footer-col-title">Páginas</h3>
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="footer-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div>
          <h3 className="footer-col-title">Seguinos y contacto</h3>
          <div className="footer-social">
            <a
              href="https://www.instagram.com/retro.remeras/"
              target="_blank"
              className="social-link instagram"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram size={20} aria-hidden="true" />
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              className="social-link whatsapp"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={20} aria-hidden="true" />
            </a>
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`} className="footer-contact-email">
            <FaEnvelope size={14} aria-hidden="true" />
            {CONTACT_EMAIL}
          </a>
          <address className="footer-address">
            Buenos Aires, Argentina · Envíos a todo el país
          </address>
        </div>
      </div>

    </footer>
  );
}
