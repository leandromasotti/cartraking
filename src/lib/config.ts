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
  direccion: 'Moreno 305, B7100 Dolores, Buenos Aires',
  facebook: 'https://www.facebook.com/Dolores-Lubricantes-2288399798114557/',
  instagram: 'https://www.instagram.com/doloreslubricantes/',
  // Embed por consulta en vez del parametro `pb` codificado de Google: ese
  // blob no se puede editar a mano y quedaba apuntando a la direccion vieja.
  mapa: 'https://maps.google.com/maps?q=Dolores+Lubricantes,+Moreno+305,+Dolores,+Buenos+Aires&z=17&output=embed',
  /** Abre la ficha del local en la app de mapas, para tocar "Como llegar". */
  comoLlegar: 'https://www.google.com/maps/dir/?api=1&destination=-36.3175747,-57.6828817',
} as const;

export function linkWhatsApp(mensaje?: string): string {
  const base = `https://api.whatsapp.com/send?phone=${LOCAL.telefonoInternacional}`;
  return mensaje ? `${base}&text=${encodeURIComponent(mensaje)}` : base;
}
