'use client';

import Image from 'next/image';
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

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
type FitKey = 'regular' | 'oversize';

const FITS: Array<{ key: FitKey; label: string; note: string }> = [
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

function getAvailableSizes(fit: FitKey) {
  return fit === 'oversize' ? ['M', 'L', 'XL', 'XXL'] : SIZES;
}

function cartItemMarkup(item: CartItem) {
  return `${item.productName} · ${item.fitLabel} · ${item.size} · ${item.color} · x${item.quantity}`;
}

type Props = {
  product: Product;
};

export function ProductView({ product }: Props) {
  const availableColors = useMemo(() => Object.values(product.imagenesPorColor || {}), [product.imagenesPorColor]);
  const firstColor = availableColors[0] || null;
  const [selectedColor, setSelectedColor] = useState(firstColor?.colorSlug || '');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFit, setSelectedFit] = useState<FitKey>('regular');
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(cartLoad());
  }, []);

  useEffect(() => {
    if (!availableColors.length) return;

    const stillAvailable = availableColors.some((color) => color.colorSlug === selectedColor);
    if (!stillAvailable) {
      setSelectedColor(availableColors[0].colorSlug);
    }
  }, [availableColors, selectedColor]);

  const selectedColorOption = useMemo(
    () => availableColors.find((color) => color.colorSlug === selectedColor) || firstColor,
    [availableColors, firstColor, selectedColor]
  );

  const selectedImage = useMemo(() => {
    return normalizeImageUrl(selectedColorOption?.path || product?.imagen);
  }, [product, selectedColorOption]);

  const hasCartItems = items.length > 0;
  const orderLink = createWhatsAppLink(createCartMessage(items));

  function addToCart() {
    const nextItem: CartItem = {
      id: `${product.id}-${selectedColorOption?.colorSlug || 'principal'}-${selectedSize}-${selectedFit}`,
      productId: product.id,
      productName: product.nombre,
      category: product.categoria,
      image: selectedImage,
      unitPrice: product.precio,
      color: selectedColorOption?.colorName || 'Color principal',
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
    if (!hasCartItems) return;
    const confirmed = window.confirm('¿Seguro que querés vaciar todo el pedido?');
    if (!confirmed) return;

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
              <Image src={selectedImage} alt={product.nombre} width={1400} height={1400} quality={94} sizes="(max-width: 767px) 94vw, (max-width: 1199px) 58vw, 760px" priority />
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
                  <strong className="config-value">{selectedColorOption?.colorName || 'Color principal'}</strong>
                </div>
                {availableColors.length ? (
                  <div className="swatches product-swatches">
                    {availableColors.map((color) => (
                      <button
                        key={color.colorSlug}
                        className={`swatch-card ${selectedColor === color.colorSlug ? 'is-selected' : ''}`}
                        type="button"
                        onClick={() => setSelectedColor(color.colorSlug)}
                        aria-label={color.colorName}
                      >
                        <span className="swatch-dot-lg" style={{ backgroundColor: color.colorHex }} />
                        <span className="swatch-name">{color.colorName}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="product-color-fallback">Este diseño usa la imagen principal como referencia de color.</p>
                )}
              </div>

              <div className="config-block size-chart-block">
                <div className="size-chart-card">
                  <div className="size-chart-card__head">
                    <span>Tabla de talles</span>
                    <strong>{SIZE_GUIDES[selectedFit]?.label ?? 'Regular'}</strong>
                  </div>
                  <div className="size-chart-card__media">
                    <Image
                      src={SIZE_GUIDES[selectedFit]?.src ?? SIZE_GUIDES.regular.src}
                      alt={SIZE_GUIDES[selectedFit]?.alt ?? SIZE_GUIDES.regular.alt}
                      width={1000}
                      height={620}
                      quality={92}
                      sizes="(max-width: 767px) 90vw, (max-width: 1199px) 44vw, 420px"
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
                  <div className="cart-empty-state cart-empty-state--rich">
                    <h3>Pedido en preparación</h3>
                    <p>Elegí talle, color y tipo de remera para agregar este diseño.</p>
                  </div>
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

                {hasCartItems ? (
                  <>
                    <a className="btn btn-secondary product-action-btn product-action-btn--whatsapp" href={orderLink} target="_blank" rel="noopener noreferrer">
                      Finalizar por WhatsApp
                    </a>

                    <button className="cart-clear-btn product-action-clear" type="button" onClick={clearCurrentCart}>
                      Vaciar pedido
                    </button>
                  </>
                ) : (
                  <Link className="btn btn-secondary product-action-btn product-action-btn--catalog" href="/catalogo">
                    Seguir viendo diseños
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
