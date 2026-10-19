'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ProductLens } from './ProductLens';
import { ProductZoom } from './ProductZoom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CartItem,
  Product,
  ProductSizeGuide,
  SizeGuideTable,
  BULK_DISCOUNT_THRESHOLD,
  BULK_DISCOUNT_RATE,
  cartAddItem,
  cartGetDiscountAmount,
  cartGetFinalTotal,
  cartGetItemsCount,
  cartLoad,
  cartSave,
  subscribeToCartUpdates,
  formatPrice,
  normalizeImageUrl,
} from '@/lib/shop';
import { openCartSidebar, CART_ITEM_ADDED_EVENT } from '@/components/cart/CartSidebar';
import { collectionHref } from '@/lib/collection-copy';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
type FitKey = 'regular' | 'oversize';

const FITS: Array<{ key: FitKey; label: string; note: string }> = [
  { key: 'regular', label: 'Regular', note: 'Calce clásico' },
  { key: 'oversize', label: 'Oversize', note: 'Más amplio y relajado' },
];

const DEFAULT_SIZE_GUIDES: Required<ProductSizeGuide> = {
  regular: {
    columns: ['Talle', 'Ancho', 'Largo'],
    rows: [
      ['XS', '46 cm', '66 cm'],
      ['S', '48 cm', '68 cm'],
      ['M', '51 cm', '70 cm'],
      ['L', '54 cm', '72 cm'],
      ['XL', '57 cm', '74 cm'],
      ['XXL', '60 cm', '76 cm'],
    ],
  },
  oversize: {
    columns: ['Talle', 'Ancho', 'Largo'],
    rows: [
      ['M', '56 cm', '72 cm'],
      ['L', '59 cm', '74 cm'],
      ['XL', '62 cm', '76 cm'],
      ['XXL', '65 cm', '78 cm'],
    ],
  },
};

const SIZE_GUIDE_LABELS: Record<FitKey, string> = {
  regular: 'Regular',
  oversize: 'Oversize',
};

function getAvailableSizes(fit: FitKey) {
  return fit === 'oversize' ? ['M', 'L', 'XL', 'XXL'] : SIZES;
}

function getSizeGuideTable(sizeGuide: ProductSizeGuide | null | undefined, fit: FitKey): SizeGuideTable {
  const customTable = sizeGuide?.[fit];
  if (customTable?.columns?.length && customTable.rows?.length) return customTable;
  return DEFAULT_SIZE_GUIDES[fit];
}

type Props = { product: Product };

export function ProductView({ product }: Props) {
  const availableColors = useMemo(() => Object.values(product.imagenesPorColor || {}), [product.imagenesPorColor]);
  const firstColor = availableColors[0] || null;
  const [selectedColor, setSelectedColor] = useState(firstColor?.colorSlug || '');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFit, setSelectedFit] = useState<FitKey>('regular');
  const sizeGuideDialogRef = useRef<HTMLDialogElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [items, setItems] = useState<CartItem[]>([]);
  const [zoomOpen, setZoomOpen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const buyboxRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setItems(cartLoad());
    return subscribeToCartUpdates(setItems);
  }, []);

  // Viene del catálogo filtrado por color (?color=blanco): arranca con ese color.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('color');
    if (fromUrl && availableColors.some((c) => c.colorSlug === fromUrl)) setSelectedColor(fromUrl);
  }, [availableColors]);

  useEffect(() => {
    if (!availableColors.length) return;
    const stillAvailable = availableColors.some((c) => c.colorSlug === selectedColor);
    if (!stillAvailable) setSelectedColor(availableColors[0].colorSlug);
  }, [availableColors, selectedColor]);

  const selectedColorOption = useMemo(
    () => availableColors.find((c) => c.colorSlug === selectedColor) || firstColor,
    [availableColors, firstColor, selectedColor],
  );

  const selectedImage = useMemo(
    () => normalizeImageUrl(selectedColorOption?.path || product?.imagen),
    [product, selectedColorOption],
  );

  const selectedSizeGuideTable = useMemo(
    () => getSizeGuideTable(product.sizeGuide, selectedFit),
    [product.sizeGuide, selectedFit],
  );

  const hasCartItems = items.length > 0;
  const itemCount = cartGetItemsCount(items);
  const discount = cartGetDiscountAmount(items);
  const finalTotal = cartGetFinalTotal(items);
  const itemsToDiscount = Math.max(0, BULK_DISCOUNT_THRESHOLD - itemCount);

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
      fitLabel: FITS.find((f) => f.key === selectedFit)?.label || 'Regular',
      quantity: 1,
    };
    const updated = cartAddItem(items, nextItem);
    setItems(updated);
    cartSave(updated);
    window.dispatchEvent(new CustomEvent(CART_ITEM_ADDED_EVENT));
    openCartSidebar();
  }

  const paragraphs = (product.descripcion || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && paragraph.toLowerCase() !== product.nombre.trim().toLowerCase());
  // Primer párrafo: el que cuenta y vende (se ve siempre).
  // El resto (datos para Google: referencia, corte, estampado) va en "Detalles".
  const [lead, ...details] = paragraphs;
  const imageAlt =
    product.imagenAlt?.trim() ||
    `${product.nombre}${selectedColorOption?.colorName ? ` — ${selectedColorOption.colorName}` : ''}`;

  return (
    <main className="product-page pv2">
      <div className="pv2-shell">

        {/* ── FOTO ── */}
        <section className="pv2-gallery" aria-label="Fotos del producto">
          <div
            ref={frameRef}
            className="pv2-frame pv-gallery__frame--zoomable"
            role="button"
            tabIndex={0}
            aria-label="Ver la foto ampliada"
            onClick={() => setZoomOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setZoomOpen(true);
              }
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedImage}
                className="pv-gallery__img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' }}
              >
                <Image
                  src={selectedImage}
                  alt={imageAlt}
                  width={1200}
                  height={1500}
                  quality={85}
                  sizes="(max-width: 899px) 100vw, 560px"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            <span className="pv-gallery__zoom-hint" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M20 20l-4.2-4.2M11 8.5v5M8.5 11h5" />
              </svg>
              <span className="pv-gallery__zoom-hint-text">Ampliar</span>
            </span>
          </div>

          {availableColors.length > 1 && (
            <div className="pv2-thumbs" role="group" aria-label="Ver por color">
              {availableColors.map((color) => (
                <button
                  key={color.colorSlug}
                  className={`pv2-thumb${selectedColor === color.colorSlug ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => setSelectedColor(color.colorSlug)}
                  aria-label={`Ver en ${color.colorName}`}
                  aria-pressed={selectedColor === color.colorSlug}
                >
                  <Image src={normalizeImageUrl(color.path)} alt="" width={120} height={150} sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── INFO Y COMPRA ── */}
        <aside className="pv2-info" ref={buyboxRef}>
          <nav className="pv2-crumbs" aria-label="Estás en">
            <Link href="/productos">Remeras</Link>
            <span aria-hidden="true">/</span>
            <Link href={collectionHref(product.categoria)}>{product.categoria}</Link>
          </nav>

          <h1 className="pv2-title">{product.nombre}</h1>

          <p className="pv2-price">
            <strong>{formatPrice(product.precio)}</strong>
            <span>por unidad · {Math.round(BULK_DISCOUNT_RATE * 100)}% off llevando {BULK_DISCOUNT_THRESHOLD}</span>
          </p>

          {lead ? <p className="pv2-lead">{lead}</p> : null}

          <div className="pv2-options">
            {availableColors.length > 0 && (
              <div className="pv2-option">
                <div className="pv2-option__head">
                  <span>Color</span>
                  <strong>{selectedColorOption?.colorName || 'Color principal'}</strong>
                </div>
                <div className="pv2-swatches" role="group" aria-label="Elegir color">
                  {availableColors.map((color) => (
                    <button
                      key={color.colorSlug}
                      type="button"
                      className={`pv2-swatch${selectedColor === color.colorSlug ? ' is-active' : ''}`}
                      onClick={() => setSelectedColor(color.colorSlug)}
                      aria-pressed={selectedColor === color.colorSlug}
                      aria-label={color.colorName}
                      title={color.colorName}
                    >
                      <span style={{ backgroundColor: color.colorHex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pv2-option">
              <div className="pv2-option__head">
                <span>Corte</span>
                <strong>{FITS.find((f) => f.key === selectedFit)?.note}</strong>
              </div>
              <div className="pv2-segmented" role="radiogroup" aria-label="Corte de la remera">
                {FITS.map((fit) => (
                  <label key={fit.key} className={selectedFit === fit.key ? 'is-active' : ''}>
                    <input
                      type="radio"
                      name="shirt-fit"
                      checked={selectedFit === fit.key}
                      onChange={() => {
                        const nextFit = fit.key;
                        const nextSizes = getAvailableSizes(nextFit);
                        setSelectedFit(nextFit);
                        setSelectedSize((cur) => (nextSizes.includes(cur) ? cur : nextSizes[0]));
                      }}
                    />
                    {fit.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="pv2-option">
              <div className="pv2-option__head">
                <span>Talle</span>
                <button type="button" className="pv2-link" onClick={() => sizeGuideDialogRef.current?.showModal()}>
                  Tabla de medidas
                </button>
              </div>
              <div className="pv2-sizes" role="radiogroup" aria-label="Talle">
                {getAvailableSizes(selectedFit).map((size) => (
                  <label key={size} className={selectedSize === size ? 'is-active' : ''}>
                    <input
                      type="radio"
                      name="shirt-size"
                      checked={selectedSize === size}
                      onChange={() => setSelectedSize(size)}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button className="btn btn-primary pv2-cta" type="button" onClick={addToCart}>
            Agregar al pedido
          </button>

          <ul className="pv2-trust" aria-label="Por qué comprarnos">
            <li>Estampado DTF</li>
            <li>Sin mínimo</li>
            <li>Envíos a todo el país</li>
          </ul>

          {hasCartItems && (
            <button type="button" className="pv2-cartline" onClick={() => openCartSidebar()}>
              <span>
                Tu pedido: <strong>{itemCount} {itemCount === 1 ? 'remera' : 'remeras'}</strong> · {formatPrice(finalTotal)}
              </span>
              <small>
                {itemsToDiscount > 0
                  ? `Sumá ${itemsToDiscount} más y tenés ${Math.round(BULK_DISCOUNT_RATE * 100)}% off`
                  : `${Math.round(BULK_DISCOUNT_RATE * 100)}% off aplicado${discount > 0 ? ` (−${formatPrice(discount)})` : ''}`}
              </small>
            </button>
          )}

          {details.length > 0 && (
            <details className="pv2-details">
              <summary>Detalles del producto</summary>
              {details.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </details>
          )}

          {/* Tabla de talles — modal nativa */}
          <dialog ref={sizeGuideDialogRef} className="pv-size-guide-dialog">
            <div className="pv-dialog-head">
              <h3 className="pv-dialog-title">Tabla de talles — {SIZE_GUIDE_LABELS[selectedFit]}</h3>
              <form method="dialog">
                <button className="pv-dialog-close" type="submit" aria-label="Cerrar tabla de talles">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </div>
            <div className="size-guide-table-wrap">
              <table className="size-guide-table">
                <thead>
                  <tr>
                    {selectedSizeGuideTable.columns.map((col) => (
                      <th key={`${selectedFit}-${col}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedSizeGuideTable.rows.map((row, ri) => (
                    <tr key={`${selectedFit}-${ri}`}>
                      {selectedSizeGuideTable.columns.map((col, ci) => (
                        <td key={`${selectedFit}-${ri}-${col}`}>{row[ci] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </dialog>
        </aside>
      </div>

      <ProductLens frameRef={frameRef} sideRef={buyboxRef} src={selectedImage} />
      <ProductZoom src={selectedImage} alt={imageAlt} open={zoomOpen} onClose={() => setZoomOpen(false)} />
    </main>
  );
}
