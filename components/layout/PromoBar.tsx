import Link from 'next/link';
import { DEFAULT_SITE_CONTENT, type SiteContentData } from '@/lib/site-content-defaults';

const PROMO_ITEMS = Array.from({ length: 8 });
const PROMO_GROUPS = Array.from({ length: 2 });

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

  const renderItem = (key: string, duplicate: boolean) => (
    <span className="promo-bar__item" key={key}>
      {promoHref ? (
        isInternalLink(promoHref) ? (
          <Link href={promoHref} tabIndex={duplicate ? -1 : undefined}>
            {itemContent}
          </Link>
        ) : (
          <a href={promoHref} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : undefined}>
            {itemContent}
          </a>
        )
      ) : (
        itemContent
      )}
    </span>
  );

  return (
    <div className="promo-bar" aria-label={promoText}>
      <div className="promo-bar__viewport">
        <div className="promo-bar__track" data-promo-track>
          {PROMO_GROUPS.map((_, groupIndex) => {
            const duplicate = groupIndex > 0;

            return (
              <div className="promo-bar__group" aria-hidden={duplicate || undefined} key={groupIndex}>
                {PROMO_ITEMS.map((_, itemIndex) => renderItem(`${groupIndex}-${itemIndex}`, duplicate))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
