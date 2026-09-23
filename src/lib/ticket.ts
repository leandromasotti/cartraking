/**
 * Medidas del papel termico.
 *
 * Los rollos vienen en 58 y 80 mm, pero el cabezal no imprime hasta el borde:
 * el area util es siempre menor que el papel. Estos son los valores estandar
 * de las termicas de 203 dpi que se usan en mostrador.
 *
 * El logo tiene una version monocroma por ancho, generada a exactamente 8 px
 * por milimetro (la resolucion del cabezal) para que no haya reescalado.
 */
export const ANCHOS_DE_PAPEL = {
  58: { papelMm: 58, utilMm: 48, qrMm: 34, logo: '/logo-ticket-58.png', logoMm: 30 },
  80: { papelMm: 80, utilMm: 72, qrMm: 46, logo: '/logo-ticket-80.png', logoMm: 40 },
} as const;

export type AnchoDePapel = keyof typeof ANCHOS_DE_PAPEL;

export const ANCHO_POR_DEFECTO: AnchoDePapel = 80;

/** Interpreta el parametro `?ancho=` de la URL. */
export function anchoDesdeParametro(valor: string | string[] | undefined): AnchoDePapel {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto === '58' ? 58 : texto === '80' ? 80 : ANCHO_POR_DEFECTO;
}
