'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { cartGetItemsCount, cartLoad, subscribeToCartUpdates } from '@/lib/shop';
import { openCartSidebar, CART_ITEM_ADDED_EVENT } from '@/components/cart/CartSidebar';

type Props = {
  active: 'inicio' | 'catalogo' | 'carrito' | 'personalizados' | 'mayorista';
};

type NavLink = {
  href: string;
  label: string;
  activeKey?: Props['active'];
  featured?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio', activeKey: 'inicio' },
  { href: '/catalogo', label: 'Catálogo', activeKey: 'catalogo', featured: true },
  { href: '/personalizados', label: 'Personalizados', activeKey: 'personalizados' },
  { href: '/mayorista', label: 'Mayorista', activeKey: 'mayorista' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#contacto', label: 'Contacto' },
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
        <Link className="brand" href="/" aria-label="Ir al inicio de Retro Remeras" onClick={closeMenu}>
          <Image src="/assets/logo/icono-banner.png" alt="Retro Remeras" width={56} height={56} sizes="56px" priority />
        </Link>

        {/* rr-nav-end: cart + hamburger agrupados — visible en mobile/tablet, oculto en desktop */}
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
        </div>

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

            <Link className={`btn btn-primary ${active === 'catalogo' ? 'is-active' : ''}`} href="/catalogo">
              Ver catálogo
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              ref={menuRef}
              id={menuId}
              className="rr-mobile-menu"
              role="dialog"
              aria-label="Menú principal"
              aria-modal="true"
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
                      className={`rr-mobile-link${isActive(link) ? ' is-active' : ''}${link.featured ? ' is-featured' : ''}`}
                      href={link.href}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
