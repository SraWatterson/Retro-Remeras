import '../css/admin.css';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function Page() {
  return (
    <>
      <PromoBar />
      <SiteHeader active="catalogo" />
      <AdminPanel />
      <SiteFooter />
    </>
  );
}
