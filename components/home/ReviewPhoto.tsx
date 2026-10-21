'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';

type Props = {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  /** Lo que se muestra si no hay foto o si Google deja de servirla. */
  fallback?: ReactNode;
};

/** Foto que viene de Google: si falla, muestra el reemplazo en vez de una imagen rota. */
export function ReviewPhoto({ src, alt, width, height, className, sizes, fallback = null }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={75}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
