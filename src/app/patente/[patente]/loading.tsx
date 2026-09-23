import { Bloque, EncabezadoDeCarga, Linea } from '@/components/Esqueleto';

/**
 * Pantalla de carga del detalle de una patente.
 *
 * Next la muestra apenas el usuario navega, mientras el Server Component
 * consulta la planilla. La forma imita la de la pagina real: titulo, panel
 * del proximo cambio y lista de servicios.
 */
export default function Cargando() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Linea className="w-28" />
        <Bloque className="h-10 w-56 sm:h-12 sm:w-72" />
        <Linea className="w-40" />
      </header>

      <section className="rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 sm:p-6">
        <EncabezadoDeCarga
          titulo="Buscando los servicios de tu vehiculo"
          detalle="Estamos consultando el registro del taller. Puede demorar unos segundos."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-carbon-950/40 p-4">
              <Linea className="h-3 w-24" />
              <Bloque className="mt-2 h-7 w-32" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <Bloque className="h-6 w-56" />
        <ul className="mt-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="rounded-xl border border-carbon-700 bg-carbon-900/70 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <Linea className="w-24" />
                <Linea className="w-20" />
              </div>
              <Linea className="mt-3 w-40" />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[0, 1, 2, 3].map((j) => (
                  <Bloque key={j} className="h-6 w-20 rounded-md" />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
