export function StepsSection() {
  return (
    <section id="como-funciona" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-kicker">Cómo funciona</span>
          <h2 className="section-title">Pedí tu remera en 3 pasos simples</h2>
          <p className="section-subtitle">Del catálogo a tu pedido por WhatsApp, sin vueltas.</p>
        </div>
        <div className="grid-3">
          <article className="info-card">
            <div className="step-number">1</div>
            <h3>Elegí un diseño</h3>
          </article>
          <article className="info-card">
            <div className="step-number">2</div>
            <h3>Seleccioná color, tipo y talle</h3>
          </article>
          <article className="info-card">
            <div className="step-number">3</div>
            <h3>Confirmá por WhatsApp</h3>
          </article>
        </div>
      </div>
    </section>
  );
}