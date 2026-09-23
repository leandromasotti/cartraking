import type { Metadata } from 'next';
import Link from 'next/link';

import { BuscadorDePatente } from '@/components/BuscadorDePatente';
import { HistorialDeServicios } from '@/components/HistorialDeServicios';
import { PanelProximoCambio } from '@/components/PanelProximoCambio';
import { LOCAL, linkWhatsApp } from '@/lib/config';
import { calcularProximoServicio } from '@/lib/mantenimiento';
import { formatearPatente, normalizarPatente } from '@/lib/patente';
import { obtenerVehiculo } from '@/lib/sheets';

// La planilla se actualiza a mano varias veces por dia: revalidar cada 5
// minutos alcanza y evita pegarle a Google en cada visita.
export const revalidate = 300;

interface Props {
  params: Promise<{ patente: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { patente } = await params;
  const linda = formatearPatente(decodeURIComponent(patente));
  return {
    title: `Servicios de ${linda}`,
    description: `Historial de cambios de aceite y filtros del vehiculo ${linda} en ${LOCAL.nombre}.`,
    // El detalle es informacion del cliente, no contenido para buscadores.
    robots: { index: false, follow: false },
  };
}

export default async function DetalleDePatente({ params }: Props) {
  const { patente: patenteCruda } = await params;
  const patente = normalizarPatente(decodeURIComponent(patenteCruda));
  const vehiculo = await obtenerVehiculo(patente);
  const proximo = calcularProximoServicio(vehiculo?.servicios[0] ?? null);

  return (
    <div className="space-y-8">
      <header>
        <Link href="/" className="no-imprimir text-sm text-carbon-400 hover:text-white">
          &larr; Volver al inicio
        </Link>

        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          {formatearPatente(patente)}
        </h1>

        {vehiculo?.vehiculo && (
          <p className="mt-1 text-lg text-carbon-200">{vehiculo.vehiculo}</p>
        )}
      </header>

      {!vehiculo ? (
        <SinResultados patente={patente} />
      ) : (
        <>
          <PanelProximoCambio proximo={proximo} />

          <section>
            <h2 className="text-xl font-bold">
              Historial de servicios
              <span className="ml-2 text-sm font-normal text-carbon-400">
                ({vehiculo.servicios.length}{' '}
                {vehiculo.servicios.length === 1 ? 'servicio' : 'servicios'})
              </span>
            </h2>

            <div className="mt-4">
              <HistorialDeServicios servicios={vehiculo.servicios} />
            </div>
          </section>

          <section className="no-imprimir rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 sm:p-6">
            <h2 className="text-lg font-bold">Sacar turno</h2>
            <p className="mt-1 text-sm text-carbon-200">
              Escribinos y coordinamos el proximo cambio.
            </p>
            <a
              href={linkWhatsApp(
                `Hola! Quiero sacar turno para el cambio de aceite de la patente ${formatearPatente(patente)}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-xl bg-marca-azul px-5 py-3 text-sm font-bold transition hover:bg-marca-azul-claro"
            >
              Escribir por WhatsApp
            </a>
          </section>
        </>
      )}

      <section className="no-imprimir rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 sm:p-6">
        <h2 className="text-lg font-bold">Consultar otra patente</h2>
        <div className="mt-4">
          <BuscadorDePatente textoBoton="Buscar" />
        </div>
      </section>
    </div>
  );
}

function SinResultados({ patente }: { patente: string }) {
  return (
    <section className="rounded-2xl border border-carbon-600 bg-carbon-900/70 p-5 sm:p-6">
      <h2 className="text-xl font-bold">No encontramos servicios para {formatearPatente(patente)}</h2>
      <p className="mt-2 max-w-prose text-sm text-carbon-200">
        Puede ser que la patente este escrita distinto en nuestro registro, o que el vehiculo
        todavia no haya pasado por el taller. Revisa que este bien escrita o consultanos.
      </p>
      <a
        href={linkWhatsApp(
          `Hola! Consulte la patente ${formatearPatente(patente)} en la web y no aparecen servicios.`,
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-xl bg-marca-azul px-5 py-3 text-sm font-bold transition hover:bg-marca-azul-claro"
      >
        Consultar por WhatsApp
      </a>
    </section>
  );
}
