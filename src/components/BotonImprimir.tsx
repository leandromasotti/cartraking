'use client';

import { useEffect } from 'react';

/**
 * Dispara el dialogo de impresion del navegador.
 *
 * Con `auto` se llama solo al terminar de cargar: sirve para el flujo del
 * mostrador, donde se abre el ticket en una pestana nueva y se quiere el
 * dialogo listo sin un click extra.
 */
export function BotonImprimir({ auto = false }: { auto?: boolean }) {
  useEffect(() => {
    if (!auto) return;
    // Un frame de margen para que las imagenes (el QR) ya esten pintadas.
    const id = window.setTimeout(() => window.print(), 300);
    return () => window.clearTimeout(id);
  }, [auto]);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-marca-rojo px-5 py-3 text-sm font-bold text-white transition hover:bg-marca-rojo-claro"
    >
      Imprimir ticket
    </button>
  );
}
