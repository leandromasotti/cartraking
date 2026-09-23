import type { Metadata } from 'next';
import Link from 'next/link';

import { BotonImprimir } from '@/components/BotonImprimir';
import { Ticket } from '@/components/Ticket';
import { LOCAL } from '@/lib/config';
import { calcularProximoServicio } from '@/lib/mantenimiento';
import { formatearPatente, normalizarPatente } from '@/lib/patente';
import { generarQrDeLaPatente, urlDelDetalle } from '@/lib/qr';
import { obtenerVehiculo } from '@/lib/sheets';
import { ANCHOS_DE_PAPEL, anchoDesdeParametro } from '@/lib/ticket';

export const revalidate = 300;

interface Props {
  params: Promise<{ patente: string }>;
  searchParams: Promise<{ ancho?: string; auto?: string }>;
}

export const metadata: Metadata = {
  title: 'Ticket con QR',
  robots: { index: false, follow: false },
};

export default async function PaginaDeImpresion({ params, searchParams }: Props) {
  const [{ patente: patenteCruda }, filtros] = await Promise.all([params, searchParams]);

  const patente = normalizarPatente(decodeURIComponent(patenteCruda));
  const ancho = anchoDesdeParametro(filtros.ancho);
  const medidas = ANCHOS_DE_PAPEL[ancho];

  const vehiculo = await obtenerVehiculo(patente);
  const proximo = calcularProximoServicio(vehiculo?.servicios[0] ?? null);
  const url = urlDelDetalle(patente);
  // El QR se genera a 8 px por mm para que la termica de 203 dpi (8 px/mm)
  // imprima cada modulo entero y no queden bordes borrosos.
  const qr = await generarQrDeLaPatente(patente, medidas.qrMm * 8);

  return (
    <>
      {/*
        El tamano de pagina depende del rollo elegido, asi que la regla @page
        se inyecta desde el servidor. `margin: 0` deja que el ticket use todo
        el ancho util; los margenes reales los pone el propio ticket.
      */}
      <style>{`@page { size: ${medidas.papelMm}mm auto; margin: 0; }`}</style>

      <div className="no-imprimir mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/admin" className="text-carbon-400 hover:text-white">
            &larr; Volver al panel
          </Link>
          <Link
            href={`/patente/${patente}`}
            className="text-carbon-400 hover:text-white"
            target="_blank"
          >
            Ver la pagina publica de {formatearPatente(patente)}
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Ticket para impresora termica</h1>
          <p className="mt-1 text-sm text-carbon-200">
            Elegi el rollo, apreta imprimir y en el dialogo del navegador selecciona la impresora
            termica con margenes en cero.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BotonImprimir auto={filtros.auto === '1'} />

          <div className="flex overflow-hidden rounded-xl border border-carbon-600">
            {(Object.keys(ANCHOS_DE_PAPEL) as unknown as Array<keyof typeof ANCHOS_DE_PAPEL>).map(
              (opcion) => (
                <Link
                  key={opcion}
                  href={`/admin/ticket/${patente}?ancho=${opcion}`}
                  aria-current={Number(opcion) === ancho ? 'page' : undefined}
                  className={`px-4 py-3 text-sm font-semibold transition ${
                    Number(opcion) === ancho
                      ? 'bg-marca-azul text-white'
                      : 'text-carbon-200 hover:bg-carbon-800'
                  }`}
                >
                  {opcion} mm
                </Link>
              ),
            )}
          </div>
        </div>

        <p className="text-xs break-all text-carbon-400">
          El QR abre: <span className="text-carbon-200">{url}</span>
        </p>

        {!vehiculo && (
          <p className="rounded-xl border border-estado-aviso/50 bg-estado-aviso/10 p-4 text-sm text-estado-aviso">
            Ojo: no hay servicios cargados para esta patente. El ticket se imprime igual y el QR
            va a funcionar apenas se cargue el servicio en la planilla.
          </p>
        )}
      </div>

      {/* Vista previa en pantalla: el papel real se ve tal cual va a salir. */}
      <div className="no-imprimir mb-2 text-xs uppercase tracking-wide text-carbon-400">
        Vista previa ({medidas.papelMm} mm)
      </div>

      <Ticket
        patente={patente}
        vehiculo={vehiculo?.vehiculo ?? ''}
        ultimoServicio={vehiculo?.servicios[0] ?? null}
        proximo={proximo}
        qrDataUrl={qr}
        url={url}
        medidas={medidas}
        local={LOCAL}
      />
    </>
  );
}
