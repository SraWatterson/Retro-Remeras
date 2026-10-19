import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicProductById } from '@/lib/product-queries';
import { productHref } from '@/lib/shop';

// Dirección vieja de las fichas (/diseno?id=...). Se mantiene para que los links
// ya compartidos y los que Google tiene guardados lleven a la URL nueva con el slug.
export const revalidate = 60;

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { id } = await searchParams;
  if (!id) notFound();

  const product = await getPublicProductById(id);
  if (!product) notFound();

  permanentRedirect(productHref(product));
}
