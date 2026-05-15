import { prisma } from '@/lib/prisma';
import { DEFAULT_SITE_CONTENT, mergeSiteContent, type SiteContentData } from '@/lib/site-content-defaults';

export { DEFAULT_SITE_CONTENT, mergeSiteContent, type SiteContentData } from '@/lib/site-content-defaults';

export async function getSiteContent(): Promise<SiteContentData> {
  try {
    const content = await prisma.siteContent.upsert({
      where: { id: 'home' },
      update: {},
      create: { id: 'home' },
    });

    return mergeSiteContent(content as unknown as Record<string, unknown>);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[SITE_CONTENT] No se pudo cargar contenido visual: ${message}`);
    return DEFAULT_SITE_CONTENT;
  }
}
