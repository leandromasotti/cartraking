import type { Metadata } from 'next';

import { BuscadorDePatente } from '@/components/BuscadorDePatente';
import { ANCHO_POR_DEFECTO } from '@/lib/ticket';

export const metadata: Metadata = {
  title: 'Imprimir ticket con QR',
  robots: { index: false, follow: false },
};

/** Pantalla de mostrador: se carga la patente y sale el ticket para imprimir. */
export default function PanelDeImpresion() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">Imprimir ticket con QR</h1>
        <p className="mt-2 max-w-prose text-sm text-carbon-200">
          Para uso del local. Ingresa la patente del vehiculo al que le acabas de hacer el servicio
          y se genera el ticket con el QR que lleva a su historial.
        </p>
      </header>

      <section className="rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 sm:p-8">
        <BuscadorDePatente
          autoFocus
          textoBoton="Generar ticket"
          rutaBase="/imprimir"
          parametros={`ancho=${ANCHO_POR_DEFECTO}`}
        />
      </section>

      <section className="rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 text-sm text-carbon-200 sm:p-6">
        <h2 className="text-base font-bold text-white">Antes de imprimir por primera vez</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Instala la impresora termica en Windows con su driver y dejala como predeterminada.</li>
          <li>
            En el dialogo de impresion del navegador, poni <strong>Margenes: Ninguno</strong> y
            desactiva <strong>Encabezados y pies de pagina</strong>.
          </li>
          <li>
            Tilda <strong>Graficos de fondo</strong> solo si el QR sale en blanco; normalmente no
            hace falta.
          </li>
          <li>Verifica que la escala este en 100%, no en &quot;Ajustar al area de impresion&quot;.</li>
        </ol>
        <p className="mt-4">
          El detalle completo esta en <code className="text-marca-azul-claro">docs/IMPRESION-TERMICA.md</code>.
        </p>
      </section>
    </div>
  );
}
