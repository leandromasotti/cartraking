/** Formateo de fechas y numeros en castellano rioplatense. */

const FORMATO_FECHA = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Argentina/Buenos_Aires',
});

const FORMATO_FECHA_LARGA = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Argentina/Buenos_Aires',
});

const FORMATO_NUMERO = new Intl.NumberFormat('es-AR');

export function formatearFecha(fecha: Date | null, respaldo = '-'): string {
  return fecha ? FORMATO_FECHA.format(fecha) : respaldo;
}

export function formatearFechaLarga(fecha: Date | null, respaldo = '-'): string {
  return fecha ? FORMATO_FECHA_LARGA.format(fecha) : respaldo;
}

export function formatearKilometros(km: number | null, respaldo = 'sin dato'): string {
  return km == null ? respaldo : `${FORMATO_NUMERO.format(km)} km`;
}

export function formatearNumero(valor: number): string {
  return FORMATO_NUMERO.format(valor);
}

/** "hace 1 ano y 2 meses", "hace 18 dias", "hoy". */
export function describirAntiguedad(dias: number | null): string {
  if (dias == null) return 'sin dato';
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'hace 1 dia';
  if (dias < 31) return `hace ${dias} dias`;

  const meses = Math.floor(dias / 30.44);
  if (meses < 12) return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`;

  const anios = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  const parteAnios = anios === 1 ? '1 ano' : `${anios} anos`;
  if (mesesRestantes === 0) return `hace ${parteAnios}`;
  const parteMeses = mesesRestantes === 1 ? '1 mes' : `${mesesRestantes} meses`;
  return `hace ${parteAnios} y ${parteMeses}`;
}
