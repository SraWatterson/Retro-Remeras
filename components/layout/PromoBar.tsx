const PROMO_TEXT = 'LLEVANDO 3 PRODUCTOS TENÉS 5% DE DESCUENTO';
const PROMO_ITEMS = Array.from({ length: 6 });

export function PromoBar() {
  return (
    <div className="promo-bar" aria-label={PROMO_TEXT}>
      <div className="promo-bar__viewport">
        <div className="promo-bar__track" data-promo-track>
          {PROMO_ITEMS.map((_, index) => (
            <span className="promo-bar__item" key={index}>
              {PROMO_TEXT}
              <span aria-hidden="true">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
