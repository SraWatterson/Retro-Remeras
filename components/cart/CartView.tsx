'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import {
  CartItem,
  cartChangeQuantity,
  cartClear,
  cartGetItemsCount,
  cartGetTotal,
  cartLoad,
  cartRemoveItem,
  cartSave,
  createCartMessage,
  createWhatsAppLink,
  formatPrice,
} from '@/lib/shop';

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);

  const hasItems = items.length > 0;
  const itemCount = cartGetItemsCount(items);
  const total = cartGetTotal(items);

  useEffect(() => {
    setItems(cartLoad());
  }, []);

  const orderLink = useMemo(() => createWhatsAppLink(createCartMessage(items)), [items]);

  function updateCart(next: CartItem[]) {
    setItems(next);
    cartSave(next);
  }

  function clearCart() {
    if (!hasItems) return;
    const confirmed = window.confirm('¿Seguro que querés vaciar todo el pedido?');
    if (!confirmed) return;
    updateCart(cartClear());
  }

  return (
    <main className="cart-page">
      <section className="container cart-shell">
        <div className="section-header cart-page-header">
          <span className="section-kicker">Tu pedido</span>
          <h1 className="section-title">Carrito de compras</h1>
          <p className="section-subtitle">Revisá tu pedido, ajustá cantidades y confirmalo por WhatsApp.</p>
        </div>

        <div className={`cart-layout ${!hasItems ? 'cart-layout--empty' : ''}`}>
          <section className="cart-main panel">
            <div className="cart-list cart-page-list">
              {!hasItems ? (
                <div className="cart-empty-state cart-empty-state--rich">
                  <span className="cart-empty-state__icon" aria-hidden="true"><FaShoppingCart size={26} /></span>
                  <h2>Tu carrito está vacío</h2>
                  <p>Elegí una remera del catálogo y volvé acá para cerrar el pedido por WhatsApp.</p>
                  <Link className="btn btn-primary cart-empty-state__btn" href="/catalogo">
                    Ver catálogo
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-body">
                      <div className="cart-item-thumb">
                        <Image src={item.image} alt={item.productName} width={180} height={180} sizes="76px" />
                      </div>
                      <div className="cart-item-content">
                        <div className="cart-item-head">
                          <div className="cart-item-copy">
                            <h4>{item.productName}</h4>
                            <p>{item.category}</p>
                          </div>
                          <strong className="cart-item-subtotal">{formatPrice(item.unitPrice * item.quantity)}</strong>
                        </div>

                        <ul className="cart-item-meta">
                          <li><span>Tipo</span><strong>{item.fitLabel}</strong></li>
                          <li><span>Color</span><strong>{item.color}</strong></li>
                          <li><span>Talle</span><strong>{item.size}</strong></li>
                          <li><span>Precio unit.</span><strong>{formatPrice(item.unitPrice)}</strong></li>
                        </ul>

                        <div className="cart-item-actions">
                          <div className="qty-control" aria-label="Cantidad del producto">
                            <button type="button" className="qty-btn" onClick={() => updateCart(cartChangeQuantity(items, item.id, -1))}>−</button>
                            <span className="qty-value">{item.quantity}</span>
                            <button type="button" className="qty-btn" onClick={() => updateCart(cartChangeQuantity(items, item.id, 1))}>+</button>
                          </div>

                          <button type="button" className="cart-remove-btn" onClick={() => updateCart(cartRemoveItem(items, item.id))}>
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <aside className="cart-summary panel">
            <h2>Resumen</h2>
            <ul className="summary-list">
              <li><span>Productos</span><strong>{itemCount}</strong></li>
              <li><span>Total estimado</span><strong>{formatPrice(total)}</strong></li>
            </ul>

            {hasItems ? (
              <>
                <div className="cart-summary-actions">
                  <a className="btn btn-primary cart-summary-whatsapp" href={orderLink} target="_blank" rel="noopener noreferrer">
                    Finalizar por WhatsApp
                  </a>
                  <Link className="btn btn-secondary cart-summary-secondary" href="/catalogo">
                    Seguir comprando
                  </Link>
                  <button className="cart-summary-clear" type="button" onClick={clearCart}>
                    Vaciar pedido
                  </button>
                </div>

                <div className="notice">El pedido se envía por WhatsApp con todos los productos, talles, colores y cantidades.</div>
              </>
            ) : (
              <div className="cart-summary-empty">
                <p>Cuando agregues productos, acá vas a ver el total y la opción para finalizar.</p>
                <Link className="btn btn-secondary" href="/catalogo">
                  Explorar diseños
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
