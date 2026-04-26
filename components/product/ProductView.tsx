'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  CartItem,
  Product,
  cartAddItem,
  cartClear,
  cartGetItemsCount,
  cartGetTotal,
  cartLoad,
  cartSave,
  createCartMessage,
  createWhatsAppLink,
  formatPrice,
  normalizeImageUrl,
} from '@/lib/shop';

const COLORS = [
  { name: 'Negro', swatchClass: 'swatch-dot--negro' },
  { name: 'Blanco', swatchClass: 'swatch-dot--blanco' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const FITS = [
  { key: 'regular', label: 'Regular', note: 'Calce clásico' },
  { key: 'oversize', label: 'Oversize', note: 'Más amplio y relajado' },
];

const SIZE_GUIDES = {
  regular: {
    label: 'Regular',
    src: '/assets/talles-producto/talle-regular.png',
    alt: 'Tabla de talles para remera regular',
  },
  oversize: {
    label: 'Oversize',
    src: '/assets/talles-producto/talles-oversize.png',
    alt: 'Tabla de talles para remera oversize',
  },
};

function getAvailableSizes(fit: string) {
  return fit === 'oversize' ? ['M', 'L', 'XL', 'XXL'] : SIZES;
}

function cartItemMarkup(item: CartItem) {
  return `${item.productName} · ${item.fitLabel} · ${item.size} · ${item.color} · x${item.quantity}`;
}

type Props = {
  productId?: string;
};

export function ProductView({ productId }: Props) {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].name);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFit, setSelectedFit] = useState('regular');
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(cartLoad());
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        const data = await response.json();

        if (!ignore && Array.isArray(data)) {
          setProducts(data);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);

  const product = useMemo(() => {
    if (!products.length) return null;
    return products.find((entry) => entry.id === productId) || null;
  }, [productId, products]);

  const selectedImage = useMemo(() => {
    const byColor = product?.imagenesPorColor?.[selectedColor];
    return normalizeImageUrl(byColor || product?.imagen);
  }, [product, selectedColor]);

  const orderLink = createWhatsAppLink(createCartMessage(items));

  if (loading) {
    return (
      <main className="product-page">
        <section className="container product-shell">Cargando producto...</section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-page">
        <section className="container product-shell">
          <div className="empty-state">
            <h2>No encontramos este producto</h2>
            <Link className="btn btn-primary" href="/catalogo">Volver al catálogo</Link>
          </div>
        </section>
      </main>
    );
  }

  function addToCart() {
    const nextItem: CartItem = {
      id: `${product.id}-${selectedColor}-${selectedSize}-${selectedFit}`,
      productId: product.id,
      productName: product.nombre,
      category: product.categoria,
      image: selectedImage,
      unitPrice: product.precio,
      color: selectedColor,
      size: selectedSize,
      fit: selectedFit,
      fitLabel: FITS.find((fit) => fit.key === selectedFit)?.label || 'Regular',
      quantity: 1,
    };

    const updated = cartAddItem(items, nextItem);
    setItems(updated);
    cartSave(updated);
  }

  function clearCurrentCart() {
    const empty = cartClear();
    setItems(empty);
  }

  return (
    <main className="product-page">
      <section className="container product-shell">
        <div className="product-breadcrumb">
          <Link href="/catalogo">Catálogo</Link>
          <span>/</span>
          <span>{product.nombre}</span>
        </div>

        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-main">
              <img src={selectedImage} alt={product.nombre} />
            </div>
          </section>

          <aside className="product-buybox">
            <div className="product-meta">
              <p className="product-category">{product.categoria}</p>
              <h1 className="product-title product-page-title">{product.nombre}</h1>
              <div className="product-price-row">
                <strong className="product-price">{formatPrice(product.precio)}</strong>
                <span className="product-price-note">Precio de referencia</span>
              </div>
              <p className="product-description">{product.descripcion}</p>
            </div>

            <div className="product-config">
              <div className="config-block">
                <div className="config-head">
                  <span className="config-label">Tipo de remera</span>
                  <strong className="config-value">{FITS.find((fit) => fit.key === selectedFit)?.label || 'Regular'}</strong>
                </div>
                <div className="fit-selector product-fit-selector">
                  {FITS.map((fit) => (
                    <label className={`fit-option ${selectedFit === fit.key ? 'is-selected' : ''}`} key={fit.key}>
                      <input
                        type="radio"
                        name="shirt-fit"
                        checked={selectedFit === fit.key}
                        onChange={() => {
                          const nextFit = fit.key;
                          const nextSizes = getAvailableSizes(nextFit);
                          setSelectedFit(nextFit);
                          setSelectedSize((currentSize) =>
                            nextSizes.includes(currentSize) ? currentSize : nextSizes[0]
                          );
                        }}
                      />
                      <span className="fit-option-title">{fit.label}</span>
                      <span className="fit-option-note">{fit.note}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="config-block">
                <div className="config-head">
                  <span className="config-label">Talle</span>
                  <strong className="config-value">{selectedSize}</strong>
                </div>
                <div className="size-grid product-size-grid">
                  {getAvailableSizes(selectedFit).map((size) => (
                    <label className={`size-option ${selectedSize === size ? 'is-selected' : ''}`} key={size}>
                      <input
                        type="radio"
                        name="shirt-size"
                        checked={selectedSize === size}
                        onChange={() => setSelectedSize(size)}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="config-block">
                <div className="config-head">
                  <span className="config-label">Color</span>
                  <strong className="config-value">{selectedColor}</strong>
                </div>
                <div className="swatches product-swatches">
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      className={`swatch-card ${selectedColor === color.name ? 'is-selected' : ''}`}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      aria-label={color.name}
                    >
                      <span className={`swatch-dot-lg ${color.swatchClass}`} />
                      <span className="swatch-name">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="config-block size-chart-block">
                <div className="size-chart-card">
                  <div className="size-chart-card__head">
                    <span>Tabla de talles</span>
                    <strong>{SIZE_GUIDES[selectedFit]?.label ?? 'Regular'}</strong>
                  </div>
                  <div className="size-chart-card__media">
                    <img
                      src={SIZE_GUIDES[selectedFit]?.src ?? SIZE_GUIDES.regular.src}
                      alt={SIZE_GUIDES[selectedFit]?.alt ?? SIZE_GUIDES.regular.alt}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="product-order-box">
              <div className="product-order-box-head">
                <div>
                  <h2>Tu pedido</h2>
                  <p className="section-subtitle">Podés sumar varias remeras antes de enviarlo.</p>
                </div>
                <span className="cart-count-badge">{cartGetItemsCount(items)} items</span>
              </div>

              <div className="cart-list">
                {items.length ? (
                  items.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-content">{cartItemMarkup(item)}</div>
                    </div>
                  ))
                ) : (
                  <div className="cart-empty-state">Todavía no agregaste productos al pedido.</div>
                )}
              </div>

              <div className="cart-total-row">
                <span>Total estimado</span>
                <strong>{formatPrice(cartGetTotal(items))}</strong>
              </div>

              <div className="product-actions product-order-actions" aria-label="Acciones del pedido">
                <button className="btn btn-primary product-action-btn product-action-btn--add" type="button" onClick={addToCart}>
                  Agregar al pedido
                </button>

                <a className="btn btn-secondary product-action-btn product-action-btn--whatsapp" href={orderLink} target="_blank" rel="noopener noreferrer">
                  Finalizar por WhatsApp
                </a>

                <button className="cart-clear-btn product-action-clear" type="button" onClick={clearCurrentCart}>
                  Vaciar pedido
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
