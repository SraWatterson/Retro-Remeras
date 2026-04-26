import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Tienda temática · Buenos Aires</span>
          <h1 className="hero-title">
            Remeras con <span>estilo</span>, nostalgia y personalidad
          </h1>
          <p className="hero-text">
            En Retro Remeras mezclamos cultura pop, estética vintage y diseños con identidad. Elegí una categoría,
            encontrá tu estilo y armá tu pedido desde la página de cada producto.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/catalogo">
              Ver catálogo
            </Link>
            <Link className="btn btn-secondary" href="/carrito">
              Ver carrito
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="poster-stack">
            <article className="poster-main poster-frame poster-frame--featured">
              <img src="/assets/img/ejemplo-vintage.jpg" alt="Diseño vintage destacado" loading="eager" decoding="async" />
              <div className="poster-badge">Colecciones con impronta retro</div>
            </article>

            <div className="poster-side" aria-label="Diseños destacados">
              <article className="poster-main poster-frame">
                <img src="/assets/img/remera-goku.jpg" alt="Diseño anime destacado" loading="lazy" decoding="async" />
              </article>

              <article className="poster-main poster-frame">
                <img src="/assets/img/ejemplo-gaming.jpg" alt="Diseño videojuegos destacado" loading="lazy" decoding="async" />
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}