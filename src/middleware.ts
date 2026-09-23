import { NextResponse, type NextRequest } from 'next/server';

import { COOKIE_SESION, RUTA_INGRESO, sesionValida } from '@/lib/admin';

/**
 * Deja pasar a /admin solo con una sesion valida.
 *
 * Todo lo demas del sitio (inicio, detalle por patente, la API de consulta)
 * es publico y de solo lectura: el cliente no necesita identificarse para ver
 * su historial ni para escribirle al local por WhatsApp.
 */
export async function middleware(pedido: NextRequest) {
  const { pathname, search } = pedido.nextUrl;

  // La propia pantalla de ingreso no puede pedir sesion.
  if (pathname === RUTA_INGRESO) return NextResponse.next();

  if (await sesionValida(pedido.cookies.get(COOKIE_SESION)?.value)) {
    return NextResponse.next();
  }

  const destino = pedido.nextUrl.clone();
  destino.pathname = RUTA_INGRESO;
  destino.search = `?destino=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
