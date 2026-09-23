import { formatearFecha, formatearKilometros } from '@/lib/formato';
import type { Servicio } from '@/lib/sheets';

const FILTROS = [
  { clave: 'filtroAceite', etiqueta: 'Aceite', corto: 'Ac' },
  { clave: 'filtroAire', etiqueta: 'Aire', corto: 'Ai' },
  { clave: 'filtroCombustible', etiqueta: 'Combustible', corto: 'Co' },
  { clave: 'filtroHabitaculo', etiqueta: 'Habitaculo', corto: 'Ha' },
] as const;

/**
 * El historial se muestra de dos formas distintas segun el ancho:
 * tarjetas apiladas en celular (que es de donde llega casi todo el trafico,
 * escaneando el QR del ticket) y tabla en pantallas grandes.
 */
export function HistorialDeServicios({ servicios }: { servicios: Servicio[] }) {
  if (servicios.length === 0) {
    return <p className="text-carbon-200">No hay servicios registrados.</p>;
  }

  return (
    <>
      <ul className="space-y-3 sm:hidden">
        {servicios.map((servicio, indice) => (
          <li
            key={`${servicio.fechaTexto}-${indice}`}
            className="rounded-xl border border-carbon-700 bg-carbon-900/70 p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-bold">{formatearFecha(servicio.fecha, servicio.fechaTexto)}</span>
              <span className="text-sm text-carbon-200">
                {formatearKilometros(servicio.kilometros)}
              </span>
            </div>

            {servicio.aceite && (
              <p className="mt-2 text-sm">
                <span className="text-carbon-400">Aceite: </span>
                {servicio.aceite}
              </p>
            )}

            <ul className="mt-3 flex flex-wrap gap-1.5">
              {FILTROS.map((filtro) => (
                <li
                  key={filtro.clave}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    servicio[filtro.clave]
                      ? 'bg-estado-ok/15 text-estado-ok'
                      : 'bg-carbon-800 text-carbon-400 line-through'
                  }`}
                >
                  {filtro.etiqueta}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-carbon-700 sm:block">
        <table className="w-full min-w-[42rem] border-collapse text-sm">
          <caption className="sr-only">Historial de servicios del vehiculo</caption>
          <thead>
            <tr className="bg-carbon-800 text-left">
              <th scope="col" className="px-4 py-3 font-semibold">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Kilometros
              </th>
              {FILTROS.map((filtro) => (
                <th key={filtro.clave} scope="col" className="px-3 py-3 text-center font-semibold">
                  Filtro {filtro.etiqueta}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 font-semibold">
                Aceite
              </th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio, indice) => (
              <tr
                key={`${servicio.fechaTexto}-${indice}`}
                className="border-t border-carbon-700 odd:bg-carbon-900/40"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium">
                  {formatearFecha(servicio.fecha, servicio.fechaTexto)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {formatearKilometros(servicio.kilometros)}
                </td>
                {FILTROS.map((filtro) => (
                  <td key={filtro.clave} className="px-3 py-3 text-center">
                    {servicio[filtro.clave] ? (
                      <span className="text-estado-ok" title={`Se cambio el filtro de ${filtro.etiqueta.toLowerCase()}`}>
                        Si
                      </span>
                    ) : (
                      <span className="text-carbon-400" title="No se cambio">
                        -
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-carbon-200">{servicio.aceite || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
