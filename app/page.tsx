import Link from 'next/link';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function Page() {
  return (
    <>
      <PromoBar />
      <SiteHeader active="inicio" />

      <main>
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
              </div>
            </div>
          </div>
        </section>

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

        <FeaturedProducts />
      </main>

      <SiteFooter />
    </>
  );
}
