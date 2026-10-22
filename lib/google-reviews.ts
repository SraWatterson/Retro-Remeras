/**
 * Reseñas de la ficha de Google de Retro Remeras.
 *
 * Si está configurada la clave GOOGLE_PLACES_API_KEY (variable de entorno en
 * Vercel), las reseñas, el promedio y el total se traen solos de Google
 * (Places API) y se renuevan cada 12 horas. Cada reseña trae su link propio
 * en Google Maps.
 * Sin clave (o si Google no responde) se usan las reseñas cargadas a mano
 * abajo, así la sección nunca queda vacía.
 *
 * Google devuelve como máximo 5 reseñas (las "más relevantes"); se combinan
 * con las cargadas a mano para no perder ninguna.
 */

export type Review = {
  name: string;
  text: string;
  rating: number;
  avatar?: string;
  photo?: string;
  photoAlt?: string;
  /** Link a la reseña en Google Maps (si no hay, va a la lista de reseñas). */
  url?: string;
};

export type ReviewsData = {
  rating: number;
  total: number;
  reviews: Review[];
  live: boolean;
};

export const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || 'ChIJg8RK1IPHvJURIl7YqvPKeXc';
export const MAPS_REVIEWS_URL =
  'https://www.google.com/maps/place/Retro+Remeras/@-34.6928604,-58.6065624,15z/data=!4m8!3m7!1s0x95bcc783d44ac483:0x7779caf3aad85e22!8m2!3d-34.6928604!4d-58.6065624!9m1!1b1!16s%2Fg%2F11yht175vp';
export const WRITE_REVIEW_URL = 'https://g.page/r/CSJe2Krzynl3EAE/review';

const G = 'https://lh3.googleusercontent.com/';

/** Reseñas cargadas a mano (copia de Google, octubre 2026). */
const MANUAL_REVIEWS: Review[] = [
  {
    name: 'Staker',
    rating: 5,
    avatar: `${G}a-/ALV-UjVLUJw4CwGpEhdIeUjahwEnNKBBoVsK5FZEDlqINpZcr494aMVw=w96-h96-p-rp-mo-br100`,
    photo: `${G}grass-cs/AABkmLfNK03WT_uASk3tjk263UWLQCGBN2I47w_jwm8Y4JTX3EEq6mMdAXPBVoRP8ya2Ge-xKDVMGDK_fqYVJ3XBUV6Tw8U3DGg15oe-pM2hArGA56NZj_v-1wi2W6prXiNL9VoFEWLFOkftcMMu=w900-h675-p-k-no`,
    photoAlt: 'Foto de un cliente con cuatro remeras negras de Retro Remeras',
    text: 'Muy buenos productos, muy buena atención, me hicieron los diseños personalizados que quería y quedaron hermosos, la calidad es buenísima, además de todo tienen buenos precios. Te hacen el diseño que vos quieras para tu remera',
  },
  {
    name: 'Agustina C.',
    rating: 5,
    avatar: `${G}a-/ALV-UjU7ZFYoxtxsxtTweau1EL7jdowGQSJUFLGNV7vhFRp0Adiup6nr=w96-h96-p-rp-mo-br100`,
    text: 'Las mejores remeras!!!! Hermosa calidad y la calidad de la estampa es tremenda!',
  },
  {
    name: 'Ezequiel B.',
    rating: 5,
    avatar: `${G}a-/ALV-UjUXDzI_FsIp8IfNeB15kGa7YxVyArWbGm_xbTlMugRCa5JGXKRa=w96-h96-p-rp-mo-br100`,
    text: 'Excelentes remeras de calidad y diseños únicos personalizables, compren que no se van a arrepentir',
  },
  {
    name: 'Margarita R.',
    rating: 5,
    text: 'Muy recomendable 👌 muy buena calidad y excelente precio y atención!!!',
  },
];

const FALLBACK: ReviewsData = { rating: 5, total: MANUAL_REVIEWS.length, reviews: MANUAL_REVIEWS, live: false };

/** "Margarita Del Valle Reynoso" → "Margarita R." (por privacidad: nombre + inicial del apellido). */
export function shortName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? '';
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const last = parts[parts.length - 1];
  return `${first} ${last.charAt(0).toUpperCase()}.`;
}

const key = (name: string) => name.trim().split(/\s+/)[0]?.toLowerCase() ?? '';

type ApiReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  googleMapsUri?: string;
  publishTime?: string;
  authorAttribution?: { displayName?: string; photoUri?: string; uri?: string };
};

export async function getGoogleReviews(): Promise<ReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return FALLBACK;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}?languageCode=es`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
      },
      // Una consulta cada 12 horas como mucho (entra en el cupo gratis de Google).
      next: { revalidate: 43200 },
    });
    if (!res.ok) throw new Error(`Places API ${res.status}`);
    const data = (await res.json()) as { rating?: number; userRatingCount?: number; reviews?: ApiReview[] };

    const fromGoogle: Review[] = (data.reviews ?? [])
      .map((r) => {
        const name = shortName(r.authorAttribution?.displayName ?? '');
        const manual = MANUAL_REVIEWS.find((m) => key(m.name) === key(name));
        return {
          name,
          rating: r.rating ?? 5,
          text: (r.originalText?.text ?? r.text?.text ?? '').trim(),
          avatar: r.authorAttribution?.photoUri
            ? `${r.authorAttribution.photoUri.split('=')[0]}=w96-h96`
            : manual?.avatar,
          // Google no devuelve las fotos de las reseñas: si la teníamos cargada, la sumamos.
          photo: manual?.photo,
          photoAlt: manual?.photoAlt,
          url: r.googleMapsUri,
          publishTime: r.publishTime,
        };
      })
      .filter((r) => r.name && r.text)
      .sort((a, b) => (b.publishTime ?? '').localeCompare(a.publishTime ?? ''))
      .map(({ publishTime: _publishTime, ...review }) => review);

    const seen = new Set(fromGoogle.map((r) => key(r.name)));
    const reviews = [...fromGoogle, ...MANUAL_REVIEWS.filter((m) => !seen.has(key(m.name)))];

    return {
      rating: data.rating ?? FALLBACK.rating,
      total: data.userRatingCount ?? reviews.length,
      reviews,
      live: true,
    };
  } catch (error) {
    console.error('[RESEÑAS] No se pudieron traer las reseñas de Google, se usan las cargadas a mano', error);
    return FALLBACK;
  }
}
