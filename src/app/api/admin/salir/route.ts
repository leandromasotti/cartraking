import { NextResponse } from 'next/server';

import { COOKIE_SESION, RUTA_INGRESO } from '@/lib/admin';

/** Cierra la sesion administrativa borrando la cookie. */
export async function POST(pedido: Request) {
  const respuesta = NextResponse.redirect(new URL(RUTA_INGRESO, pedido.url), { status: 303 });
  respuesta.cookies.delete(COOKIE_SESION);
  return respuesta;
}
