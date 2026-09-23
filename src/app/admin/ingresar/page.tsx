import type { Metadata } from 'next';
import Link from 'next/link';

import { claveAdmin, destinoSeguro } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Ingreso del personal',
  robots: { index: false, follow: false },
};

const MENSAJES: Record<string, string> = {
  incorrecta: 'La clave no es correcta.',
  'sin-configurar':
    'Todavia no se configuro la clave del local. Hay que cargar la variable de entorno CLAVE_ADMIN y volver a desplegar.',
};

export default async function Ingresar({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; destino?: string }>;
}) {
  const { error, destino } = await searchParams;
  const sinConfigurar = claveAdmin() === null;

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-2xl font-bold">Ingreso del personal</h1>
      <p className="mt-2 text-sm text-carbon-200">
        Esta seccion es para el lubricentro. Si sos cliente y queres ver los servicios de tu
        vehiculo,{' '}
        <Link href="/" className="text-marca-azul-claro underline">
          consulta tu patente en el inicio
        </Link>
        .
      </p>

      {sinConfigurar && (
        <p className="mt-6 rounded-xl border border-estado-aviso/50 bg-estado-aviso/10 p-4 text-sm text-estado-aviso">
          {MENSAJES['sin-configurar']}
        </p>
      )}

      <form
        method="POST"
        action="/api/admin/ingresar"
        className="mt-6 rounded-2xl border border-carbon-700 bg-carbon-900/70 p-5 sm:p-6"
      >
        <input type="hidden" name="destino" value={destinoSeguro(destino)} />

        <label htmlFor="clave" className="block text-sm font-medium text-carbon-200">
          Clave del local
        </label>
        <input
          id="clave"
          name="clave"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'clave-error' : undefined}
          className="mt-2 w-full rounded-xl border border-carbon-600 bg-carbon-900 px-4 py-3 text-base focus:border-marca-azul focus:outline-none"
        />

        {error && MENSAJES[error] && (
          <p id="clave-error" role="alert" className="mt-2 text-sm text-estado-mal">
            {MENSAJES[error]}
          </p>
        )}

        <button
          type="submit"
          className="mt-5 w-full rounded-xl bg-marca-rojo px-5 py-3 text-base font-bold transition hover:bg-marca-rojo-claro"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
