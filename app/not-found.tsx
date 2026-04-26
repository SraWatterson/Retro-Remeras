import Link from 'next/link';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function NotFound() {
  return (
    <>
      <PromoBar />
      <SiteHeader active="inicio" />

      <main className="not-found-page">
        <section className="section">
          <div className="container">
            <div className="not-found-card">
              <span className="section-kicker">Ups...</span>
              <h1 className="section-title">No encontramos esa página</h1>
              <p className="section-subtitle">
                Tal vez el enlace está roto o el producto ya no existe. Tranquilo, podés volver al inicio o explorar el catálogo.
              </p>
              <div className="hero-actions not-found-actions">
                <Link className="btn btn-primary" href="/">
                  Ir al inicio
                </Link>
                <Link className="btn btn-secondary" href="/catalogo">
                  Ver catálogo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
