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

  return (
    <>
      <PromoBar content={siteContent} />
      <SiteHeader active="mayorista" />
      <SalesPage
        eyebrow="Mayorista"
        title="Producción para"
        highlight="crecer"
        description="Hacemos remeras por cantidad para empresas, institutos, equipos, eventos, merchandising, emprendimientos y revendedores."
        primaryCta="Pedir presupuesto mayorista"
        whatsappHref="https://wa.me/5491156592963?text=Hola%21%20Quiero%20consultar%20por%20un%20pedido%20mayorista%20de%20remeras.%20Cantidad%20aproximada%3A%20Tipo%20de%20dise%C3%B1o%3A%20Fecha%20estimada%3A"
        secondaryCta="Ver catálogo"
        secondaryHref="/catalogo"
        image="/assets/pets/Postales_1_5.png"
        imageAlt="Postal visual para producción mayorista"
        benefitsTitle="Pensado para pedidos por volumen"
        benefits={[
          {
            title: 'Precios por cantidad',
            text: 'Cotizamos según volumen, diseño y tiempos de producción para que tu proyecto sea rentable.',
          },
          {
            title: 'Ideal para proyectos',
            text: 'Empresas, institutos, uniformes, eventos, merch, equipos, revendedores y emprendimientos.',
          },
          {
            title: 'Diseños personalizados',
            text: 'Trabajamos logos, frases, identidad visual o referencias adaptadas a tu necesidad.',
          },
          {
            title: 'Asesoramiento directo',
            text: 'Te ayudamos a definir cantidades, talles, colores y plazos de entrega.',
          },
        ]}
        processTitle="Cómo armamos un pedido mayorista"
        process={[
          { title: 'Nos contás qué necesitás', text: 'Cantidad estimada, tipo de diseño, objetivo y fecha ideal.' },
          { title: 'Definimos la producción', text: 'Revisamos talles, colores, archivos y detalles técnicos.' },
          { title: 'Te pasamos presupuesto', text: 'Cotización a medida según volumen y complejidad.' },
          { title: 'Producimos y entregamos', text: 'Coordinamos el pedido completo y su entrega.' },
        ]}
        noteTitle="Crecé con nosotros"
        noteText="Queremos ser aliados de tu marca, equipo o evento con atención cercana y calidad consistente."
      />
      <SiteFooter />
    </>
  );
}
