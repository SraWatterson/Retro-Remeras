import '../css/admin.css';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getSiteContent } from '@/lib/site-content';

export const revalidate = 60;

export default async function Page() {
  const siteContent = await getSiteContent();

  return (
    <>
      <PromoBar content={siteContent} />
      <SiteHeader active="catalogo" />
      <AdminPanel />
      <SiteFooter />
    </>
  );
}
