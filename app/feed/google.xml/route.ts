import { getPublicProducts } from '@/lib/product-queries';
import { buildGoogleFeed } from '@/lib/google-feed';

/**
 * Catálogo para Google Merchant Center (pestaña Shopping y fichas gratuitas).
 * Se carga en Merchant Center como "archivo programado" con esta dirección:
 *   https://retroremeras.com/feed/google.xml
 * Una fila por remera y color; los colores de una misma remera se agrupan
 * (item_group_id) para que Google los muestre como variantes.
 * Se regenera cada hora: las remeras nuevas aparecen solas.
 */
export const revalidate = 3600;

export async function GET() {
  const products = await getPublicProducts();
  return new Response(buildGoogleFeed(products), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

