import Link from 'next/link';
import { Fragment } from 'react';
import { FAQ_ITEMS, isFaqPending } from '@/lib/faq';

/** Resalta los datos que faltan completar ([así]) para que no pasen desapercibidos. */
function renderAnswer(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((part, index) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={index} className="faq__todo">
        {part.slice(1, -1)}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );
}

/**
 * Preguntas frecuentes. Acordeón nativo (<details>): funciona sin JavaScript
 * y Google lee todas las respuestas aunque estén cerradas.
 */
export function FaqSection() {
  const ready = FAQ_ITEMS.filter((item) => !isFaqPending(item));
  const ldFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ready.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section id="preguntas" className="section faq-section" aria-labelledby="faq-title">
      {ready.length ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }} />
      ) : null}
      <div className="container">
        <div className="faq">
          <div className="faq__head">
            <span className="faq__kicker">Preguntas frecuentes</span>
            <h2 id="faq-title" className="faq__title">
              Antes de pedir<span>.</span>
            </h2>
            <p className="faq__lead">Lo que más nos preguntan. Si no está acá, escribinos por WhatsApp.</p>
          </div>

          <div className="faq__list">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="faq__item">
                <summary>
                  <span>{item.question}</span>
                  <i aria-hidden="true" />
                </summary>
                <div className="faq__answer">
                  <p>{renderAnswer(item.answer)}</p>
                  {item.link ? (
                    <Link className="faq__link" href={item.link.href}>
                      {item.link.label} <span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
