/** Dirección pública del sitio, sin barra final (ej. https://retroremeras.com). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

/** Convierte una ruta del sitio (/assets/…) en dirección completa; deja igual las https://. */
export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`;
}
