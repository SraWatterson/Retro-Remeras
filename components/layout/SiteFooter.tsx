import Image from 'next/image';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <a className="brand" href="/" aria-label="Retro Remeras">
            <Image src="/assets/logo/icono-banner.png" alt="Retro Remeras" width={190} height={54} sizes="190px" />
          </a>
          <p>
            Remeras con estilo, nostalgia y personalidad. Diseños temáticos, atención cercana y pedidos simples por WhatsApp.
          </p>
          <small>© {new Date().getFullYear()} Retro Remeras. Todos los derechos reservados.</small>
        </div>

        <div>
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
              href="https://wa.me/5491156592963"
              target="_blank"
              className="social-link whatsapp"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={20} aria-hidden="true" />
            </a>
          </div>
          <address className="footer-address">
            Buenos Aires, Argentina · Envíos a todo el país
          </address>
        </div>
      </div>
    </footer>
  );
}
