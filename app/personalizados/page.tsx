import type { Metadata } from 'next';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SalesPage } from '@/components/personalizados-mayorista/SalesPage';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Personalizados | Retro Remeras',
  description: 'Remeras personalizadas desde una unidad. Mandanos tu diseño, imagen o frase y lo hacemos realidad.',
  alternates: { canonical: '/personalizados' },
  openGraph: {
    title: 'Personalizados | Retro Remeras',
    description: 'Remeras personalizadas desde una unidad. Mandanos tu diseño, imagen o frase y lo hacemos realidad.',
    images: [{ url: '/assets/pets/Postales_1_4.png', width: 1100, height: 1320, alt: 'Remeras personalizadas Retro Remeras' }],
  },
};

export const revalidate = 60;

export default async function PersonalizadosPage() {
  const siteContent = await getSiteContent();
  const c = siteContent.personalizadosData;
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5491123620076';

  return (
    <>
      <PromoBar content={siteContent} />
      <SiteHeader active="personalizados" />
      <SalesPage
        eyebrow={c.eyebrow}
        title={c.title}
        highlight={c.highlight}
        description={c.description}
        primaryCta={c.primaryCta}
        whatsappHref={`https://wa.me/${waNumber}?text=Hola%21%20Quiero%20hacer%20una%20remera%20personalizada%20desde%201%20unidad.%20Tengo%20este%20dise%C3%B1o/idea%3A`}
        secondaryCta={c.secondaryCta}
        secondaryHref={c.secondaryHref}
        image={c.image}
        imageAlt={c.imageAlt}
        benefitsKicker={c.benefitsKicker}
        benefitsTitle={c.benefitsTitle}
        benefits={c.benefits}
        processTitle={c.processTitle}
        process={c.process}
        noteTitle={c.noteTitle}
        noteText={c.noteText}
      />
      <SiteFooter />
    </>
  );
}
