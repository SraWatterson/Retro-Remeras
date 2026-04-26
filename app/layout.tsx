import type { Metadata } from 'next';
import './css/style.css';
import './css/catalogo.css';
import './css/producto.css';
import './css/carrito.css';
import './css/admin.css';

export const metadata: Metadata = {
  title: 'Retro Remeras',
  description: 'Remeras con estilo, nostalgia y personalidad.',
  icons: { icon: '/assets/icons/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
