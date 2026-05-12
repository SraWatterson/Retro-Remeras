'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useState } from 'react';
import { cartGetItemsCount, cartLoad, subscribeToCartUpdates } from '@/lib/shop';

type Props = {
  active: 'inicio' | 'catalogo' | 'carrito' | 'personalizados' | 'mayorista';
};

type NavLink = {
  href: string;
  label: string;
  activeKey?: Props['active'];
};

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio', activeKey: 'inicio' },
  { href: '/catalogo', label: 'Catálogo', activeKey: 'catalogo' },
  { href: '/personalizados', label: 'Personalizados', activeKey: 'personalizados' },
  { href: '/mayorista', label: 'Mayorista', activeKey: 'mayorista' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#ubicacion', label: 'Ubicación' },
];

const MOBILE_MENU_VARIANTS = {
  closed: {
    opacity: 0,
    y: -8,
    scale: 0.985,
    transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.035,
      delayChildren: 0.025,
    },
  },
};

const MOBILE_ITEM_VARIANTS = {
  closed: { opacity: 0, y: -4 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
  },
};

const CART_BADGE_TRANSITION = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
};

export function SiteHeader({ active }: Props) {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const menuId = useId();

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
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('nav-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  function isActive(link: NavLink) {
    return link.activeKey === active;
  }

  return (
    <header className="topbar">
      <div className="container navbar rr-nav">
        <Link className="brand" href="/" aria-label="Ir al inicio de Retro Remeras" onClick={closeMenu}>
          <Image src="/assets/logo/icono-banner.png" alt="Retro Remeras" width={56} height={56} sizes="56px" priority />
        </Link>

        <motion.button
          className={`rr-menu-toggle ${open ? 'is-open' : ''}`}
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
        >
          <span className="rr-menu-toggle__icon" aria-hidden="true" />
        </motion.button>

        <div className="rr-desktop-nav">
          <nav className="rr-desktop-links" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                className={`rr-desktop-link ${isActive(link) ? 'is-active' : ''}`}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="rr-desktop-actions">
            <Link className="rr-nav-cart" href="/carrito" aria-label="Ver carrito">
              <Image src="/assets/icons/carrito-de-compras.png" alt="" className="rr-nav-cart__icon" width={28} height={28} />
              <motion.span
                key={`desktop-cart-${cartCount}`}
                className="rr-nav-cart__badge"
                data-global-cart-count
                initial={prefersReducedMotion ? false : { scale: 0.72, opacity: 0.65 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : CART_BADGE_TRANSITION}
              >
                {cartCount}
              </motion.span>
            </Link>

            <Link className={`btn btn-primary ${active === 'catalogo' ? 'is-active' : ''}`} href="/catalogo">
              Ver catálogo
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              id={menuId}
              className="rr-mobile-menu"
              role="dialog"
              aria-label="Menú principal"
              variants={prefersReducedMotion ? undefined : MOBILE_MENU_VARIANTS}
              initial={prefersReducedMotion ? { opacity: 0 } : "closed"}
              animate={prefersReducedMotion ? { opacity: 1 } : "open"}
              exit={prefersReducedMotion ? { opacity: 0 } : "closed"}
              transition={prefersReducedMotion ? { duration: 0 } : undefined}
            >
              <nav className="rr-mobile-menu__links" aria-label="Navegación mobile">
                {NAV_LINKS.map((link) => (
                  <motion.div className="rr-mobile-link-motion" variants={prefersReducedMotion ? undefined : MOBILE_ITEM_VARIANTS} key={link.href}>
                    <Link
                      className={`rr-mobile-link ${isActive(link) ? 'is-active' : ''}`}
                      href={link.href}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="rr-mobile-menu__actions">
                <motion.div className="rr-mobile-action-motion" variants={prefersReducedMotion ? undefined : MOBILE_ITEM_VARIANTS}>
                  <Link className="rr-nav-cart" href="/carrito" aria-label="Ver carrito" onClick={closeMenu}>
                    <Image src="/assets/icons/carrito-de-compras.png" alt="" className="rr-nav-cart__icon" width={24} height={24} />
                    <motion.span
                      key={`mobile-cart-${cartCount}`}
                      className="rr-nav-cart__badge"
                      data-global-cart-count
                      initial={prefersReducedMotion ? false : { scale: 0.72, opacity: 0.65 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={prefersReducedMotion ? { duration: 0 } : CART_BADGE_TRANSITION}
                    >
                      {cartCount}
                    </motion.span>
                  </Link>
                </motion.div>

                <motion.div className="rr-mobile-action-motion" variants={prefersReducedMotion ? undefined : MOBILE_ITEM_VARIANTS}>
                  <Link className="rr-mobile-primary" href="/catalogo" onClick={closeMenu}>
                    Ver catálogo
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
