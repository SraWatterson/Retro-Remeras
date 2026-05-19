export type SalesItem = {
  title: string;
  text: string;
};

export type PricingTier = {
  id: string;
  label: string;
  range: string;
  price: string;
  active: boolean;
};

export type SalesPageContent = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  secondaryHref: string;
  image: string;
  imageAlt: string;
  benefitsKicker?: string;
  benefitsTitle: string;
  benefits: SalesItem[];
  pricingEnabled: boolean;
  pricingTitle: string;
  pricingSubtitle: string;
  pricingNote: string;
  pricingTiers: PricingTier[];
  processTitle: string;
  process: SalesItem[];
  noteTitle: string;
  noteText: string;
};

export type SiteContentData = {
  id: string;
  promoEnabled: boolean;
  promoText: string;
  promoHref: string | null;
  heroEyebrow: string;
  heroTitlePrefix: string;
  heroTitleAccent: string;
  heroTitleSuffix: string;
  heroText: string;
  heroPrimaryButtonText: string;
  heroPrimaryButtonHref: string;
  heroSecondaryButtonText: string;
  heroSecondaryButtonHref: string;
  heroMainImage: string;
  heroMainImageAlt: string;
  heroBadgeText: string;
  heroSideImageOne: string;
  heroSideImageOneAlt: string;
  heroSideImageTwo: string;
  heroSideImageTwoAlt: string;
  personalizadosData: SalesPageContent;
  mayoristaData: SalesPageContent;
  updatedAt?: Date | string;
};

const NO_PRICING: Pick<SalesPageContent, 'pricingEnabled' | 'pricingTitle' | 'pricingSubtitle' | 'pricingNote' | 'pricingTiers'> = {
  pricingEnabled: false,
  pricingTitle: '',
  pricingSubtitle: '',
  pricingNote: '',
  pricingTiers: [],
};

export const DEFAULT_PERSONALIZADOS: SalesPageContent = {
  eyebrow: 'Personalizados',
  title: 'Tu remera,',
  highlight: 'tu idea',
  description: '¿Tenés una imagen, frase o diseño en mente? Pedí tu remera personalizada desde 1 unidad. Nos mandás la idea por WhatsApp y nosotros nos encargamos del resto.',
  primaryCta: 'Enviar diseño por WhatsApp',
  secondaryCta: 'Ver productos',
  secondaryHref: '/productos',
  image: '/assets/pets/Postales_1_4.png',
  imageAlt: 'Postal visual para remeras personalizadas',
  benefitsKicker: 'Sin complicaciones',
  benefitsTitle: 'Personalización sin vueltas',
  benefits: [
    { title: 'Sin mínimo de compra', text: 'Pedí una sola remera si querés. Ideal para regalos, ocasiones especiales o darte un gusto.' },
    { title: 'Tu diseño o tu frase', text: 'Podés enviarnos una imagen, una idea, una frase o una referencia para armar la estampa.' },
    { title: 'DTF de alta definición', text: 'Sin límites de colores ni detalles: estampamos lo que imagines con gran definición.' },
    { title: 'Calidad premium', text: 'La misma dedicación en cada prenda, aunque sea una sola unidad.' },
  ],
  ...NO_PRICING,
  processTitle: 'Cómo pedís tu personalizada',
  process: [
    { title: 'Mandanos tu idea', text: 'Nos enviás la imagen, frase o referencia por WhatsApp.' },
    { title: 'Definimos detalles', text: 'Coordinamos talle, color, ubicación de estampa y disponibilidad.' },
    { title: 'La producimos', text: 'Preparamos la remera con la mejor terminación posible.' },
    { title: 'Coordinamos entrega', text: 'Acordamos retiro, envío y forma de pago.' },
  ],
  noteTitle: '100% vos',
  noteText: 'No necesitás comprar un pack entero para tener esa remera que tenés en la cabeza.',
};

export const DEFAULT_MAYORISTA: SalesPageContent = {
  eyebrow: 'Mayorista',
  title: 'Producción para',
  highlight: 'crecer',
  description: 'Hacemos remeras por cantidad para empresas, institutos, equipos, eventos, merchandising, emprendimientos y revendedores.',
  primaryCta: 'Pedir presupuesto mayorista',
  secondaryCta: 'Ver productos',
  secondaryHref: '/productos',
  image: '/assets/pets/Postales_1_5.png',
  imageAlt: 'Postal visual para producción mayorista',
  benefitsKicker: 'Para tu negocio',
  benefitsTitle: 'Pensado para pedidos por volumen',
  benefits: [
    { title: 'Precios por cantidad', text: 'Cotizamos según volumen, diseño y tiempos de producción para que tu proyecto sea rentable.' },
    { title: 'Ideal para proyectos', text: 'Empresas, institutos, uniformes, eventos, merch, equipos, revendedores y emprendimientos.' },
    { title: 'Diseños personalizados', text: 'Trabajamos logos, frases, identidad visual o referencias adaptadas a tu necesidad.' },
    { title: 'Asesoramiento directo', text: 'Te ayudamos a definir cantidades, talles, colores y plazos de entrega.' },
  ],
  pricingEnabled: true,
  pricingTitle: 'Escalas de precio',
  pricingSubtitle: 'El precio por unidad baja a medida que sube la cantidad. Consultanos por tu volumen.',
  pricingNote: 'Los precios son orientativos y varían según diseño, colores y técnica de estampado. Pedí tu presupuesto por WhatsApp.',
  pricingTiers: [
    { id: 'tier-1', label: 'Arranque',    range: '12 – 24 unidades',  price: 'Consultar', active: true },
    { id: 'tier-2', label: 'Crecimiento', range: '25 – 49 unidades',  price: 'Consultar', active: true },
    { id: 'tier-3', label: 'Volumen',     range: '50 – 99 unidades',  price: 'Consultar', active: true },
    { id: 'tier-4', label: 'Escala',      range: '100+ unidades',     price: 'Consultar', active: true },
  ],
  processTitle: 'Cómo armamos un pedido mayorista',
  process: [
    { title: 'Nos contás qué necesitás', text: 'Cantidad estimada, tipo de diseño, objetivo y fecha ideal.' },
    { title: 'Definimos la producción', text: 'Revisamos talles, colores, archivos y detalles técnicos.' },
    { title: 'Te pasamos presupuesto', text: 'Cotización a medida según volumen y complejidad.' },
    { title: 'Producimos y entregamos', text: 'Coordinamos el pedido completo y su entrega.' },
  ],
  noteTitle: 'Crecé con nosotros',
  noteText: 'Queremos ser aliados de tu marca, equipo o evento con atención cercana y calidad consistente.',
};

export const DEFAULT_SITE_CONTENT: SiteContentData = {
  id: 'home',
  promoEnabled: true,
  promoText: 'LLEVANDO 3 PRODUCTOS TENÉS 5% DE DESCUENTO',
  promoHref: null,
  heroEyebrow: 'Tienda temática · Buenos Aires',
  heroTitlePrefix: 'Remeras con',
  heroTitleAccent: 'estilo',
  heroTitleSuffix: 'nostalgia y personalidad',
  heroText:
    'En Retro Remeras mezclamos cultura pop, estética vintage y diseños con identidad. Elegí una categoría, encontrá tu estilo y armá tu pedido desde la página de cada producto.',
  heroPrimaryButtonText: 'Ver productos',
  heroPrimaryButtonHref: '/productos',
  heroSecondaryButtonText: 'Cómo funciona',
  heroSecondaryButtonHref: '#como-comprar',
  heroMainImage: '/assets/img/ejemplo-vintage.jpg',
  heroMainImageAlt: 'Diseño vintage destacado',
  heroBadgeText: 'Colecciones con impronta retro',
  heroSideImageOne: '/assets/img/remera-goku.jpg',
  heroSideImageOneAlt: 'Diseño anime destacado',
  heroSideImageTwo: '/assets/img/ejemplo-gaming.jpg',
  heroSideImageTwoAlt: 'Diseño videojuegos destacado',
  personalizadosData: DEFAULT_PERSONALIZADOS,
  mayoristaData: DEFAULT_MAYORISTA,
};

function parseSalesPageContent(raw: unknown, defaults: SalesPageContent): SalesPageContent {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return defaults;
  const d = raw as Record<string, unknown>;
  return {
    eyebrow: typeof d.eyebrow === 'string' ? d.eyebrow : defaults.eyebrow,
    title: typeof d.title === 'string' ? d.title : defaults.title,
    highlight: typeof d.highlight === 'string' ? d.highlight : defaults.highlight,
    description: typeof d.description === 'string' ? d.description : defaults.description,
    primaryCta: typeof d.primaryCta === 'string' ? d.primaryCta : defaults.primaryCta,
    secondaryCta: typeof d.secondaryCta === 'string' ? d.secondaryCta : defaults.secondaryCta,
    secondaryHref: typeof d.secondaryHref === 'string' ? d.secondaryHref : defaults.secondaryHref,
    image: typeof d.image === 'string' ? d.image : defaults.image,
    imageAlt: typeof d.imageAlt === 'string' ? d.imageAlt : defaults.imageAlt,
    benefitsKicker: typeof d.benefitsKicker === 'string' ? d.benefitsKicker : defaults.benefitsKicker,
    benefitsTitle: typeof d.benefitsTitle === 'string' ? d.benefitsTitle : defaults.benefitsTitle,
    benefits: Array.isArray(d.benefits) ? d.benefits as SalesItem[] : defaults.benefits,
    pricingEnabled: typeof d.pricingEnabled === 'boolean' ? d.pricingEnabled : defaults.pricingEnabled,
    pricingTitle: typeof d.pricingTitle === 'string' ? d.pricingTitle : defaults.pricingTitle,
    pricingSubtitle: typeof d.pricingSubtitle === 'string' ? d.pricingSubtitle : defaults.pricingSubtitle,
    pricingNote: typeof d.pricingNote === 'string' ? d.pricingNote : defaults.pricingNote,
    pricingTiers: Array.isArray(d.pricingTiers) ? d.pricingTiers as PricingTier[] : defaults.pricingTiers,
    processTitle: typeof d.processTitle === 'string' ? d.processTitle : defaults.processTitle,
    process: Array.isArray(d.process) ? d.process as SalesItem[] : defaults.process,
    noteTitle: typeof d.noteTitle === 'string' ? d.noteTitle : defaults.noteTitle,
    noteText: typeof d.noteText === 'string' ? d.noteText : defaults.noteText,
  };
}

export function mergeSiteContent(content: Record<string, unknown> | null | undefined): SiteContentData {
  return {
    ...DEFAULT_SITE_CONTENT,
    ...(content || {}),
    id: (content?.id as string) || 'home',
    promoHref: (content?.promoHref as string | null) || null,
    personalizadosData: parseSalesPageContent(content?.personalizadosData, DEFAULT_PERSONALIZADOS),
    mayoristaData: parseSalesPageContent(content?.mayoristaData, DEFAULT_MAYORISTA),
  };
}
