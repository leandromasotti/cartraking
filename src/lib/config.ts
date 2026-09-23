/** Configuracion leida del entorno. Se resuelve en el servidor. */

function requerido(nombre: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copiala de .env.example a .env.local (o cargala en Vercel).`,
    );
  }
  return valor;
}

export const SHEET_ID =
  process.env.GOOGLE_SHEET_ID ?? '1zys7fdduzD5hoT8qpfBAUqWU2E2hx1NXcf-gLlWzCBU';

export const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE ?? 'Respuestas de formulario 5!A:J';

export const CACHE_TTL_SEGUNDOS = Number(process.env.SHEET_CACHE_TTL_SECONDS ?? '300');

export function apiKey(): string {
  return requerido('GOOGLE_SHEETS_API_KEY', process.env.GOOGLE_SHEETS_API_KEY);
}

/**
 * URL publica del sitio, sin barra final. Es lo que se codifica en el QR, asi
 * que tiene que ser la URL a la que llega el cliente desde el celular.
 */
export function urlDelSitio(): string {
  const explicita = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicita) return explicita.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

/** Datos de contacto del local. Centralizados para no repetirlos en cada vista. */
export const LOCAL = {
  nombre: 'Dolores Lubricantes',
  descripcion: 'Servicio de cambio de aceite y filtros',
  telefono: '02245 50-9775',
  telefonoInternacional: '542245509775',
  /** Como se muestra el numero internacional, ya sin el 0 del prefijo local. */
  telefonoWhatsApp: '+54 2245 50-9775',
  email: 'lubricentrodolores@gmail.com',
  direccion: 'Moreno 321, B7100 Dolores, Buenos Aires',
  facebook: 'https://www.facebook.com/Dolores-Lubricantes-2288399798114557/',
  instagram: 'https://www.instagram.com/doloreslubricantes/',
  mapa: 'https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d6429.561759238092!2d-57.687384576882486!3d-36.31762017546096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x95999e5c24926e15%3A0xaa5b419c41900d94!2sMoreno%20321%2C%20B7100%20Dolores%2C%20Provincia%20de%20Buenos%20Aires!3m2!1d-36.317628899999995!2d-57.6830072!5e0!3m2!1ses!2sar!4v1608559868499!5m2!1ses!2sar',
} as const;

export function linkWhatsApp(mensaje?: string): string {
  const base = `https://api.whatsapp.com/send?phone=${LOCAL.telefonoInternacional}`;
  return mensaje ? `${base}&text=${encodeURIComponent(mensaje)}` : base;
}
