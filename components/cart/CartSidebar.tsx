'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import {
  type CartItem,
  cartChangeQuantity,
  cartChangeSize,
  cartClear,
  cartGetItemsCount,
  cartGetTotal,
  cartLoad,
  cartRemoveItem,
  cartSave,
  createCartMessage,
  createWhatsAppLink,
  formatPrice,
  subscribeToCartUpdates,
} from '@/lib/shop';

function getAvailableSizesForFit(fit: string) {
  return fit === 'oversize' ? ['M', 'L', 'XL', 'XXL'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
}
import styles from './CartSidebar.module.css';

export const CART_SIDEBAR_EVENT = 'open-cart-sidebar';
export const CART_ITEM_ADDED_EVENT = 'cart-item-added';

export function openCartSidebar() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_SIDEBAR_EVENT));
  }
}

export function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const drawerRef = useRef<HTMLElement>(null);

  const hasItems = items.length > 0;
  const itemCount = cartGetItemsCount(items);
  const total = cartGetTotal(items);
  const orderLink = useMemo(() => createWhatsAppLink(createCartMessage(items)), [items]);

  useEffect(() => {
    setItems(cartLoad());
    const unsubscribe = subscribeToCartUpdates(setItems);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener(CART_SIDEBAR_EVENT, handler);
    return () => window.removeEventListener(CART_SIDEBAR_EVENT, handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('cart-sidebar-open', isOpen);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('cart-sidebar-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = Array.from(
      drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
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
    drawer.addEventListener('keydown', trapTab);
    return () => drawer.removeEventListener('keydown', trapTab);
  }, [isOpen]);

  function updateCart(next: CartItem[]) {
    setItems(next);
    cartSave(next);
  }

  function close() {
    setIsOpen(false);
    setShowClearConfirm(false);
  }

  function confirmClear() {
    const next = cartClear();
    setItems(next);
    cartSave(next);
    setShowClearConfirm(false);
  }

  const slideTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22 }}
            onClick={close}
            aria-hidden="true"
          />

          <motion.aside
            ref={drawerRef}
            className={styles.drawer}
            role="dialog"
            aria-label="Tu pedido"
            aria-modal="true"
            initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={slideTransition}
          >
            {/* ── Header ── */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>Tu pedido</span>
                {itemCount > 0 && (
                  <span className={styles.drawerBadge} aria-label={`${itemCount} ítems`}>{itemCount}</span>
                )}
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={close}
                aria-label="Cerrar pedido"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── Items ── */}
            <div className={styles.drawerContent}>
              {!hasItems ? (
                <div className={styles.emptyState}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="42" height="42" aria-hidden="true">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <p>Todavía no agregaste nada al pedido</p>
                  <Link href="/productos" className={styles.emptyStateCta} onClick={close}>
                    Ver productos
                  </Link>
                </div>
              ) : (
                <ul className={styles.itemList}>
                  <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      className={styles.item}
                      layout
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 24, transition: { duration: 0.18 } }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className={styles.itemThumb}>
                        <Image
                          src={item.image}
                          alt={item.productName}
                          width={100}
                          height={100}
                          sizes="64px"
                        />
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemName}>{item.productName}</span>
                          <span className={styles.itemPrice}>{formatPrice(item.unitPrice * item.quantity)}</span>
                        </div>
                        <div className={styles.itemMeta}>
                          <span>{item.fitLabel}</span>
                          <span>{item.color}</span>
                        </div>
                        <div className={styles.sizeRow} role="group" aria-label="Talle">
                          {getAvailableSizesForFit(item.fit).map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`${styles.sizeChip}${item.size === s ? ` ${styles.sizeChipActive}` : ''}`}
                              onClick={() => { if (item.size !== s) updateCart(cartChangeSize(items, item.id, s)); }}
                              aria-pressed={item.size === s}
                              aria-label={`Talle ${s}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className={styles.itemActions}>
                          <div className={styles.qtyControl}>
                            <button
                              type="button"
                              aria-label="Reducir cantidad"
                              onClick={() => updateCart(cartChangeQuantity(items, item.id, -1))}
                            >
                              −
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="Aumentar cantidad"
                              onClick={() => updateCart(cartChangeQuantity(items, item.id, 1))}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => updateCart(cartRemoveItem(items, item.id))}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* ── Footer with total + CTA ── */}
            {hasItems && (
              <div className={styles.drawerFooter}>
                <div className={styles.totalRow}>
                  <span>Total estimado</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
                <a
                  className={styles.whatsappBtn}
                  href={orderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp size={18} aria-hidden="true" />
                  Finalizar por WhatsApp
                </a>
                <button type="button" className={styles.continueBtn} onClick={close}>
                  Seguir viendo diseños
                </button>
                {showClearConfirm ? (
                  <div className={styles.clearConfirm} role="group" aria-label="Confirmar vaciado">
                    <span className={styles.clearConfirmLabel}>¿Vaciar todo el pedido?</span>
                    <button type="button" className={styles.clearConfirmYes} onClick={confirmClear}>
                      Sí, vaciar
                    </button>
                    <button type="button" className={styles.clearConfirmNo} onClick={() => setShowClearConfirm(false)}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.clearAllBtn} onClick={() => setShowClearConfirm(true)}>
                    Vaciar pedido
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
