/**
 * Normalizacion de patentes.
 *
 * La planilla viene cargada a mano desde un formulario de Google, asi que el
 * mismo auto puede aparecer como "FOY 496", "foy496" o "GRP'476". Para poder
 * agrupar los servicios de un vehiculo hay que reducir todo a una sola forma.
 */

/** Deja solo letras y numeros, en mayusculas. Es la clave de agrupacion. */
export function normalizarPatente(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor
    .normalize('NFD')
    // saca tildes que algun teclado pudo meter
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Formato lindo para mostrar en pantalla:
 *  - Mercosur (AB123CD) -> "AB 123 CD"
 *  - Vieja (ABC123)     -> "ABC 123"
 *  - Cualquier otra cosa se devuelve tal cual vino normalizada.
 */
export function formatearPatente(patente: string): string {
  const p = normalizarPatente(patente);
  if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(p)) return `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5)}`;
  if (/^[A-Z]{3}\d{3}$/.test(p)) return `${p.slice(0, 3)} ${p.slice(3)}`;
  return p;
}

/** Valida contra los dos formatos argentinos vigentes. */
export function esPatenteConFormatoArgentino(patente: string): boolean {
  const p = normalizarPatente(patente);
  return /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(p) || /^[A-Z]{3}\d{3}$/.test(p);
}

/**
 * Minimo aceptable para disparar una busqueda. No exigimos formato argentino
 * porque en la planilla hay patentes viejas, de otros paises y de maquinaria.
 */
export function esPatenteBuscable(patente: string): boolean {
  const p = normalizarPatente(patente);
  return p.length >= 5 && p.length <= 10;
}
