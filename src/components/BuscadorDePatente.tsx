'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { esPatenteBuscable, normalizarPatente } from '@/lib/patente';

interface Props {
  patenteInicial?: string;
  /** Texto del boton. En el detalle conviene "Buscar otra". */
  textoBoton?: string;
  autoFocus?: boolean;
  /** Seccion a la que se navega. El panel del local apunta a /imprimir. */
  rutaBase?: '/patente' | '/imprimir';
  /** Query string a agregar al destino, sin el "?". */
  parametros?: string;
}

export function BuscadorDePatente({
  patenteInicial = '',
  textoBoton = 'Consultar',
  autoFocus = false,
  rutaBase = '/patente',
  parametros = '',
}: Props) {
  const router = useRouter();
  const [valor, setValor] = useState(patenteInicial);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const patente = normalizarPatente(valor);

    if (!esPatenteBuscable(patente)) {
      setError('Ingresa una patente valida, por ejemplo AB123CD o ABC123.');
      return;
    }

    setError(null);
    setEnviando(true);
    router.push(`${rutaBase}/${patente}${parametros ? `?${parametros}` : ''}`);
  }

  return (
    <form onSubmit={enviar} noValidate className="w-full">
      <label htmlFor="patente" className="block text-sm font-medium text-carbon-200">
        Patente del vehiculo
      </label>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="patente"
          name="patente"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          maxLength={12}
          placeholder="AB123CD"
          value={valor}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'patente-error' : undefined}
          onChange={(e) => {
            setValor(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          className="w-full rounded-xl border border-carbon-600 bg-carbon-900 px-4 py-3 text-lg font-semibold tracking-[0.2em] uppercase placeholder:tracking-normal placeholder:text-carbon-400 focus:border-marca-azul focus:outline-none sm:flex-1"
        />

        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-marca-rojo px-6 py-3 text-base font-bold transition hover:bg-marca-rojo-claro disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {enviando ? 'Buscando...' : textoBoton}
        </button>
      </div>

      {error && (
        <p id="patente-error" role="alert" className="mt-2 text-sm text-estado-mal">
          {error}
        </p>
      )}
    </form>
  );
}
