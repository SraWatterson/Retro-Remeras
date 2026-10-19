import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../css/catalogo.css';
import '../../css/coleccion.css';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getCollection, getCollections } from '@/lib/collections';
import { formatPrice, normalizeImageUrl, productHref } from '@/lib/shop';
import { getSiteContent } from '@/lib/site-content';

export const revalidate = 60;

/** Colecciones armadas de antemano: abren al instante (se actualizan cada 60 s). */
export async function generateStaticParams() {
  try {
    const collections = await getCollections();
    return collections.map((collection) => ({ slug: collection.slug }));
  } catch {
    return [];
  }
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

function absolute(url: string) {
  return url.startsWith('http') ? url : `${BASE}${url}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollection(slug);
  if (!data) return {};

  const { collection, products } = data;
  const title = `${collection.copy.seoTitle} | Retro Remeras`;
  const cover = products.find((product) => product.imagen);

  return {
    title,
    description: collection.copy.description,
    alternates: { canonical: collection.href },
    // Sin remeras todavía: la página existe pero Google no la indexa hasta que tenga alguna.
    robots: products.length ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description: collection.copy.description,
      url: collection.href,
      type: 'website',
      images: cover
        ? [{ url: absolute(normalizeImageUrl(cover.imagen)), alt: cover.imagenAlt?.trim() || cover.nombre }]
        : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const [data, collections, siteContent] = await Promise.all([getCollection(slug), getCollections(), getSiteContent()]);

  if (!data) notFound();

  const { collection, products } = data;
  const others = collections.filter((item) => item.slug !== collection.slug);
  const url = `${BASE}${collection.href}`;
  const [headingStart, headingAccent] = collection.copy.heading;
  const heading = headingStart + headingAccent;

  const ldCollection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: heading,
    description: collection.copy.description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${BASE}${productHref(product)}`,
        name: product.nombre,
      })),
    },
  };

  const ldBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Remeras', item: `${BASE}/productos` },
      { '@type': 'ListItem', position: 3, name: heading, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldCollection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }} />
      <PromoBar content={siteContent} />
      <SiteHeader active="catalogo" />

      <main className="catalog-main coleccion-page">
        <section className="coleccion-hero">
          <div className="container">
            <nav className="coleccion-crumbs" aria-label="Estás en">
              <Link href="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <Link href="/productos">Remeras</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{collection.category}</span>
            </nav>
            <h1 className="coleccion-title">
              {headingStart}
              <span>{headingAccent}</span>
            </h1>
            <p className="coleccion-intro">{collection.copy.intro}</p>
            <p className="coleccion-count">
              {products.length
                ? `${products.length} ${products.length === 1 ? 'diseño' : 'diseños'} · `
                : ''}
              Sin mínimo de compra · Envíos a todo el país
            </p>
          </div>
        </section>

        <section className="catalog-section" aria-label={`Remeras de la colección ${collection.category}`}>
          <div className="container">
            {!products.length ? (
              <div className="coleccion-empty">
                <span className="coleccion-empty__kicker">Muy pronto</span>
                <p>Estamos preparando los diseños de esta colección. Mientras tanto, mirá las otras o pedí el tuyo personalizado.</p>
                <div className="coleccion-empty__actions">
                  <Link className="btn btn-primary" href="/personalizados">
                    Pedir uno personalizado
                  </Link>
                  <Link className="btn btn-secondary" href="/productos">
                    Ver todas las remeras
                  </Link>
                </div>
              </div>
            ) : null}
            <div className="catalog-grid coleccion-grid">
              {products.map((product) => (
                <article className="product-card product-card--linked" key={product.id}>
                  <Link className="product-card-link" href={productHref(product)} aria-label={`Ver ${product.nombre}`}>
                    <div className="product-media">
                      <Image
                        src={normalizeImageUrl(product.imagen)}
                        alt={product.imagenAlt?.trim() || product.nombre}
                        width={800}
                        height={1000}
                        quality={75}
                        sizes="(max-width: 767px) 46vw, (max-width: 1199px) 30vw, 280px"
                      />
                      {product.destacado ? <span className="cat-visual__badge">Destacado</span> : null}
                    </div>
                  </Link>
                  <div className="product-content">
                    <h2 className="product-title">
                      <Link className="product-title-link" href={productHref(product)}>
                        {product.nombre}
                      </Link>
                    </h2>
                    <div className="price-row">
                      <span className="product-price">{formatPrice(product.precio)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {others.length ? (
          <section className="coleccion-others" aria-label="Otras colecciones">
            <div className="container">
              <span className="coleccion-others__label">Otras colecciones</span>
              <ul>
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link href={item.href}>
                      {item.copy.heading.join('')}
                      {item.count ? <small>{item.count}</small> : null}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/productos">Ver todas las remeras</Link>
                </li>
              </ul>
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}
