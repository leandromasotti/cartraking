import type { Metadata, Viewport } from 'next';

import { Encabezado } from '@/components/Encabezado';
import { PieDePagina } from '@/components/PieDePagina';
import { LOCAL, urlDelSitio } from '@/lib/config';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(urlDelSitio()),
  title: {
    default: `${LOCAL.nombre} - Consulta tus cambios de aceite`,
    template: `%s | ${LOCAL.nombre}`,
  },
  description: `${LOCAL.descripcion} en Dolores, Buenos Aires. Consulta el historial de servicios de tu vehiculo por patente y enterate cuando toca el proximo cambio.`,
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: LOCAL.nombre,
    description: LOCAL.descripcion,
    locale: 'es_AR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#07090c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className="flex min-h-dvh flex-col antialiased">
        <Encabezado />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>
        <PieDePagina />
      </body>
    </html>
  );
}
