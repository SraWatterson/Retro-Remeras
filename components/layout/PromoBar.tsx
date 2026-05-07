import Link from 'next/link';
import { DEFAULT_SITE_CONTENT, type SiteContentData } from '@/lib/site-content-defaults';

const PROMO_ITEMS = Array.from({ length: 6 });

type Props = {
  content?: SiteContentData | null;
};

function isInternalLink(value: string) {
  return value.startsWith('/') || value.startsWith('#');
}

export function PromoBar({ content }: Props) {
  const promo = content || DEFAULT_SITE_CONTENT;
  const promoText = promo.promoText.trim() || DEFAULT_SITE_CONTENT.promoText;
  const promoHref = promo.promoHref?.trim() || '';

  if (!promo.promoEnabled) return null;

  const itemContent = (
    <>
      {promoText}
      <span aria-hidden="true">•</span>
    </>
  );

  return (
    <div className="promo-bar" aria-label={promoText}>
      <div className="promo-bar__viewport">
        <div className="promo-bar__track" data-promo-track>
          {PROMO_ITEMS.map((_, index) => (
            <span className="promo-bar__item" key={index}>
              {promoHref ? (
                isInternalLink(promoHref) ? (
                  <Link href={promoHref}>{itemContent}</Link>
                ) : (
                  <a href={promoHref} target="_blank" rel="noreferrer">
                    {itemContent}
                  </a>
                )
              ) : (
                itemContent
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
