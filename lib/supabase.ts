import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const STORAGE_BUCKETS = {
  products: 'products',
  home: 'home',
  categories: 'home',
  pages: 'home',
} as const;

export type UploadContext = keyof typeof STORAGE_BUCKETS;

export function getPublicUrl(bucket: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  try {
    const marker = '/storage/v1/object/public/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const rest = url.slice(idx + marker.length);
    const slashIdx = rest.indexOf('/');
    if (slashIdx === -1) return null;
    return { bucket: rest.slice(0, slashIdx), path: rest.slice(slashIdx + 1) };
  } catch {
    return null;
  }
}
