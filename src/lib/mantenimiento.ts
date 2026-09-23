/**
 * Reglas de mantenimiento.
 *
 * Criterio acordado con el lubricentro: el cambio de aceite vence a los
 * 10.000 km o al ano, lo que ocurra primero. La mediana real de la planilla
 * es 11.600 km / 244 dias entre servicios, asi que el intervalo es coherente
 * con lo que el taller ya viene haciendo.
 */

export const INTERVALO_KM = 10_000;
export const INTERVALO_MESES = 12;

/** Cuantos dias antes del vencimiento empezamos a avisar. */
export const DIAS_DE_AVISO_PREVIO = 30;

export type EstadoMantenimiento = 'al-dia' | 'por-vencer' | 'vencido' | 'sin-datos';

export interface ServicioBase {
  fecha: Date | null;
  kilometros: number | null;
}

export interface ProximoServicio {
  estado: EstadoMantenimiento;
  /** Km del odometro en los que corresponde el proximo cambio. */
  kilometrajeObjetivo: number | null;
  /** Fecha limite por tiempo (ultimo servicio + 12 meses). */
  fechaObjetivo: Date | null;
  /** Dias desde el ultimo servicio. Negativo no ocurre: se recorta a 0. */
  diasTranscurridos: number | null;
  /** Dias que faltan para la fecha objetivo. Negativo = vencido hace N dias. */
  diasRestantes: number | null;
  /** true cuando ya paso mas de un ano desde el ultimo cambio. */
  vencidoPorTiempo: boolean;
}

const MS_POR_DIA = 86_400_000;

/** Suma meses respetando fin de mes (31/01 + 1 mes = 28/02, no 03/03). */
export function sumarMeses(fecha: Date, meses: number): Date {
  const resultado = new Date(fecha.getTime());
  const diaOriginal = resultado.getDate();
  resultado.setDate(1);
  resultado.setMonth(resultado.getMonth() + meses);
  const ultimoDiaDelMes = new Date(resultado.getFullYear(), resultado.getMonth() + 1, 0).getDate();
  resultado.setDate(Math.min(diaOriginal, ultimoDiaDelMes));
  return resultado;
}

/** Diferencia en dias completos entre dos fechas, ignorando la hora. */
export function diferenciaEnDias(desde: Date, hasta: Date): number {
  const a = Date.UTC(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const b = Date.UTC(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((b - a) / MS_POR_DIA);
}

/**
 * Calcula el proximo cambio a partir del ultimo servicio registrado.
 *
 * `hoy` se inyecta para que los tests sean deterministicos y para poder
 * renderizar con la fecha del servidor.
 */
export function calcularProximoServicio(
  ultimoServicio: ServicioBase | null | undefined,
  hoy: Date = new Date(),
): ProximoServicio {
  if (!ultimoServicio) {
    return {
      estado: 'sin-datos',
      kilometrajeObjetivo: null,
      fechaObjetivo: null,
      diasTranscurridos: null,
      diasRestantes: null,
      vencidoPorTiempo: false,
    };
  }

  const { fecha, kilometros } = ultimoServicio;

  const kilometrajeObjetivo =
    kilometros != null && kilometros > 0 ? kilometros + INTERVALO_KM : null;

  if (!fecha) {
    // Sin fecha no podemos evaluar el vencimiento por tiempo, pero el km
    // objetivo sigue siendo util para el cliente.
    return {
      estado: kilometrajeObjetivo != null ? 'al-dia' : 'sin-datos',
      kilometrajeObjetivo,
      fechaObjetivo: null,
      diasTranscurridos: null,
      diasRestantes: null,
      vencidoPorTiempo: false,
    };
  }

  const fechaObjetivo = sumarMeses(fecha, INTERVALO_MESES);
  const diasTranscurridos = Math.max(0, diferenciaEnDias(fecha, hoy));
  const diasRestantes = diferenciaEnDias(hoy, fechaObjetivo);
  const vencidoPorTiempo = diasRestantes < 0;

  let estado: EstadoMantenimiento;
  if (vencidoPorTiempo) estado = 'vencido';
  else if (diasRestantes <= DIAS_DE_AVISO_PREVIO) estado = 'por-vencer';
  else estado = 'al-dia';

  return {
    estado,
    kilometrajeObjetivo,
    fechaObjetivo,
    diasTranscurridos,
    diasRestantes,
    vencidoPorTiempo,
  };
}

/**
 * Km que le faltan al cliente para el proximo cambio, si nos dice cuanto
 * marca el odometro hoy. Devuelve negativo si ya se paso.
 */
export function kilometrosRestantes(
  kilometrajeObjetivo: number | null,
  kilometrajeActual: number | null,
): number | null {
  if (kilometrajeObjetivo == null || kilometrajeActual == null) return null;
  return kilometrajeObjetivo - kilometrajeActual;
}

export const ETIQUETAS_ESTADO: Record<EstadoMantenimiento, string> = {
  'al-dia': 'Al dia',
  'por-vencer': 'Proximo a vencer',
  vencido: 'Cambio vencido',
  'sin-datos': 'Sin datos suficientes',
};
