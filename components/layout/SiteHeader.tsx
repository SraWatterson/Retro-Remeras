'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cartGetItemsCount, cartLoad, subscribeToCartUpdates } from '@/lib/shop';

type Props = {
  active: 'inicio' | 'catalogo' | 'carrito';
};

export function SiteHeader({ active }: Props) {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(cartGetItemsCount(cartLoad()));
    const unsubscribe = subscribeToCartUpdates((items) => {
      setCartCount(cartGetItemsCount(items));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      document.body.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('nav-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <header className="topbar">
      <div className="container navbar">
        <Link className="brand" href="/" aria-label="Ir al inicio de Retro Remeras">
          <Image src="/assets/logo/icono-banner.png" alt="Retro Remeras" width={56} height={56} sizes="56px" priority />
        </Link>

        <button
          className={`menu-toggle ${open ? 'is-open' : ''}`}
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span />
        </button>

        <div className={`nav-mobile-panel ${open ? 'is-open' : ''}`} data-nav-mobile-panel>
          <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Navegación principal" data-nav-links>
            <Link className={active === 'inicio' ? 'is-active' : ''} href="/" onClick={() => setOpen(false)}>
              Inicio
            </Link>
            <Link className={active === 'catalogo' ? 'is-active' : ''} href="/catalogo" onClick={() => setOpen(false)}>
              Catálogo
            </Link>
            <Link href="/#como-funciona" onClick={() => setOpen(false)}>
              Cómo funciona
            </Link>
            <Link href="/#ubicacion" onClick={() => setOpen(false)}>
              Ubicación
            </Link>
          </nav>

          <div className={`nav-cta ${open ? 'is-open' : ''}`} data-nav-cta>
            <Link className="nav-cart-icon-btn" href="/carrito" aria-label="Ver carrito" onClick={() => setOpen(false)}>
              <Image src="/assets/icons/carrito-de-compras.png" alt="" className="nav-cart-icon" width={28} height={28} />
              <span className="nav-cart-badge nav-cart-badge--icon" data-global-cart-count>
                {cartCount}
              </span>
            </Link>

            <Link className={`btn btn-primary ${active === 'catalogo' ? 'is-active' : ''}`} href="/catalogo" onClick={() => setOpen(false)}>
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
