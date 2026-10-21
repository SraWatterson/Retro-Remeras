import { FaGoogle, FaStar } from 'react-icons/fa';
import { ReviewPhoto } from './ReviewPhoto';

import { getGoogleReviews, MAPS_REVIEWS_URL, WRITE_REVIEW_URL } from '@/lib/google-reviews';

/**
 * Reseñas de Google (se actualizan solas si está la clave de Google; ver lib/google-reviews.ts).
 * Ojo: NO llevan datos estructurados de "rating" para Google: sus reglas no
 * permiten mostrar como estrellas propias las reseñas que vienen de otro sitio.
 */
function Stars({ value = 5 }: { value?: number }) {
  const full = Math.round(value);
  return (
    <span className="rv__stars" aria-label={`${full} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} aria-hidden="true" className={i < full ? undefined : 'rv__star--off'} />
      ))}
    </span>
  );
}

export async function ReviewsSection() {
  const { rating, total, reviews } = await getGoogleReviews();
  // Con pocas reseñas se repiten para llenar la cinta en pantallas anchas.
  const loop = reviews.length < 6 ? [...reviews, ...reviews] : reviews;
  const ratingText = rating.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <section id="resenas" className="section rv-section" aria-labelledby="rv-title">
      <div className="container">
        <div className="rv__head">
          <span className="rv__kicker">Reseñas en Google</span>
          <h2 id="rv-title" className="rv__title">
            Lo que dicen <span>los que ya tienen la suya</span>
          </h2>
          <p className="rv__score">
            <strong>{ratingText}</strong>
            <Stars value={rating} />
            <span>
              {total} reseña{total === 1 ? '' : 's'} en <FaGoogle aria-hidden="true" /> Google
            </span>
          </p>
        </div>

        {/* Cinta que se desliza sola; frena al pasar el mouse (o al tocarla).
            Las reseñas se repiten para que la cinta no tenga fin. */}
        <div className="rv__marquee">
          <div className="rv__track">
            {[0, 1].map((copy) => (
              <ul key={copy} className="rv__list" aria-hidden={copy === 1 ? true : undefined}>
                {loop.map((review, index) => (
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
                    <Stars value={review.rating} />
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
                    {/* Toda la tarjeta lleva a esa reseña en Google. */}
                    <a
                      className="rv__overlay"
                      href={review.url || MAPS_REVIEWS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ver la reseña de ${review.name} en Google`}
                      tabIndex={copy === 1 ? -1 : undefined}
                    />
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
