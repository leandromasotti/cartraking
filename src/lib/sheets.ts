import 'server-only';

import { CACHE_TTL_SEGUNDOS, SHEET_ID, SHEET_RANGE, apiKey } from './config';
import { normalizarPatente } from './patente';

/**
 * Lectura de la planilla de Google.
 *
 * La hoja es la salida cruda de un Formulario de Google y tiene una fila por
 * servicio realizado. Columnas (A..J):
 *
 *   A  Marca temporal          "1/02/2020 8:47:24"  (d/M/yyyy, zona AR)
 *   B  VEHICULO                "LOGAN 1.6 NAFTA"
 *   C  PATENTE                 "AC313YQ"
 *   D  KILOMETROS              "80800"
 *   E  FILTRO DE ACEITE        "SI" | "NO"
 *   F  FILTRO DE AIRE          "SI" | "NO"
 *   G  FILTRO DE COMBUSTIBLE   "SI" | "NO"
 *   H  FILTRO HABITACULO       "SI" | "NO"
 *   I  ACEITE                  "TOTAL 7000"
 *   J  PRECIO TOTAL            "2580"   <- interno, no se expone al cliente
 *
 * La API devuelve filas de largo variable: si las ultimas celdas estan vacias
 * simplemente no vienen. Todo el parseo asume eso.
 */

export interface Servicio {
  fecha: Date | null;
  /** La fecha tal cual figura en la planilla, por si no se pudo parsear. */
  fechaTexto: string;
  kilometros: number | null;
  filtroAceite: boolean;
  filtroAire: boolean;
  filtroCombustible: boolean;
  filtroHabitaculo: boolean;
  aceite: string;
  /** Descripcion del auto tal como se cargo en esa fila. */
  vehiculoTexto: string;
}

export interface Vehiculo {
  /** Patente normalizada (solo letras y numeros). */
  patente: string;
  /** Descripcion del vehiculo segun el ultimo servicio cargado. */
  vehiculo: string;
  /** Servicios ordenados del mas nuevo al mas viejo. */
  servicios: Servicio[];
}

const COL = {
  fecha: 0,
  vehiculo: 1,
  patente: 2,
  kilometros: 3,
  filtroAceite: 4,
  filtroAire: 5,
  filtroCombustible: 6,
  filtroHabitaculo: 7,
  aceite: 8,
} as const;

/** "1/02/2020 8:47:24" -> Date. Devuelve null si no se puede interpretar. */
export function parsearFecha(texto: string | undefined): Date | null {
  if (!texto) return null;
  const m = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(texto);
  if (!m) return null;

  const [, dia, mes, anio, hora, minuto, segundo] = m;
  const d = Number(dia);
  const mth = Number(mes);
  if (d < 1 || d > 31 || mth < 1 || mth > 12) return null;

  const fecha = new Date(
    Number(anio),
    mth - 1,
    d,
    Number(hora ?? 0),
    Number(minuto ?? 0),
    Number(segundo ?? 0),
  );
  // Rebote por fechas imposibles tipo 31/02.
  if (fecha.getDate() !== d || fecha.getMonth() !== mth - 1) return null;
  return fecha;
}

/** "80800", "80.800", "80 800 km" -> 80800. "NO INDICA" -> null. */
export function parsearKilometros(texto: string | undefined): number | null {
  if (!texto) return null;
  const soloDigitos = texto.replace(/[^\d]/g, '');
  if (!soloDigitos) return null;
  const valor = Number(soloDigitos);
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

function parsearSiNo(texto: string | undefined): boolean {
  return (texto ?? '').trim().toUpperCase().startsWith('SI');
}

export function filaAServicio(fila: string[]): Servicio {
  return {
    fecha: parsearFecha(fila[COL.fecha]),
    fechaTexto: (fila[COL.fecha] ?? '').trim(),
    kilometros: parsearKilometros(fila[COL.kilometros]),
    filtroAceite: parsearSiNo(fila[COL.filtroAceite]),
    filtroAire: parsearSiNo(fila[COL.filtroAire]),
    filtroCombustible: parsearSiNo(fila[COL.filtroCombustible]),
    filtroHabitaculo: parsearSiNo(fila[COL.filtroHabitaculo]),
    aceite: (fila[COL.aceite] ?? '').trim(),
    vehiculoTexto: (fila[COL.vehiculo] ?? '').trim(),
  };
}

/** Ordena del servicio mas nuevo al mas viejo. Las filas sin fecha van al final. */
function masNuevoPrimero(a: Servicio, b: Servicio): number {
  if (a.fecha && b.fecha) return b.fecha.getTime() - a.fecha.getTime();
  if (a.fecha) return -1;
  if (b.fecha) return 1;
  return 0;
}

/**
 * Agrupa las filas crudas por patente normalizada.
 * Se exporta aparte de la descarga para poder testear el parseo sin red.
 */
export function agruparPorPatente(filas: string[][]): Map<string, Vehiculo> {
  const vehiculos = new Map<string, Vehiculo>();

  for (const fila of filas) {
    const patente = normalizarPatente(fila[COL.patente]);
    if (!patente) continue;

    const servicio = filaAServicio(fila);
    const existente = vehiculos.get(patente);

    if (existente) {
      existente.servicios.push(servicio);
    } else {
      vehiculos.set(patente, { patente, vehiculo: '', servicios: [servicio] });
    }
  }

  for (const vehiculo of vehiculos.values()) {
    vehiculo.servicios.sort(masNuevoPrimero);
    // La descripcion del auto puede estar vacia o peor escrita en algunas
    // cargas: tomamos la del servicio mas reciente que tenga algo.
    vehiculo.vehiculo = vehiculo.servicios.find((s) => s.vehiculoTexto)?.vehiculoTexto ?? '';
  }

  return vehiculos;
}

// --- Descarga con cache en memoria -----------------------------------------
//
// La planilla pesa ~2,5 MB, por encima del limite de 2 MB del Data Cache de
// Next, asi que no se puede confiar en el cache de `fetch`. Mantenemos un
// cache propio en el modulo: dentro de una misma instancia (lambda tibia o
// `next start`) se reutiliza durante CACHE_TTL_SEGUNDOS. Ademas las paginas
// usan ISR, que es la capa que realmente evita la mayoria de las descargas.

interface CacheEntrada {
  vehiculos: Map<string, Vehiculo>;
  expiraEn: number;
}

let cache: CacheEntrada | null = null;
let descargaEnCurso: Promise<Map<string, Vehiculo>> | null = null;

function urlDeLaPlanilla(): string {
  const rango = encodeURIComponent(SHEET_RANGE);
  return `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${rango}?key=${apiKey()}`;
}

async function descargar(): Promise<Map<string, Vehiculo>> {
  const respuesta = await fetch(urlDeLaPlanilla(), {
    headers: { Accept: 'application/json' },
    // El cacheo lo maneja este modulo, no el Data Cache de Next.
    cache: 'no-store',
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '');
    throw new Error(
      `Google Sheets respondio ${respuesta.status}. Revisa GOOGLE_SHEETS_API_KEY y que la planilla siga compartida. ${detalle.slice(0, 200)}`,
    );
  }

  const json = (await respuesta.json()) as { values?: string[][] };
  const filas = json.values ?? [];
  // La primera fila son los encabezados del formulario.
  return agruparPorPatente(filas.slice(1));
}

/** Devuelve todos los vehiculos, usando el cache en memoria si sigue vigente. */
export async function obtenerVehiculos(): Promise<Map<string, Vehiculo>> {
  if (cache && cache.expiraEn > Date.now()) return cache.vehiculos;

  // Si ya hay una descarga en vuelo, nos colgamos de esa en lugar de disparar
  // otra: la planilla es grande y no tiene sentido pedirla dos veces.
  descargaEnCurso ??= descargar()
    .then((vehiculos) => {
      cache = { vehiculos, expiraEn: Date.now() + CACHE_TTL_SEGUNDOS * 1000 };
      return vehiculos;
    })
    .finally(() => {
      descargaEnCurso = null;
    });

  return descargaEnCurso;
}

/** Busca un vehiculo por patente (en cualquier formato de escritura). */
export async function obtenerVehiculo(patente: string): Promise<Vehiculo | null> {
  const clave = normalizarPatente(patente);
  if (!clave) return null;
  const vehiculos = await obtenerVehiculos();
  return vehiculos.get(clave) ?? null;
}
