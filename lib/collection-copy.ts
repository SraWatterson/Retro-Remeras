import { normalizeCategoryKey, normalizeCategoryName } from '@/lib/category-utils';

/**
 * Textos de cada colección (los lee Google y se ven en la página).
 * `heading` = [texto normal, palabra en dorado]. Ej.: ['Remeras de ', 'anime'].
 * Si aparece una categoría nueva que no está acá, se arma un texto genérico.
 * Sin base de datos: este archivo también lo usa el catálogo en el navegador.
 */
export type CollectionCopy = {
  seoTitle: string;
  /** Texto alternativo de la ilustración de la tarjeta (lo lee Google Imágenes). */
  imageAlt?: string;
  heading: [string, string];
  description: string;
  intro: string;
};

const COPY: Record<string, CollectionCopy> = {
  anime: {
    imageAlt:
      'Ilustración retro estilo cómic de una chica con remera de Retro Remeras leyendo manga en una terraza con faroles y un robot gigante al atardecer',
    seoTitle: 'Remeras de anime',
    heading: ['Remeras de ', 'anime'],
    description:
      'Remeras de anime estampadas en DTF: Naruto, Frieren, One Piece, Sailor Moon y más. Sin mínimo de compra y con envíos a todo el país.',
    intro:
      'Tus personajes favoritos en remeras con estampado DTF de alta definición: colores vivos, detalles finos y diseños pensados para quienes viven el anime y el manga.',
  },
  musica: {
    imageAlt:
      'Ilustración retro de una banda de rock con remeras de Retro Remeras tocando en un escenario espacial frente a un disco de vinilo gigante',
    seoTitle: 'Remeras de bandas de rock',
    heading: ['Remeras de ', 'música'],
    description:
      'Remeras de bandas de rock: AC/DC, Iron Maiden, Nirvana, Rolling Stones, KISS y más. Estampado DTF, sin mínimo de compra, envíos a todo el país.',
    intro:
      'Rock clásico, giras legendarias y portadas que marcaron época. Remeras de bandas con estética vintage y estampado DTF que aguanta el uso y los lavados.',
  },
  videojuegos: {
    imageAlt:
      'Ilustración retro de una chica gamer con remera de Retro Remeras jugando en una máquina arcade de una estación espacial',
    seoTitle: 'Remeras gamer y de videojuegos',
    heading: ['Remeras de ', 'videojuegos'],
    description:
      'Remeras gamer y de videojuegos retro: Atari, League of Legends y más. Estampado DTF de alta definición, sin mínimo de compra.',
    intro:
      'De las consolas clásicas a los juegos de hoy: remeras para gamers con diseños llenos de color y nostalgia, estampadas en DTF.',
  },
  argentina: {
    imageAlt:
      'Ilustración retro de una pareja con remeras de Retro Remeras tomando mate en una nave espacial, con el Sol de Mayo y la bandera argentina',
    seoTitle: 'Remeras argentinas',
    heading: ['Remeras ', 'argentinas'],
    description:
      'Remeras con diseños argentinos: el Sol de Mayo y más símbolos nacionales. Estampado DTF, sin mínimo de compra, envíos a todo el país.',
    intro:
      'Diseños con identidad nacional para llevar la pasión argentina en el pecho, con estampado DTF de alta definición.',
  },
  retro: {
    imageAlt:
      'Ilustración retro de un diner espacial de los años 50 con una moza en patines y clientes con remeras de Retro Remeras',
    seoTitle: 'Remeras retro y vintage',
    heading: ['Remeras ', 'retro'],
    description:
      'Remeras retro y vintage con estética de los 70, 80 y 90. Estampado DTF de alta definición, sin mínimo de compra y envíos a todo el país.',
    intro:
      'Cartelería, colores cálidos y tipografías con historia: remeras con espíritu vintage para quienes tienen buen gusto y memoria.',
  },
  futbol: {
    imageAlt:
      'Ilustración retro de jugadores de fútbol con remeras de Retro Remeras en una cancha en la Luna, con una hinchada de extraterrestres',
    seoTitle: 'Remeras de fútbol',
    heading: ['Remeras de ', 'fútbol'],
    description:
      'Remeras de fútbol con clásicos, ídolos y mística de cancha. Estampado DTF, sin mínimo de compra y envíos a todo el país.',
    intro: 'Clásicos, ídolos y momentos épicos del fútbol en remeras con estampado DTF de alta definición.',
  },
  cine: {
    imageAlt:
      'Ilustración retro de un autocine en Marte con parejas en autos clásicos y remeras de Retro Remeras mirando una película',
    seoTitle: 'Remeras de películas y cine',
    heading: ['Remeras de ', 'cine'],
    description:
      'Remeras de películas: pósters, VHS, clásicos de culto y referencias que se entienden. Estampado DTF, sin mínimo de compra.',
    intro: 'Pósters, VHS y películas de culto convertidos en remeras con estampado DTF de alta definición.',
  },
  variados: {
    imageAlt:
      'Ilustración retro de una feria espacial con pósters vintage, casetes, robots de juguete y remeras de Retro Remeras',
    seoTitle: 'Remeras con diseños variados',
    heading: ['Remeras ', 'variadas'],
    description:
      'Remeras con diseños variados: cultura urbana, conceptos visuales y diseños únicos. Estampado DTF, sin mínimo de compra.',
    intro: 'Cultura urbana, conceptos visuales y diseños sueltos que no entran en ninguna caja, con estampado DTF.',
  },
};

export function collectionSlug(category: string) {
  return normalizeCategoryKey(normalizeCategoryName(category)).replace(/\s+/g, '-');
}

export function collectionHref(category: string) {
  return `/coleccion/${collectionSlug(category)}`;
}

export function collectionCopy(category: string): CollectionCopy {
  const name = normalizeCategoryName(category);
  return (
    COPY[collectionSlug(category)] ?? {
      seoTitle: `Remeras ${name}`,
      heading: ['Remeras ', name],
      description: `Remeras ${name} estampadas en DTF de alta definición. Sin mínimo de compra y con envíos a todo el país.`,
      intro: `Diseños ${name} en remeras con estampado DTF de alta definición.`,
    }
  );
}

/** "Remeras de anime" en texto plano (para links y títulos sin dorado). */
export function collectionName(category: string) {
  return collectionCopy(category).heading.join('');
}
