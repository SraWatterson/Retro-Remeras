import type { Metadata } from 'next';
import { FloatingBackButton } from '@/components/layout/FloatingBackButton';
import './css/style.css';

export const metadata: Metadata = {
  title: 'Retro Remeras',
  description: 'Remeras con estilo, nostalgia y personalidad.',
  icons: { icon: '/assets/icons/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        {children}
        <FloatingBackButton />
      </body>
    </html>
  );
}