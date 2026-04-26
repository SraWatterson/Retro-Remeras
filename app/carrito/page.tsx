import { CartView } from '@/components/cart/CartView';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function Page() {
  return (
    <>
      <PromoBar />
      <SiteHeader active="carrito" />
      <CartView />
      <SiteFooter />
    </>
  );
}
