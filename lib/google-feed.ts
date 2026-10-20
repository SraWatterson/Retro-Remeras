import { normalizeImageUrl, productHref, type Product } from '@/lib/shop';
import { absoluteUrl } from '@/lib/site-url';

function xml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // caracteres de control que rompen el XML
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

function plain(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

const COLOR_NAMES: Record<string, string> = { negro: 'Negro', blanco: 'Blanco' };

export function buildGoogleFeed(products: Product[]) {
  const items = products.flatMap((product) => {
    const link = absoluteUrl(productHref(product));
    const colors = Object.entries(product.imagenesPorColor ?? {}).filter(([, c]) => c?.path);
    const variants = colors.length
      ? colors.map(([slug, c]) => ({
          id: `${product.slug}-${slug}`,
          color: c.colorName || COLOR_NAMES[slug] || slug,
          image: c.path,
          link: `${link}?color=${encodeURIComponent(slug)}`,
        }))
      : [{ id: product.slug, color: '', image: product.imagen ?? '', link }];

    const description = plain(product.descripcion || product.nombre, 4900);
    const extraImages = colors.map(([, c]) => c.path);

    return variants.map((variant) => {
      const others = extraImages.filter((path) => path !== variant.image).slice(0, 5);
      const title = plain(variant.color && variants.length > 1 ? `${product.nombre} ${variant.color}` : product.nombre, 150);
      return `    <item>
      <g:id>${xml(variant.id)}</g:id>
      <g:title>${xml(title)}</g:title>
      <g:description>${xml(description)}</g:description>
      <g:link>${xml(variant.link)}</g:link>
      <g:image_link>${xml(absoluteUrl(normalizeImageUrl(variant.image || product.imagen)))}</g:image_link>
${others.map((path) => `      <g:additional_image_link>${xml(absoluteUrl(normalizeImageUrl(path)))}</g:additional_image_link>`).join('\n')}
      <g:availability>${product.disponible ? 'in_stock' : 'preorder'}</g:availability>
      <g:price>${product.precio} ARS</g:price>
      <g:condition>new</g:condition>
      <g:brand>Retro Remeras</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>212</g:google_product_category>
      <g:product_type>${xml(`Remeras > ${product.categoria}`)}</g:product_type>
      <g:gender>unisex</g:gender>
      <g:age_group>adult</g:age_group>
${variant.color ? `      <g:color>${xml(variant.color)}</g:color>\n` : ''}${variants.length > 1 ? `      <g:item_group_id>${xml(product.slug)}</g:item_group_id>\n` : ''}    </item>`.replace(/\n\n/g, '\n');
    });
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Retro Remeras</title>
    <link>${absoluteUrl('/')}</link>
    <description>Remeras estampadas en DTF: anime, rock, fútbol, cine y videojuegos.</description>
${items.join('\n')}
  </channel>
</rss>
`;

  return body;
}
