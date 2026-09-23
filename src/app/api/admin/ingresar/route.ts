import { NextResponse } from 'next/server';

import {
  COOKIE_SESION,
  DURACION_SESION_SEGUNDOS,
  RUTA_INGRESO,
  claveAdmin,
  claveCorrecta,
  destinoSeguro,
  generarToken,
} from '@/lib/admin';

/**
 * Valida la clave del local y abre la sesion administrativa.
 *
 * Recibe un formulario HTML comun (no fetch) para que la pantalla de ingreso
 * funcione aunque el navegador de la PC del mostrador tenga JavaScript
 * deshabilitado o falle la hidratacion.
 */
export async function POST(pedido: Request) {
  const datos = await pedido.formData();
  const ingresada = String(datos.get('clave') ?? '');
  const destino = destinoSeguro(String(datos.get('destino') ?? ''));

  if (!(await claveCorrecta(ingresada))) {
    const motivo = claveAdmin() ? 'incorrecta' : 'sin-configurar';
    return NextResponse.redirect(
      new URL(`${RUTA_INGRESO}?error=${motivo}&destino=${encodeURIComponent(destino)}`, pedido.url),
      { status: 303 },
    );
  }

  const respuesta = NextResponse.redirect(new URL(destino, pedido.url), { status: 303 });

  respuesta.cookies.set(COOKIE_SESION, await generarToken(ingresada), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACION_SESION_SEGUNDOS,
  });

  return respuesta;
}
