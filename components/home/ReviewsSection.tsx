import { FaGoogle, FaStar } from 'react-icons/fa';

/**
 * Reseñas reales de Google Maps (copiadas de la ficha de Retro Remeras).
 * Ojo: NO llevan datos estructurados de "rating" para Google: sus reglas no
 * permiten mostrar como estrellas propias las reseñas que vienen de otro sitio.
 * Para sumar una nueva, agregala a la lista tal cual está en Google.
 */
const REVIEWS = [
  {
    name: 'Staker',
    text: 'Muy buenos productos, muy buena atención, me hicieron los diseños personalizados que quería y quedaron hermosos, la calidad es buenísima, además de todo tienen buenos precios. Te hacen el diseño que vos quieras para tu remera',
  },
  {
    name: 'Agustina C.',
    text: 'Las mejores remeras!!!! Hermosa calidad y la calidad de la estampa es tremenda!',
  },
  {
    name: 'Ezequiel B.',
    text: 'Excelentes remeras de calidad y diseños únicos personalizables, compren que no se van a arrepentir',
  },
  {
    name: 'Margarita R.',
    text: 'Muy recomendable 👌 muy buena calidad y excelente precio y atención!!!',
  },
];

const RATING = '5,0';
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

        <ul className="rv__grid">
          {REVIEWS.map((review) => (
            <li key={review.name} className="rv__card">
              <Stars />
              <blockquote>“{review.text}”</blockquote>
              <span className="rv__author">
                <span className="rv__avatar" aria-hidden="true">
                  {review.name.charAt(0)}
                </span>
                {review.name}
              </span>
            </li>
          ))}
        </ul>

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
