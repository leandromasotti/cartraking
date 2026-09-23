'use client';

import { useEffect } from 'react';

/**
 * Pantalla de error del lado del cliente. El caso tipico es que Google Sheets
 * no responda o que falte la API key en el entorno.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <h1 className="text-2xl font-bold">No pudimos traer los datos</h1>
      <p className="mt-2 text-sm text-carbon-200">
        Hubo un problema al consultar la planilla de servicios. Proba de nuevo en unos segundos.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-marca-rojo px-5 py-3 text-sm font-bold transition hover:bg-marca-rojo-claro"
      >
        Reintentar
      </button>
    </div>
  );
}
