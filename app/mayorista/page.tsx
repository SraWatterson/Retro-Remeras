import type { Metadata } from 'next';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SalesPage } from '@/components/personalizados-mayorista/SalesPage';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Mayorista | Retro Remeras',
  description: 'Producción mayorista de remeras para empresas, eventos, institutos, emprendimientos y revendedores.',
};

export const revalidate = 60;

export default async function MayoristaPage() {
  const siteContent = await getSiteContent();
  const c = siteContent.mayoristaData;
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5491123620076';

  return (
    <>
      <PromoBar content={siteContent} />
      <SiteHeader active="mayorista" />
      <SalesPage
        eyebrow={c.eyebrow}
        title={c.title}
        highlight={c.highlight}
        description={c.description}
        primaryCta={c.primaryCta}
        whatsappHref={`https://wa.me/${waNumber}?text=Hola%21%20Quiero%20consultar%20por%20un%20pedido%20mayorista%20de%20remeras.%20Cantidad%20aproximada%3A%20Tipo%20de%20dise%C3%B1o%3A%20Fecha%20estimada%3A`}
        secondaryCta={c.secondaryCta}
        secondaryHref={c.secondaryHref}
        image={c.image}
        imageAlt={c.imageAlt}
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
