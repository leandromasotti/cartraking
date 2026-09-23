import Image from 'next/image';

import { BuscadorDePatente } from '@/components/BuscadorDePatente';
import { INTERVALO_KM, INTERVALO_MESES } from '@/lib/mantenimiento';
import { LOCAL, linkWhatsApp } from '@/lib/config';

export default function Inicio() {
  return (
    <div className="space-y-10 sm:space-y-14">
      <section>
        <div className="overflow-hidden rounded-2xl border border-carbon-700">
          <Image
            src="/logo-banner.jpg"
            alt={`${LOCAL.nombre} - ${LOCAL.descripcion}`}
            width={1280}
            height={462}
            priority
            className="h-auto w-full"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Consulta tus cambios de aceite
        </h1>
        <p className="mt-2 max-w-prose text-sm text-carbon-200 sm:text-base">
          Ingresa la patente y vas a ver todo el historial de servicios de tu vehiculo, mas la
          fecha y el kilometraje en los que corresponde el proximo cambio.
        </p>

        <div className="mt-6">
          <BuscadorDePatente autoFocus />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Tarjeta titulo="Historial completo">
          Cada servicio con su fecha, el kilometraje y los filtros que se cambiaron.
        </Tarjeta>
        <Tarjeta titulo="Proximo cambio">
          Calculamos el vencimiento a los {INTERVALO_KM.toLocaleString('es-AR')} km o a los{' '}
          {INTERVALO_MESES} meses, lo que pase primero.
        </Tarjeta>
        <Tarjeta titulo="QR en tu ticket">
          Escanea el codigo del comprobante y entras directo al detalle de tu patente.
        </Tarjeta>
      </section>

      <section className="rounded-2xl border border-marca-azul/40 bg-marca-azul/10 p-5 sm:p-8">
        <h2 className="text-xl font-bold sm:text-2xl">Pedir un turno</h2>
        <p className="mt-2 max-w-prose text-sm text-carbon-200 sm:text-base">
          Escribinos por WhatsApp y coordinamos el dia y el horario para tu cambio de aceite.
        </p>
        <a
          href={linkWhatsApp('Hola! Quiero sacar un turno para un cambio de aceite.')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-xl bg-marca-azul px-6 py-3 text-base font-bold transition hover:bg-marca-azul-claro"
        >
          Pedir turno por WhatsApp
        </a>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 sm:p-6">
          <h2 className="text-xl font-bold">Contacto</h2>
          <ul className="mt-4 space-y-3 text-sm text-carbon-200">
            <li>
              <span className="block text-xs uppercase tracking-wide text-carbon-400">
                Telefono
              </span>
              <a className="hover:text-white" href={`tel:${LOCAL.telefono.replace(/\s/g, '')}`}>
                {LOCAL.telefono}
              </a>
            </li>
            <li>
              <span className="block text-xs uppercase tracking-wide text-carbon-400">
                WhatsApp
              </span>
              <a
                className="hover:text-white"
                href={linkWhatsApp('Hola! Quiero consultar por un cambio de aceite.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {LOCAL.telefonoWhatsApp}
              </a>
            </li>
            <li>
              <span className="block text-xs uppercase tracking-wide text-carbon-400">Mail</span>
              <a className="break-all hover:text-white" href={`mailto:${LOCAL.email}`}>
                {LOCAL.email}
              </a>
            </li>
            <li>
              <span className="block text-xs uppercase tracking-wide text-carbon-400">
                Direccion
              </span>
              {LOCAL.direccion}
            </li>
          </ul>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-carbon-700">
          <h2 className="sr-only">Nuestra ubicacion</h2>
          <iframe
            src={LOCAL.mapa}
            title={`Ubicacion de ${LOCAL.nombre}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full flex-1 border-0 sm:min-h-[18rem]"
          />
          <a
            href={LOCAL.comoLlegar}
            target="_blank"
            rel="noopener noreferrer"
            className="border-t border-carbon-700 bg-carbon-900/70 px-4 py-3 text-center text-sm font-semibold text-carbon-200 transition hover:text-white"
          >
            Como llegar
          </a>
        </div>
      </section>
    </div>
  );
}

function Tarjeta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5">
      <h2 className="text-base font-bold">{titulo}</h2>
      <p className="mt-2 text-sm text-carbon-200">{children}</p>
    </div>
  );
}
