'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    setItems(cartLoad());
  }, []);

  const orderLink = useMemo(() => createWhatsAppLink(createCartMessage(items)), [items]);

  function updateCart(next: CartItem[]) {
    setItems(next);
    cartSave(next);
  }

  return (
    <main className="cart-page">
      <section className="container cart-shell">
        <div className="section-header">
          <span className="section-kicker">Tu pedido</span>
          <h1 className="section-title">Carrito de compras</h1>
          <p className="section-subtitle">Revisá tu pedido, ajustá cantidades y confirmalo por WhatsApp.</p>
        </div>

        <div className="cart-layout">
          <section className="cart-main panel">
            <div className="cart-list cart-page-list">
              {!items.length ? (
                <div className="cart-empty-state">Todavía no agregaste productos al pedido.</div>
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
              <li><span>Productos</span><strong>{cartGetItemsCount(items)}</strong></li>
              <li><span>Total estimado</span><strong>{formatPrice(cartGetTotal(items))}</strong></li>
            </ul>

            <div className="cart-summary-actions">
              <a className="btn btn-primary" href={orderLink} target="_blank" rel="noopener noreferrer">
                Finalizar por WhatsApp
              </a>
              <Link className="btn btn-secondary" href="/catalogo">
                Seguir comprando
              </Link>
              <button className="btn btn-ghost" type="button" onClick={() => updateCart(cartClear())}>
                Vaciar pedido
              </button>
            </div>

            <div className="notice">El pedido se envía por WhatsApp con todos los productos, talles, colores y cantidades.</div>
          </aside>
        </div>
      </section>
    </main>
  );
}
