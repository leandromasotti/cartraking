/**
 * Acceso a la parte administrativa.
 *
 * El sistema tiene dos publicos bien separados:
 *
 *   - El cliente del lubricentro, que entra sin identificarse y solo lee:
 *     su historial, cuando le toca el proximo cambio, y los datos de
 *     contacto. No puede modificar nada porque la aplicacion entera es de
 *     solo lectura sobre la planilla.
 *
 *   - El personal del local, que ademas imprime los tickets con QR. Eso vive
 *     bajo /admin y pide una clave.
 *
 * La clave es una sola, compartida por el local, y vive en la variable de
 * entorno CLAVE_ADMIN. No hay usuarios ni base de datos: para un taller de
 * dos o tres personas, agregar eso seria infraestructura sin beneficio.
 *
 * Este modulo corre tambien en el middleware (runtime Edge), asi que usa
 * Web Crypto y no `node:crypto`.
 */

export const COOKIE_SESION = 'dl_admin';
export const RUTA_INGRESO = '/admin/ingresar';

/** 30 dias: la PC del mostrador no deberia tener que reingresar la clave seguido. */
export const DURACION_SESION_SEGUNDOS = 60 * 60 * 24 * 30;

const CODIFICADOR = new TextEncoder();

/** Devuelve la clave configurada, o null si falta la variable de entorno. */
export function claveAdmin(): string | null {
  const clave = process.env.CLAVE_ADMIN;
  return clave && clave.length > 0 ? clave : null;
}

async function hmacHex(clave: string, mensaje: string): Promise<string> {
  const material = await crypto.subtle.importKey(
    'raw',
    CODIFICADOR.encode(clave),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const firma = await crypto.subtle.sign('HMAC', material, CODIFICADOR.encode(mensaje));
  return Array.from(new Uint8Array(firma))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Valor que se guarda en la cookie de sesion.
 *
 * Es un HMAC derivado de la clave, no la clave misma: aunque alguien lea la
 * cookie no obtiene la contrasena del local. Y como deriva de la clave,
 * cambiarla invalida sola todas las sesiones abiertas.
 */
export async function generarToken(clave: string): Promise<string> {
  return hmacHex(clave, 'sesion-admin-v1');
}

/** Comparacion en tiempo constante, para no filtrar informacion por timing. */
export function sonIguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferencia === 0;
}

/** true si la cookie corresponde a la clave configurada. */
export async function sesionValida(token: string | undefined): Promise<boolean> {
  const clave = claveAdmin();
  // Sin clave configurada, el area administrativa queda cerrada a proposito.
  if (!clave || !token) return false;
  return sonIguales(token, await generarToken(clave));
}

/** true si la clave ingresada en el formulario es la correcta. */
export async function claveCorrecta(ingresada: string): Promise<boolean> {
  const clave = claveAdmin();
  if (!clave) return false;
  return sonIguales(ingresada, clave);
}

/**
 * Evita un open redirect: despues de ingresar solo se vuelve a una ruta
 * interna del area administrativa, nunca a un dominio externo.
 */
export function destinoSeguro(destino: string | null | undefined): string {
  if (!destino) return '/admin';
  // "//otro-dominio.com" es una URL absoluta disfrazada de ruta relativa.
  if (destino.startsWith('//')) return '/admin';
  // Se exige el panel exacto o algo colgando de el. Comparar con '/admin' a
  // secas dejaria pasar '/adminfalso', que no es parte del area.
  if (destino !== '/admin' && !destino.startsWith('/admin/')) return '/admin';
  return destino;
}
