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
  description: '¿Tenés una foto, una frase o una idea dando vueltas en la cabeza? La convertimos en tu remera, desde una sola unidad. Nos la mandás por WhatsApp y nosotros nos encargamos del resto.',
  primaryCta: 'Enviar diseño por WhatsApp',
  secondaryCta: 'Ver remeras',
  secondaryHref: '/productos',
  image: '/assets/pets/Postales_1_4.webp',
  imageAlt: 'Ilustración retro de una chica astronauta con remera negra de Retro Remeras',
  benefitsKicker: 'Sin vueltas',
  benefitsTitle: 'Tu idea, estampada como corresponde',
  benefits: [
    { title: 'Desde 1 unidad', text: 'Una sola remera, sin packs ni mínimos. Ideal para regalar, para un cumple o para darte un gusto.' },
    { title: 'Tu diseño o tu frase', text: 'Mandanos una imagen, un dibujo, una frase o una referencia y armamos la estampa con vos.' },
    { title: 'DTF de alta definición', text: 'Colores sin límite y detalles finos: lo que imagines, impreso con nitidez.' },
    { title: 'Cuidado en cada remera', text: 'La misma dedicación en cada pedido, aunque sea una sola unidad.' },
  ],
  ...NO_PRICING,
  processTitle: 'Cómo pedís tu personalizada',
  process: [
    { title: 'Mandanos tu idea', text: 'Nos pasás la imagen, la frase o la referencia por WhatsApp.' },
    { title: 'Definimos detalles', text: 'Coordinamos talle, color, ubicación de la estampa y disponibilidad.' },
    { title: 'La producimos', text: 'Estampamos en DTF de alta definición y revisamos cada detalle antes de entregarla.' },
    { title: 'Coordinamos la entrega', text: 'Acordamos retiro, envío y forma de pago, sin vueltas.' },
  ],
  noteTitle: '100% vos',
  noteText: 'No necesitás comprar un pack entero para tener esa remera que tenés en la cabeza.',
};

export const DEFAULT_MAYORISTA: SalesPageContent = {
  eyebrow: 'Mayorista',
  title: 'Producción para',
  highlight: 'crecer',
  description: 'Remeras por cantidad para empresas, institutos, equipos, eventos, merchandising, emprendimientos y revendedores. Tu logo o tu diseño, estampado en DTF de alta definición.',
  primaryCta: 'Pedir presupuesto mayorista',
  secondaryCta: 'Ver remeras',
  secondaryHref: '/productos',
  image: '/assets/pets/Postales_1_5.webp',
  imageAlt: 'Ilustración retro de un explorador espacial con remera negra de Retro Remeras',
  benefitsKicker: 'Para tu negocio',
  benefitsTitle: 'Pensado para pedidos por volumen',
  benefits: [
    { title: 'Precios por cantidad', text: 'Cotizamos según volumen, diseño y tiempos de producción para que tu proyecto cierre por todos lados.' },
    { title: 'Para todo tipo de proyecto', text: 'Empresas, institutos, egresados, uniformes, eventos, merch, equipos, revendedores y emprendimientos.' },
    { title: 'Diseños a medida', text: 'Trabajamos con tu logo, tus frases, tu identidad visual o tus referencias.' },
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
  noteText: 'Queremos ser el aliado de tu marca, tu equipo o tu evento: atención cercana y la misma calidad en la remera 1 y en la 100.',
};

export const DEFAULT_SITE_CONTENT: SiteContentData = {
  id: 'home',
  promoEnabled: true,
  promoText: 'LLEVANDO 3 PRODUCTOS TENÉS 5% DE DESCUENTO',
  promoHref: null,
  heroEyebrow: 'Estampado DTF · Zona Oeste, Buenos Aires',
  heroTitlePrefix: 'Remeras con',
  heroTitleAccent: 'nostalgia',
  heroTitleSuffix: 'y personalidad',
  heroText:
    'Anime, rock, videojuegos y cultura pop estampados en DTF de alta definición. Elegí tu diseño y tu talle, y confirmá por WhatsApp: sin mínimo de compra y con envíos a todo el país.',
  heroPrimaryButtonText: 'Ver remeras',
  heroPrimaryButtonHref: '/productos',
  heroSecondaryButtonText: 'Cómo funciona',
  heroSecondaryButtonHref: '#como-comprar',
  heroMainImage: '/assets/img/ejemplo-vintage.jpg',
  heroMainImageAlt: 'Diseño vintage destacado',
  heroBadgeText: 'Cultura pop con impronta retro',
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
