import type { Metadata } from 'next';
import Link from 'next/link';

import { BotonImprimir } from '@/components/BotonImprimir';
import { Sticker } from '@/components/Sticker';
import { Ticket } from '@/components/Ticket';
import { LOCAL } from '@/lib/config';
import { calcularProximoServicio } from '@/lib/mantenimiento';
import { formatearPatente, normalizarPatente } from '@/lib/patente';
import { generarQrDeLaPatente, urlDelDetalle } from '@/lib/qr';
import { obtenerVehiculo } from '@/lib/sheets';
import { FORMATOS, FORMATOS_DISPONIBLES, formatoDesdeParametro } from '@/lib/ticket';

export const revalidate = 300;

interface Props {
  params: Promise<{ patente: string }>;
  searchParams: Promise<{ formato?: string; auto?: string }>;
}

export const metadata: Metadata = {
  title: 'Imprimir',
  robots: { index: false, follow: false },
};

export default async function PaginaDeImpresion({ params, searchParams }: Props) {
  const [{ patente: patenteCruda }, filtros] = await Promise.all([params, searchParams]);

  const patente = normalizarPatente(decodeURIComponent(patenteCruda));
  const formato = formatoDesdeParametro(filtros.formato);
  const medidas = FORMATOS[formato];

  const vehiculo = await obtenerVehiculo(patente);
  const proximo = calcularProximoServicio(vehiculo?.servicios[0] ?? null);
  const url = urlDelDetalle(patente);
  // El QR se genera a 8 px por mm para que la termica de 203 dpi (8 px/mm)
  // imprima cada modulo entero y no queden bordes borrosos.
  const qr = await generarQrDeLaPatente(patente, medidas.qrMm * 8);

  return (
    <>
      {/*
        El tamano de pagina depende del formato elegido, asi que la regla @page
        se inyecta desde el servidor. El ticket usa alto automatico (el rollo
        corta donde termina); el sticker, alto fijo, porque la etiqueta ya
        viene cortada.
      */}
      <style>{`@page { size: ${medidas.papelMm}mm ${medidas.altoMm ? `${medidas.altoMm}mm` : 'auto'}; margin: 0; }`}</style>

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
          <h1 className="text-2xl font-bold">Imprimir {formatearPatente(patente)}</h1>
          <p className="mt-1 text-sm text-carbon-200">
            Elegi el formato, apreta imprimir y en el dialogo del navegador selecciona la impresora
            termica con margenes en cero.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BotonImprimir auto={filtros.auto === '1'} />

          <div className="flex flex-wrap overflow-hidden rounded-xl border border-carbon-600">
            {FORMATOS_DISPONIBLES.map((opcion) => (
              <Link
                key={String(opcion)}
                href={`/admin/ticket/${patente}?formato=${opcion}`}
                aria-current={opcion === formato ? 'page' : undefined}
                className={`px-4 py-3 text-sm font-semibold transition ${
                  opcion === formato ? 'bg-marca-azul text-white' : 'text-carbon-200 hover:bg-carbon-800'
                }`}
              >
                {FORMATOS[opcion].etiqueta}
              </Link>
            ))}
          </div>
        </div>

        {medidas.tipo === 'sticker' && (
          <p className="rounded-xl border border-carbon-600 bg-carbon-900/70 p-4 text-sm text-carbon-200">
            El sticker lleva solo lo que el cliente necesita despues: la patente, cuando volver y el
            QR. El detalle del servicio que acabas de hacer va en el ticket.
          </p>
        )}

        <p className="text-xs break-all text-carbon-400">
          El QR abre: <span className="text-carbon-200">{url}</span>
        </p>

        {!vehiculo && (
          <p className="rounded-xl border border-estado-aviso/50 bg-estado-aviso/10 p-4 text-sm text-estado-aviso">
            Ojo: no hay servicios cargados para esta patente. Se imprime igual y el QR va a
            funcionar apenas se cargue el servicio en la planilla.
          </p>
        )}
      </div>

      <div className="no-imprimir mb-2 text-xs uppercase tracking-wide text-carbon-400">
        Vista previa ({medidas.etiqueta})
      </div>

      {medidas.tipo === 'sticker' ? (
        <Sticker
          patente={patente}
          vehiculo={vehiculo?.vehiculo ?? ''}
          proximo={proximo}
          qrDataUrl={qr}
          medidas={medidas}
          local={LOCAL}
        />
      ) : (
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
      )}
    </>
  );
}
