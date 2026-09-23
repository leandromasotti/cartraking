import type { Metadata } from 'next';

import { BuscadorDePatente } from '@/components/BuscadorDePatente';
import { exigirSesionAdmin } from '@/lib/sesion-admin';
import { FORMATO_POR_DEFECTO } from '@/lib/ticket';

export const metadata: Metadata = {
  title: 'Panel del local',
  robots: { index: false, follow: false },
};

/**
 * Pantalla de mostrador. Vive detras de la clave del local: es la unica
 * parte del sistema que no es publica.
 */
export default async function PanelDelLocal() {
  // No alcanza con el middleware: ver src/lib/sesion-admin.ts
  await exigirSesionAdmin('/admin');

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Panel del local</h1>
          <p className="mt-2 max-w-prose text-sm text-carbon-200">
            Ingresa la patente del vehiculo al que le acabas de hacer el servicio y se genera el
            ticket con el QR que lleva a su historial.
          </p>
        </div>

        <form method="POST" action="/api/admin/salir">
          <button
            type="submit"
            className="rounded-lg border border-carbon-600 px-3 py-2 text-xs font-semibold text-carbon-200 transition hover:border-marca-rojo hover:text-white"
          >
            Cerrar sesion
          </button>
        </form>
      </header>

      <section className="rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 sm:p-8">
        <BuscadorDePatente
          autoFocus
          textoBoton="Generar ticket"
          rutaBase="/admin/ticket"
          parametros={`formato=${FORMATO_POR_DEFECTO}`}
        />
      </section>

      <section className="rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 text-sm text-carbon-200 sm:p-6">
        <h2 className="text-base font-bold text-white">Antes de imprimir por primera vez</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            Instala la impresora termica con el driver del fabricante. El driver
            &quot;Generic / Text Only&quot; de Windows no imprime imagenes: el QR y el logo
            saldrian en blanco.
          </li>
          <li>
            En el dialogo de impresion del navegador, poni <strong>Margenes: Ninguno</strong> y
            desactiva <strong>Encabezados y pies de pagina</strong>.
          </li>
          <li>Verifica que la escala este en 100%, no en &quot;Ajustar al area de impresion&quot;.</li>
        </ol>
        <p className="mt-4">
          El detalle completo esta en{' '}
          <code className="text-marca-azul-claro">docs/IMPRESION-TERMICA.md</code>.
        </p>
      </section>
    </div>
  );
}
