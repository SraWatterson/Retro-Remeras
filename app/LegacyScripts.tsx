'use client';

import Script from 'next/script';

export default function LegacyScripts({ scripts }: { scripts: { src: string; type?: string }[] }) {
  return (
    <>
      {scripts.map((script) => (
        <Script key={script.src} src={script.src} type={script.type} strategy="afterInteractive" />
      ))}
    </>
  );
}
