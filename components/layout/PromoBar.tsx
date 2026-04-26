export function PromoBar() {
  const text = 'LLEVANDO 3 PRODUCTOS TENÉS 5% DE DESCUENTO';

  return (
    <div className="promo-bar">
      <div className="promo-bar__viewport">
        <div className="promo-bar__track" data-promo-track>
          <span>{text}</span>
          <span>•</span>
          <span>{text}</span>
          <span>•</span>
          <span>{text}</span>
          <span>•</span>
          <span>{text}</span>
          <span>•</span>
        </div>
      </div>
    </div>
  );
}
