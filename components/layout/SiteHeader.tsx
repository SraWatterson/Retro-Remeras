'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { cartGetItemsCount, cartLoad, subscribeToCartUpdates } from '@/lib/shop';
import { openCartSidebar, CART_ITEM_ADDED_EVENT } from '@/components/cart/CartSidebar';

type Props = {
  active: 'inicio' | 'catalogo' | 'personalizados' | 'mayorista';
};

type NavLink = {
  href: string;
  label: string;
  activeKey?: Props['active'];
  featured?: boolean;
  primary?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio', activeKey: 'inicio' },
  { href: '/productos', label: 'Productos', activeKey: 'catalogo', featured: true, primary: true },
  { href: '/personalizados', label: 'Personalizados', activeKey: 'personalizados', primary: true },
  { href: '/mayorista', label: 'Mayorista', activeKey: 'mayorista', primary: true },
  { href: '/#contacto', label: 'Contacto' },
];

const NAV_ICONS: Record<string, ReactNode> = {
  '/productos': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  '/personalizados': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  '/mayorista': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
};

const MOBILE_MENU_VARIANTS = {
  closed: {
    x: '-100%',
    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const },
  },
  open: {
    x: 0,
    transition: {
      duration: 0.30,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.045,
      delayChildren: 0.10,
    },
  },
};

const MOBILE_ITEM_VARIANTS = {
  closed: { opacity: 0, x: -10 },
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const CART_BADGE_TRANSITION: Transition = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
};

export function SiteHeader({ active }: Props) {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartPulsing, setCartPulsing] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCartCount(cartGetItemsCount(cartLoad()));
    const unsubscribe = subscribeToCartUpdates((items) => {
      setCartCount(cartGetItemsCount(items));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handler = () => {
      if (prefersReducedMotion) return;
      setCartPulsing(true);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => setCartPulsing(false), 500);
    };
    window.addEventListener(CART_ITEM_ADDED_EVENT, handler);
    return () => {
      window.removeEventListener(CART_ITEM_ADDED_EVENT, handler);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, [prefersReducedMotion]);

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

  // Focus trap: cuando el menú abre, mueve el foco al primer ítem y encierra Tab dentro del menú
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;

    const focusable = Array.from(
      menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    );
    focusable[0]?.focus();

    function trapTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    menu.addEventListener('keydown', trapTab);
    return () => menu.removeEventListener('keydown', trapTab);
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
        {/* Left: hamburger (mobile/tablet only) */}
        <motion.button
          className={`rr-menu-toggle${open ? ' is-open' : ''}`}
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
        >
          <span className="rr-menu-toggle__icon" aria-hidden="true" />
        </motion.button>

        {/* Center: logo */}
        <Link className="brand" href="/" aria-label="Ir al inicio de Retro Remeras" onClick={closeMenu}>
          <Image src="/assets/logo/icono-banner.png" alt="Retro Remeras" width={56} height={56} sizes="56px" priority />
        </Link>

        {/* Right: cart (mobile/tablet) */}
        <div className="rr-nav-end">
          <button
            type="button"
            className={`rr-mobile-cart-btn${cartPulsing ? ' is-pulsing' : ''}`}
            onClick={openCartSidebar}
            aria-label={`Tu pedido${cartCount > 0 ? ` (${cartCount} ítems)` : ''}`}
          >
            <svg className="rr-nav-cart__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="22" height="22">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={`mobile-nav-cart-${cartCount}`}
                  className="rr-nav-cart__badge"
                  initial={prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={prefersReducedMotion ? {} : { scale: 0.6, opacity: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : CART_BADGE_TRANSITION}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Desktop navigation */}
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
            <button
              type="button"
              className={`rr-nav-cart${cartPulsing ? ' is-pulsing' : ''}`}
              onClick={openCartSidebar}
              aria-label={`Tu pedido${cartCount > 0 ? ` (${cartCount} ítems)` : ''}`}
            >
              <svg className="rr-nav-cart__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="24" height="24">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={`desktop-cart-${cartCount}`}
                    className="rr-nav-cart__badge"
                    data-global-cart-count
                    initial={prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={prefersReducedMotion ? {} : { scale: 0.6, opacity: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : CART_BADGE_TRANSITION}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link className={`btn btn-primary ${active === 'catalogo' ? 'is-active' : ''}`} href="/productos">
              Ver productos
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay — behind the panel, closes menu on click */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="rr-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Nav drawer — slides in from the left */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id={menuId}
            className="rr-mobile-menu"
            role="dialog"
            aria-label="Menú principal"
            aria-modal="true"
            variants={prefersReducedMotion ? undefined : MOBILE_MENU_VARIANTS}
            initial={prefersReducedMotion ? { opacity: 0 } : 'closed'}
            animate={prefersReducedMotion ? { opacity: 1 } : 'open'}
            exit={prefersReducedMotion ? { opacity: 0 } : 'closed'}
            transition={prefersReducedMotion ? { duration: 0 } : undefined}
          >
            {/* Panel header with close button */}
            <div className="rr-mobile-menu__header">
              <button
                type="button"
                className="rr-mobile-menu__close"
                onClick={closeMenu}
                aria-label="Cerrar menú"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="18" height="18" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="rr-mobile-menu__nav" aria-label="Navegación mobile">
              {NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={prefersReducedMotion ? undefined : MOBILE_ITEM_VARIANTS}>
                  <Link
                    className={`rr-mobile-nav-link${isActive(link) ? ' is-active' : ''}`}
                    href={link.href}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
