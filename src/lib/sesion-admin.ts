import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { COOKIE_SESION, RUTA_INGRESO, sesionValida } from './admin';

/**
 * Exige sesion del local dentro de la propia pagina.
 *
 * El middleware ya bloquea /admin, pero Next acumula un historial de
 * vulnerabilidades de "middleware bypass" (GHSA-492v-c6pp-mqqv,
 * GHSA-267c-6grr-h53f, GHSA-26hh-7cqf-hhc6, entre otras): peticiones
 * fabricadas que llegan a la pagina sin pasar por el middleware. La
 * recomendacion del propio equipo de Next despues de esos casos es no apoyar
 * la autorizacion unicamente ahi.
 *
 * Por eso cada pagina de /admin vuelve a chequear la sesion del lado del
 * servidor. El middleware queda como la capa que da la redireccion prolija;
 * esta es la que de verdad decide.
 *
 * No se puede hacer desde `admin.ts` porque ese modulo lo importa el
 * middleware, que corre en Edge y no tiene `next/headers`.
 */
export async function exigirSesionAdmin(destino: string): Promise<void> {
  const galletas = await cookies();

  if (await sesionValida(galletas.get(COOKIE_SESION)?.value)) return;

  redirect(`${RUTA_INGRESO}?destino=${encodeURIComponent(destino)}`);
}
