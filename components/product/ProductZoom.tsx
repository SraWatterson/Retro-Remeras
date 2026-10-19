'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
};

const MIN = 1;
const MAX = 4;
const TAP_ZOOM = 2.5;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Visor a pantalla completa para ver la remera de cerca.
 * - Compu: clic para acercar donde apuntás, rueda del mouse para más o menos zoom,
 *   arrastrar para moverse. Esc o la X para cerrar.
 * - Celular: tocar para acercar, pellizcar con dos dedos, arrastrar con uno.
 */
export function ProductZoom({ src, alt, open, onClose }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const scale = view.scale;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ moved: false, startDist: 0, startScale: 1, lastX: 0, lastY: 0 });
  const closeRef = useRef<HTMLButtonElement>(null);

  const reset = useCallback(() => setView({ scale: 1, x: 0, y: 0 }), []);

  // Mantiene la imagen dentro de la pantalla al moverla.
  const clampOffset = useCallback((x: number, y: number, s: number) => {
    const stage = stageRef.current;
    if (!stage) return { x, y };
    const maxX = (stage.clientWidth * (s - 1)) / 2;
    const maxY = (stage.clientHeight * (s - 1)) / 2;
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  }, []);

  // Acerca hacia un punto de la pantalla (donde se tocó o apuntó).
  const zoomAt = useCallback(
    (nextScale: number, clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const px = clientX - rect.left - rect.width / 2;
      const py = clientY - rect.top - rect.height / 2;
      const s = clamp(nextScale, MIN, MAX);
      setView((prev) => {
        if (s === 1) return { scale: 1, x: 0, y: 0 };
        const ratio = s / prev.scale;
        const { x, y } = clampOffset(px - (px - prev.x) * ratio, py - (py - prev.y) * ratio, s);
        return { scale: s, x, y };
      });
    },
    [clampOffset],
  );

  useEffect(() => {
    if (!open) return;
    reset();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, reset]);

  if (!open || typeof document === 'undefined') return null;

  const onPointerDown = (event: React.PointerEvent) => {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gesture.current.moved = false;
    gesture.current.lastX = event.clientX;
    gesture.current.lastY = event.clientY;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.startDist = Math.hypot(a.x - b.x, a.y - b.y);
      gesture.current.startScale = scale;
    }
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (gesture.current.startDist > 0) {
        gesture.current.moved = true;
        zoomAt(gesture.current.startScale * (dist / gesture.current.startDist), (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      return;
    }

    const dx = event.clientX - gesture.current.lastX;
    const dy = event.clientY - gesture.current.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) gesture.current.moved = true;
    gesture.current.lastX = event.clientX;
    gesture.current.lastY = event.clientY;
    if (scale > 1) setView((v) => ({ ...v, ...clampOffset(v.x + dx, v.y + dy, v.scale) }));
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const wasPinch = pointers.current.size === 2;
    pointers.current.delete(event.pointerId);
    if (wasPinch) {
      gesture.current.startDist = 0;
      return;
    }
    // Toque o clic sin arrastrar: acerca o vuelve al tamaño normal.
    if (!gesture.current.moved && pointers.current.size === 0) {
      if (scale > 1) reset();
      else zoomAt(TAP_ZOOM, event.clientX, event.clientY);
    }
  };

  const onWheel = (event: React.WheelEvent) => {
    zoomAt(scale * (event.deltaY < 0 ? 1.15 : 1 / 1.15), event.clientX, event.clientY);
  };

  return createPortal(
    <div className="pz" role="dialog" aria-modal="true" aria-label={`Foto ampliada: ${alt}`}>
      <button
        type="button"
        className="pz__backdrop"
        aria-label="Cerrar foto ampliada"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={stageRef}
        className={`pz__stage${scale > 1 ? ' is-zoomed' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          className="pz__img"
          style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${scale})` }}
        >
          <Image src={src} alt={alt} width={1600} height={1600} quality={85} sizes="100vw" priority draggable={false} />
        </div>
      </div>

      <button ref={closeRef} type="button" className="pz__close" onClick={onClose} aria-label="Cerrar">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="pz__controls" aria-label="Zoom">
        <button type="button" onClick={() => zoomAt(scale / 1.5, innerWidth / 2, innerHeight / 2)} aria-label="Alejar" disabled={scale <= MIN}>
          −
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => zoomAt(scale * 1.5, innerWidth / 2, innerHeight / 2)} aria-label="Acercar" disabled={scale >= MAX}>
          +
        </button>
      </div>

      <p className="pz__hint">{scale > 1 ? 'Arrastrá para moverte · tocá para volver' : 'Tocá la foto para acercarla'}</p>
    </div>,
    document.body,
  );
}
