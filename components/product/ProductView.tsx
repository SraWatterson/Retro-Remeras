'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import {
  CartItem,
  Product,
  ProductSizeGuide,
  SizeGuideTable,
  cartAddItem,
  cartClear,
  cartGetItemsCount,
  cartGetTotal,
  cartLoad,
  cartSave,
  subscribeToCartUpdates,
  createCartMessage,
  createWhatsAppLink,
  formatPrice,
  normalizeImageUrl,
} from '@/lib/shop';
import { openCartSidebar, CART_ITEM_ADDED_EVENT } from '@/components/cart/CartSidebar';

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
  const [showToast, setShowToast] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sizeGuideDialogRef = useRef<HTMLDialogElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(cartLoad());
    return subscribeToCartUpdates(setItems);
  }, []);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

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
      fitLabel: FITS.find((f) => f.key === selectedFit)?.label || 'Regular',
      quantity: 1,
    };
    const updated = cartAddItem(items, nextItem);
    setItems(updated);
    cartSave(updated);
    window.dispatchEvent(new CustomEvent(CART_ITEM_ADDED_EVENT));
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setShowToast(true);
      toastTimerRef.current = setTimeout(() => setShowToast(false), 2500);
    }
  }

  function confirmClear() {
    setItems(cartClear());
    setShowClearConfirm(false);
  }

  return (
    <main className="product-page">
      <div className="product-shell">

        {/* ── GALERÍA ── */}
        <section className="pv-gallery" aria-label="Galería del producto">
          <div className="pv-gallery__sticky">

            <nav className="pv-breadcrumb" aria-label="Migas de pan">
              <Link href="/productos">Productos</Link>
              <span aria-hidden="true">/</span>
              <span>{product.nombre}</span>
            </nav>

            <div className="pv-gallery__frame">
              {/* Blurred background — same image, darkened, fills empty areas around contained image */}
              <div className="pv-gallery__blur-bg" aria-hidden="true">
                <Image
                  src={selectedImage}
                  alt=""
                  width={400}
                  height={400}
                  quality={40}
                  sizes="200px"
                  priority
                />
              </div>

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
                    alt={`${product.nombre}${selectedColorOption?.colorName ? ` — ${selectedColorOption.colorName}` : ''}`}
                    width={1400}
                    height={1400}
                    quality={94}
                    sizes="(max-width: 767px) 94vw, (max-width: 1023px) 52vw, 56vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              <span className="pv-gallery__cat-badge" aria-hidden="true">{product.categoria}</span>
            </div>

            {availableColors.length > 1 && (
              <div className="pv-gallery__colors" role="group" aria-label="Variantes de color">
                {availableColors.map((color) => (
                  <button
                    key={color.colorSlug}
                    className={`pv-color-thumb ${selectedColor === color.colorSlug ? 'is-active' : ''}`}
                    type="button"
                    onClick={() => setSelectedColor(color.colorSlug)}
                    aria-label={color.colorName}
                    aria-pressed={selectedColor === color.colorSlug}
                  >
                    <Image
                      src={normalizeImageUrl(color.path)}
                      alt={color.colorName}
                      width={96}
                      height={96}
                      sizes="72px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── BUYBOX ── */}
        <aside className="pv-buybox">

          {/* Meta */}
          <div className="pv-meta">
            <p className="pv-category">{product.categoria}</p>
            <h1 className="pv-title">{product.nombre}</h1>
            <div className="pv-price-row">
              <div className="pv-price-group">
                <strong className="pv-price">{formatPrice(product.precio)}</strong>
                <span className="pv-price-note">por unidad</span>
              </div>
              <button className="pv-price-cta" type="button" onClick={addToCart}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
                {hasCartItems ? 'Agregar otro' : 'Agregar al pedido'}
              </button>
            </div>
            {product.descripcion && product.descripcion.trim().toLowerCase() !== product.nombre.trim().toLowerCase() && (
              <p className="pv-description">{product.descripcion}</p>
            )}
          </div>

          {/* Config */}
          <div className="pv-config">

            {/* Tipo de remera — tabs compactos */}
            <div className="pv-inline-row">
              <span className="pv-inline-label">Tipo</span>
              <div className="pv-fit-tabs" role="group" aria-label="Tipo de remera">
                {FITS.map((fit) => (
                  <label
                    key={fit.key}
                    className={`pv-fit-tab ${selectedFit === fit.key ? 'is-active' : ''}`}
                    title={fit.note}
                  >
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

            {/* Talle */}
            <div className="pv-size-block">
              <div className="pv-size-block__head">
                <span className="pv-inline-label">Talle</span>
                <strong className="pv-inline-value">{selectedSize}</strong>
                <button
                  className="pv-size-guide-link"
                  type="button"
                  onClick={() => sizeGuideDialogRef.current?.showModal()}
                >
                  Ver tabla de talles
                </button>
              </div>
              <div className="pv-size-grid">
                {getAvailableSizes(selectedFit).map((size) => (
                  <label
                    className={`pv-size-option ${selectedSize === size ? 'is-selected' : ''}`}
                    key={size}
                  >
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

            {/* Color — inline swatches */}
            {availableColors.length > 0 && (
              <div className="pv-color-block">
                <div className="pv-size-block__head">
                  <span className="pv-inline-label">Color</span>
                  <strong className="pv-inline-value">{selectedColorOption?.colorName || 'Color principal'}</strong>
                </div>
                <div className="pv-color-swatches" role="group" aria-label="Seleccionar color">
                  {availableColors.map((color) => (
                    <button
                      key={color.colorSlug}
                      type="button"
                      className={`pv-color-swatch${selectedColor === color.colorSlug ? ' is-selected' : ''}`}
                      onClick={() => setSelectedColor(color.colorSlug)}
                      aria-pressed={selectedColor === color.colorSlug}
                      aria-label={color.colorName}
                    >
                      <span className="pv-swatch__dot" style={{ backgroundColor: color.colorHex }} />
                      <span className="pv-color-swatch__name">{color.colorName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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

          {/* ── ORDER BOX ── */}
          <div className="pv-order-box">
            <div className="pv-order-box__head">
              <div>
                <h2 className="pv-order-box__title">Tu pedido</h2>
                <p className="pv-order-box__sub">
                  {hasCartItems ? 'Sumá más remeras antes de finalizar.' : 'Configurá el tipo, talle y color.'}
                </p>
              </div>
              {hasCartItems && (
                <span className="pv-order-badge">
                  {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
                </span>
              )}
            </div>

            {hasCartItems ? (
              <ul className="pv-order-list" aria-label="Ítems en el pedido">
                {items.map((item) => (
                  <li key={item.id} className="pv-order-item">
                    <div className="pv-order-item__img">
                      <Image src={item.image} alt={item.productName} width={52} height={52} sizes="52px" />
                    </div>
                    <div className="pv-order-item__info">
                      <span className="pv-order-item__name">{item.productName}</span>
                      <span className="pv-order-item__meta">
                        {item.fitLabel} · T{item.size} · {item.color}
                      </span>
                    </div>
                    <div className="pv-order-item__right">
                      <span className="pv-order-item__price">{formatPrice(item.unitPrice * item.quantity)}</span>
                      <span className="pv-order-item__qty">×{item.quantity}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pv-order-empty">
                Elegí tus opciones y presioná <strong>Agregar al pedido</strong>.
              </p>
            )}

            {hasCartItems && (
              <div className="pv-order-total">
                <span>Total estimado</span>
                <strong>{formatPrice(cartGetTotal(items))}</strong>
              </div>
            )}

            <div className="pv-actions">
              {hasCartItems ? (
                <>
                  <a
                    className="pv-cta pv-cta--whatsapp"
                    href={orderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaWhatsapp size={18} aria-hidden="true" />
                    Finalizar por WhatsApp
                  </a>
                  <button className="pv-cta pv-cta--add" type="button" onClick={addToCart}>
                    Agregar al pedido
                  </button>
                  {showClearConfirm ? (
                    <div className="rr-inline-confirm" role="group" aria-label="Confirmar vaciado">
                      <span className="rr-inline-confirm__label">¿Vaciar todo el pedido?</span>
                      <button
                        className="rr-inline-confirm__btn rr-inline-confirm__btn--confirm"
                        type="button"
                        onClick={confirmClear}
                      >
                        Sí, vaciar
                      </button>
                      <button
                        className="rr-inline-confirm__btn rr-inline-confirm__btn--cancel"
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      className="pv-clear-btn"
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                    >
                      Vaciar pedido
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button className="pv-cta pv-cta--primary" type="button" onClick={addToCart}>
                    Agregar al pedido
                  </button>
                  <Link className="pv-link-btn" href="/productos">
                    Seguir viendo diseños
                  </Link>
                </>
              )}
            </div>

            <ul className="pv-trust" aria-label="Garantías">
              <li>DTF profesional</li>
              <li>Sin mínimo de compra</li>
              <li>Envíos a todo el país</li>
            </ul>
          </div>
        </aside>
      </div>


      {/* ── TOAST ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="rr-toast"
            role="status"
            aria-live="polite"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg
              className="rr-toast__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            ¡Agregado al pedido!
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
