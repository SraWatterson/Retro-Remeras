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
      'Tus personajes favoritos, del shōnen de culto al anime que te marcó en los 90. Estampas con trazo de manga, colores vivos y detalles para mirar de cerca.',
  },
  musica: {
    imageAlt:
      'Ilustración retro de una banda de rock con remeras de Retro Remeras tocando en un escenario espacial frente a un disco de vinilo gigante',
    seoTitle: 'Remeras de bandas de rock',
    heading: ['Remeras de ', 'música'],
    description:
      'Remeras de bandas de rock: AC/DC, Iron Maiden, Nirvana, Rolling Stones, KISS y más. Estampado DTF, sin mínimo de compra, envíos a todo el país.',
    intro:
      'Discos que te cambiaron la vida, giras legendarias y bandas que se escuchan al palo. Remeras de rock con estética vintage, para el recital o para todos los días.',
  },
  videojuegos: {
    imageAlt:
      'Ilustración retro de una chica gamer con remera de Retro Remeras jugando en una máquina arcade de una estación espacial',
    seoTitle: 'Remeras gamer y de videojuegos',
    heading: ['Remeras de ', 'videojuegos'],
    description:
      'Remeras gamer y de videojuegos retro: Atari, League of Legends y más. Estampado DTF de alta definición, sin mínimo de compra.',
    intro:
      'De los arcades y las consolas de los 80 a los juegos que jugás hoy. Remeras gamer con color, nostalgia y algún que otro guiño para iniciados.',
  },
  argentina: {
    imageAlt:
      'Ilustración retro de una pareja con remeras de Retro Remeras tomando mate en una nave espacial, con el Sol de Mayo y la bandera argentina',
    seoTitle: 'Remeras argentinas',
    heading: ['Remeras ', 'argentinas'],
    description:
      'Remeras con diseños argentinos: el Sol de Mayo y más símbolos nacionales. Estampado DTF, sin mínimo de compra, envíos a todo el país.',
    intro:
      'El Sol de Mayo, el celeste y blanco y todo lo que nos hace argentinos, en diseños urbanos para llevar lo nuestro todos los días.',
  },
  retro: {
    imageAlt:
      'Ilustración retro de un diner espacial de los años 50 con una moza en patines y clientes con remeras de Retro Remeras',
    seoTitle: 'Remeras retro y vintage',
    heading: ['Remeras ', 'retro'],
    description:
      'Remeras retro y vintage con estética de los 70, 80 y 90. Estampado DTF de alta definición, sin mínimo de compra y envíos a todo el país.',
    intro:
      'Neón, cartelería, autos de otra época y tipografías con historia. Remeras con espíritu vintage para quienes tienen buen gusto y buena memoria.',
  },
  futbol: {
    imageAlt:
      'Ilustración retro de jugadores de fútbol con remeras de Retro Remeras en una cancha en la Luna, con una hinchada de extraterrestres',
    seoTitle: 'Remeras de fútbol',
    heading: ['Remeras de ', 'fútbol'],
    description:
      'Remeras de fútbol con clásicos, ídolos y mística de cancha. Estampado DTF, sin mínimo de compra y envíos a todo el país.',
    intro:
      'Ídolos, camisetas que hicieron historia y la mística de la cancha. Remeras para vivir el fútbol también fuera del estadio.',
  },
  cine: {
    imageAlt:
      'Ilustración retro de un autocine en Marte con parejas en autos clásicos y remeras de Retro Remeras mirando una película',
    seoTitle: 'Remeras de películas y cine',
    heading: ['Remeras de ', 'cine'],
    description:
      'Remeras de películas: pósters, VHS, clásicos de culto y referencias que se entienden. Estampado DTF, sin mínimo de compra.',
    intro:
      'Pósters de culto, VHS gastados y películas que viste mil veces. Remeras para cinéfilos de alma.',
  },
  variados: {
    imageAlt:
      'Ilustración retro de una feria espacial con pósters vintage, casetes, robots de juguete y remeras de Retro Remeras',
    seoTitle: 'Remeras con diseños variados',
    heading: ['Remeras ', 'variadas'],
    description:
      'Remeras con diseños variados: cultura urbana, conceptos visuales y diseños únicos. Estampado DTF, sin mínimo de compra.',
    intro:
      'Cultura urbana, conceptos visuales y diseños que no entran en ninguna caja. Para los que no se casan con un solo estilo.',
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
