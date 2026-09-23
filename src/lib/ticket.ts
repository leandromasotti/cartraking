/**
 * Formatos de impresion.
 *
 * Los rollos termicos vienen en 58 y 80 mm, pero el cabezal no imprime hasta
 * el borde: el area util es siempre menor que el papel. Estos son los valores
 * estandar de las termicas de 203 dpi que se usan en mostrador.
 *
 * El logo tiene una version monocroma por ancho, generada a exactamente 8 px
 * por milimetro (la resolucion del cabezal) para que no haya reescalado.
 *
 * Hay dos tipos de salida:
 *
 *   - `ticket`: comprobante de alto libre. El rollo corta a la medida del
 *     contenido, asi que entra el detalle del ultimo servicio.
 *   - `sticker`: etiqueta autoadhesiva de alto fijo, pensada para pegar en la
 *     libreta de servicio del cliente. Al ser de alto fijo, solo entra lo
 *     imprescindible: patente, cuando volver y el QR.
 */

export const FORMATOS = {
  58: {
    etiqueta: 'Ticket 58 mm',
    tipo: 'ticket',
    papelMm: 58,
    utilMm: 48,
    /** null = alto libre, el rollo corta donde termina el contenido. */
    altoMm: null,
    qrMm: 34,
    logo: '/logo-ticket-58.png',
    logoMm: 30,
  },
  80: {
    etiqueta: 'Ticket 80 mm',
    tipo: 'ticket',
    papelMm: 80,
    utilMm: 72,
    altoMm: null,
    qrMm: 46,
    logo: '/logo-ticket-80.png',
    logoMm: 40,
  },
  sticker: {
    etiqueta: 'Sticker 80 x 60 mm',
    tipo: 'sticker',
    papelMm: 80,
    utilMm: 72,
    altoMm: 60,
    // 30 mm es el piso practico para que un celular enganche el codigo sin
    // tener que acercarse: por debajo de eso empieza a fallar.
    qrMm: 30,
    logo: '/logo-ticket-80.png',
    logoMm: 26,
  },
} as const;

export type Formato = keyof typeof FORMATOS;
export type Medidas = (typeof FORMATOS)[Formato];

export const FORMATO_POR_DEFECTO: Formato = 80;

/** Claves validas, en el orden en que se muestran los botones. */
export const FORMATOS_DISPONIBLES = [58, 80, 'sticker'] as const satisfies readonly Formato[];

/**
 * Interpreta el parametro `?formato=` de la URL.
 * Cualquier valor desconocido cae en el formato por defecto.
 */
export function formatoDesdeParametro(valor: string | string[] | undefined): Formato {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  if (texto === '58') return 58;
  if (texto === '80') return 80;
  if (texto === 'sticker') return 'sticker';
  return FORMATO_POR_DEFECTO;
}
