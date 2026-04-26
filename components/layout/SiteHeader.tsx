'use client';

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

  return (
    <header className="topbar">
      <div className="container navbar">
        <Link className="brand" href="/" aria-label="Ir al inicio de Retro Remeras">
          <img src="/assets/logo/icono-banner.png" alt="Retro Remeras" decoding="async" />
        </Link>

        <button
          className={`menu-toggle ${open ? 'is-open' : ''}`}
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span />
        </button>

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
          <Link href="/#beneficios" onClick={() => setOpen(false)}>
            Beneficios
          </Link>
        </nav>

        <div className={`nav-cta ${open ? 'is-open' : ''}`} data-nav-cta>
          <Link className="nav-cart-icon-btn" href="/carrito" aria-label="Ver carrito" onClick={() => setOpen(false)}>
            <img src="/assets/icons/carrito-de-compras.png" alt="" className="nav-cart-icon" loading="lazy" decoding="async" />
            <span className="nav-cart-badge nav-cart-badge--icon" data-global-cart-count>
              {cartCount}
            </span>
          </Link>

          <Link className={`btn btn-primary ${active === 'catalogo' ? 'is-active' : ''}`} href="/catalogo" onClick={() => setOpen(false)}>
            Ver catálogo
          </Link>
        </div>
      </div>
    </header>
  );
}
