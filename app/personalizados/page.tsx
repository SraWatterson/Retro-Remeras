import type { Metadata } from 'next';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SalesPage } from '@/components/personalizados-mayorista/SalesPage';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Personalizados | Retro Remeras',
  description: 'Remeras personalizadas desde una unidad. Mandanos tu diseño, imagen o frase y lo hacemos realidad.',
};

export const revalidate = 60;

export default async function PersonalizadosPage() {
  const siteContent = await getSiteContent();

  return (
    <>
      <PromoBar content={siteContent} />
      <SiteHeader active="personalizados" />
      <SalesPage
        eyebrow="Personalizados"
        title="Tu remera,"
        highlight="tu idea"
        description="¿Tenés una imagen, frase o diseño en mente? Pedí tu remera personalizada desde 1 unidad. Nos mandás la idea por WhatsApp y nosotros nos encargamos del resto."
        primaryCta="Enviar diseño por WhatsApp"
        whatsappHref="https://wa.me/5491156592963?text=Hola%21%20Quiero%20hacer%20una%20remera%20personalizada%20desde%201%20unidad.%20Tengo%20este%20dise%C3%B1o/idea%3A"
        secondaryCta="Ver catálogo"
        secondaryHref="/catalogo"
        image="/assets/pets/Postales_1_4.png"
        imageAlt="Postal visual para remeras personalizadas"
        benefitsTitle="Personalización sin vueltas"
        benefits={[
          {
            title: 'Sin mínimo de compra',
            text: 'Pedí una sola remera si querés. Ideal para regalos, ocasiones especiales o darte un gusto.',
          },
          {
            title: 'Tu diseño o tu frase',
            text: 'Podés enviarnos una imagen, una idea, una frase o una referencia para armar la estampa.',
          },
          {
            title: 'DTF de alta definición',
            text: 'Sin límites de colores ni detalles: estampamos lo que imagines con gran definición.',
          },
          {
            title: 'Calidad premium',
            text: 'La misma dedicación en cada prenda, aunque sea una sola unidad.',
          },
        ]}
        processTitle="Cómo pedís tu personalizada"
        process={[
          { title: 'Mandanos tu idea', text: 'Nos enviás la imagen, frase o referencia por WhatsApp.' },
          { title: 'Definimos detalles', text: 'Coordinamos talle, color, ubicación de estampa y disponibilidad.' },
          { title: 'La producimos', text: 'Preparamos la remera con la mejor terminación posible.' },
          { title: 'Coordinamos entrega', text: 'Acordamos retiro, envío y forma de pago.' },
        ]}
        noteTitle="100% vos"
        noteText="No necesitás comprar un pack entero para tener esa remera que tenés en la cabeza."
      />
      <SiteFooter />
    </>
  );
}
