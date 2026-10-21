import { FaGoogle, FaStar } from 'react-icons/fa';
import { ReviewPhoto } from './ReviewPhoto';

/**
 * Reseñas reales de Google Maps (copiadas de la ficha de Retro Remeras).
 * Ojo: NO llevan datos estructurados de "rating" para Google: sus reglas no
 * permiten mostrar como estrellas propias las reseñas que vienen de otro sitio.
 * Para sumar una nueva, agregala a la lista tal cual está en Google.
 */
type Review = { name: string; text: string; avatar?: string; photo?: string; photoAlt?: string };

const REVIEWS: Review[] = [
  {
    name: 'Staker',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjVLUJw4CwGpEhdIeUjahwEnNKBBoVsK5FZEDlqINpZcr494aMVw=w96-h96-p-rp-mo-br100',
    photo:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLfNK03WT_uASk3tjk263UWLQCGBN2I47w_jwm8Y4JTX3EEq6mMdAXPBVoRP8ya2Ge-xKDVMGDK_fqYVJ3XBUV6Tw8U3DGg15oe-pM2hArGA56NZj_v-1wi2W6prXiNL9VoFEWLFOkftcMMu=w900-h675-p-k-no',
    photoAlt: 'Foto de un cliente con cuatro remeras negras de Retro Remeras',
    text: 'Muy buenos productos, muy buena atención, me hicieron los diseños personalizados que quería y quedaron hermosos, la calidad es buenísima, además de todo tienen buenos precios. Te hacen el diseño que vos quieras para tu remera',
  },
  {
    name: 'Agustina C.',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjU7ZFYoxtxsxtTweau1EL7jdowGQSJUFLGNV7vhFRp0Adiup6nr=w96-h96-p-rp-mo-br100',
    text: 'Las mejores remeras!!!! Hermosa calidad y la calidad de la estampa es tremenda!',
  },
  {
    name: 'Ezequiel B.',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjUXDzI_FsIp8IfNeB15kGa7YxVyArWbGm_xbTlMugRCa5JGXKRa=w96-h96-p-rp-mo-br100',
    text: 'Excelentes remeras de calidad y diseños únicos personalizables, compren que no se van a arrepentir',
  },
  {
    name: 'Margarita R.',
    text: 'Muy recomendable 👌 muy buena calidad y excelente precio y atención!!!',
  },
];

const RATING = '5,0';
// Con pocas reseñas se repiten para llenar la cinta en pantallas anchas.
const LOOP = [...REVIEWS, ...REVIEWS];
const TOTAL = REVIEWS.length;
const MAPS_REVIEWS_URL =
  'https://www.google.com/maps/place/Retro+Remeras/@-34.6928604,-58.6065624,15z/data=!4m8!3m7!1s0x95bcc783d44ac483:0x7779caf3aad85e22!8m2!3d-34.6928604!4d-58.6065624!9m1!1b1!16s%2Fg%2F11yht175vp';
const WRITE_REVIEW_URL = 'https://g.page/r/CSJe2Krzynl3EAE/review';

function Stars() {
  return (
    <span className="rv__stars" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} aria-hidden="true" />
      ))}
    </span>
  );
}

export function ReviewsSection() {
  return (
    <section id="resenas" className="section rv-section" aria-labelledby="rv-title">
      <div className="container">
        <div className="rv__head">
          <span className="rv__kicker">Reseñas en Google</span>
          <h2 id="rv-title" className="rv__title">
            Lo que dicen <span>los que ya tienen la suya</span>
          </h2>
          <p className="rv__score">
            <strong>{RATING}</strong>
            <Stars />
            <span>
              {TOTAL} reseñas en <FaGoogle aria-hidden="true" /> Google
            </span>
          </p>
        </div>

        {/* Cinta que se desliza sola; frena al pasar el mouse (o al tocarla).
            Las reseñas se repiten para que la cinta no tenga fin. */}
        <div className="rv__marquee">
          <div className="rv__track">
            {[0, 1].map((copy) => (
              <ul key={copy} className="rv__list" aria-hidden={copy === 1 ? true : undefined}>
                {LOOP.map((review, index) => (
                  <li key={`${copy}-${index}`} className={`rv__card${review.photo ? ' rv__card--photo' : ''}`}>
                    {review.photo ? (
                      <ReviewPhoto
                        src={review.photo}
                        alt={review.photoAlt || `Foto de la reseña de ${review.name}`}
                        width={900}
                        height={675}
                        sizes="(max-width: 599px) 90vw, (max-width: 1023px) 45vw, 280px"
                        className="rv__photo"
                      />
                    ) : null}
                    <Stars />
                    <blockquote>“{review.text}”</blockquote>
                    <span className="rv__author">
                      <ReviewPhoto
                        src={review.avatar}
                        alt=""
                        width={64}
                        height={64}
                        sizes="32px"
                        className="rv__avatar rv__avatar--img"
                        fallback={
                          <span className="rv__avatar" aria-hidden="true">
                            {review.name.charAt(0)}
                          </span>
                        }
                      />
                      {review.name}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="rv__actions">
          <a className="btn btn-secondary" href={MAPS_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
            Ver todas en Google
          </a>
          <a className="btn btn-primary" href={WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
            Dejá tu reseña
          </a>
        </div>
      </div>
    </section>
  );
}
