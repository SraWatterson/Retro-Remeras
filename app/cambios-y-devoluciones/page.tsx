import type { Metadata } from 'next';
import Link from 'next/link';
import '../css/legal.css';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { createWhatsAppLink } from '@/lib/shop';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Cambios y devoluciones | Retro Remeras',
  description:
    'Cómo funcionan los cambios, las devoluciones y el botón de arrepentimiento en Retro Remeras. Las remeras personalizadas no tienen cambio.',
  alternates: { canonical: '/cambios-y-devoluciones' },
};

export const revalidate = 3600;

const ARREPENTIMIENTO_MSG =
  'Hola! Quiero arrepentirme de mi compra (botón de arrepentimiento). Mi nombre es: ___ y mi pedido fue el día: ___';

export default async function Page() {
  const siteContent = await getSiteContent();

  return (
    <>
      <PromoBar content={siteContent} />
      <SiteHeader />
      <main className="legal-page">
        <div className="container legal">
          <span className="section-kicker">Compras</span>
          <h1 className="section-title">
            Cambios y <span>devoluciones</span>
          </h1>
          <p className="legal__lead">
            Queremos que tu remera te encante. Acá te contamos qué pasa si necesitás devolverla o si algo no salió bien.
          </p>

          <section id="arrepentimiento">
            <h2>Remeras del catálogo: 10 días para arrepentirte</h2>
            <p>
              Si compraste una remera del catálogo, tenés <strong>10 días corridos</strong> desde que la recibís para
              arrepentirte de la compra, como indica la ley de Defensa del Consumidor. No tenés que explicar el motivo.
            </p>
            <ul>
              <li>La remera tiene que estar sin uso, sin lavar y en las mismas condiciones en que la recibiste.</li>
              <li>Te devolvemos el total de lo que pagaste, por el mismo medio de pago.</li>
              <li>Para hacerlo, escribinos por WhatsApp o tocá el botón de arrepentimiento de esta página.</li>
            </ul>
          </section>

          <section id="personalizados">
            <h2>Remeras personalizadas: no tienen cambio ni devolución</h2>
            <p>
              Las remeras <strong>personalizadas</strong> (con tu diseño, foto, nombre o cualquier pedido especial) se hacen
              a medida para vos, así que <strong>no tienen cambio ni devolución</strong>, ni siquiera por talle. Por eso,
              antes de confirmar el pedido revisamos juntos el diseño, el color y el talle: fijate bien la tabla de talles y,
              si tenés dudas, consultanos.
            </p>
          </section>

          <section id="fallas">
            <h2>Si la remera llegó con una falla</h2>
            <p>
              Si la remera llegó con un defecto de fabricación o de estampado, o no es la que pediste, escribinos dentro de
              los 10 días de recibirla con una foto. La cambiamos sin costo, también si es personalizada.
            </p>
          </section>

          <section id="como">
            <h2>Cómo hacer el trámite</h2>
            <ol>
              <li>Escribinos por WhatsApp con tu nombre, la fecha del pedido y el motivo.</li>
              <li>Te respondemos y coordinamos la devolución o el cambio.</li>
              <li>Cuando recibimos la remera y la revisamos, te hacemos el reintegro o te mandamos la nueva.</li>
            </ol>
          </section>

          <div className="legal__actions">
            <a className="btn btn-primary" href={createWhatsAppLink(ARREPENTIMIENTO_MSG)} target="_blank" rel="noopener noreferrer">
              Botón de arrepentimiento
            </a>
            <a className="btn btn-secondary" href={createWhatsAppLink('Hola! Tengo una consulta sobre un cambio.')} target="_blank" rel="noopener noreferrer">
              Consultar por WhatsApp
            </a>
          </div>

          <p className="legal__note">
            También podés escribirnos a <a href="mailto:admiretro.remeras@gmail.com">admiretro.remeras@gmail.com</a>.
            Volver a <Link href="/productos">las remeras</Link>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
