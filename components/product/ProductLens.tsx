'use client';

import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  frameRef: RefObject<HTMLDivElement | null>;
  /** Columna de la derecha (precio, talles…): el zoom se muestra encima de ella. */
  sideRef: RefObject<HTMLElement | null>;
  src: string;
};

/** Cuánto se agranda la remera en el panel de zoom. */
const ZOOM = 2.6;

type LensState = {
  lens: { left: number; top: number; width: number; height: number };
  pane: { left: number; top: number; width: number; height: number };
  bgSize: string;
  bgPos: string;
} | null;

/** Versión grande de la foto, optimizada por Next (formato web, buena calidad). */
function hiResUrl(src: string) {
  if (!src) return '';
  return `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=90`;
}

/**
 * Zoom tipo Mercado Libre (solo compu con mouse):
 * al pasar el mouse por la foto aparece un recuadro que lo sigue y, al costado,
 * un panel grande con esa parte de la remera ampliada.
 */
export function ProductLens({ frameRef, sideRef, src }: Props) {
  const [state, setState] = useState<LensState>(null);
  const [enabled, setEnabled] = useState(false);
  const hiRes = hiResUrl(src);

  // Solo en pantallas grandes con mouse (en celular y tablet se usa el visor).
  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Precarga la versión grande para que el zoom aparezca al instante.
  useEffect(() => {
    if (!enabled || !hiRes) return;
    const img = new window.Image();
    img.src = hiRes;
  }, [enabled, hiRes]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !enabled) return;

    const onMove = (event: MouseEvent) => {
      const side = sideRef.current;
      const img = frame.querySelector<HTMLImageElement>('.pv-gallery__img img');
      if (!side || !img || !img.naturalWidth) return;

      // Parte de la foto que realmente se ve (la foto va "contain" dentro del cuadro).
      const box = img.getBoundingClientRect();
      const ratio = img.naturalWidth / img.naturalHeight;
      let cw = box.width;
      let ch = box.width / ratio;
      if (ch > box.height) {
        ch = box.height;
        cw = box.height * ratio;
      }
      const cx0 = box.left + (box.width - cw) / 2;
      const cy0 = box.top + (box.height - ch) / 2;
      const x = event.clientX - cx0;
      const y = event.clientY - cy0;

      if (x < 0 || y < 0 || x > cw || y > ch) {
        setState(null);
        return;
      }

      const frameRect = frame.getBoundingClientRect();
      const sideRect = side.getBoundingClientRect();
      const pane = {
        left: sideRect.left,
        top: frameRect.top,
        width: sideRect.width,
        height: frameRect.height,
      };

      const lw = Math.min(cw, pane.width / ZOOM);
      const lh = Math.min(ch, pane.height / ZOOM);
      const lx = Math.min(Math.max(x - lw / 2, 0), cw - lw);
      const ly = Math.min(Math.max(y - lh / 2, 0), ch - lh);

      setState({
        lens: { left: cx0 - frameRect.left + lx, top: cy0 - frameRect.top + ly, width: lw, height: lh },
        pane,
        bgSize: `${cw * ZOOM}px ${ch * ZOOM}px`,
        bgPos: `${-lx * ZOOM}px ${-ly * ZOOM}px`,
      });
    };

    const onLeave = () => setState(null);
    frame.addEventListener('mousemove', onMove);
    frame.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onLeave, { passive: true });
    return () => {
      frame.removeEventListener('mousemove', onMove);
      frame.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onLeave);
    };
  }, [frameRef, sideRef, enabled]);

  if (!enabled || !state || typeof document === 'undefined') return null;
  const frame = frameRef.current;
  if (!frame) return null;

  return (
    <>
      {createPortal(<span className="pv-lens" aria-hidden="true" style={state.lens} />, frame)}
      {createPortal(
        <div
          className="pv-zoom-pane"
          aria-hidden="true"
          style={{
            ...state.pane,
            backgroundImage: `url("${hiRes}")`,
            backgroundSize: state.bgSize,
            backgroundPosition: state.bgPos,
          }}
        />,
        document.body,
      )}
    </>
  );
}
