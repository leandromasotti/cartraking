'use client';

import { useState } from 'react';

import { formatearNumero } from '@/lib/formato';
import { kilometrosRestantes } from '@/lib/mantenimiento';

/**
 * El sistema no sabe cuanto marca el odometro hoy (solo el del ultimo
 * servicio), asi que se lo preguntamos al dueno del auto para decirle cuanto
 * le falta de verdad.
 */
export function CalculadoraDeKilometros({ kilometrajeObjetivo }: { kilometrajeObjetivo: number }) {
  const [texto, setTexto] = useState('');

  const kmActual = texto.replace(/[^\d]/g, '') === '' ? null : Number(texto.replace(/[^\d]/g, ''));
  const faltan = kilometrosRestantes(kilometrajeObjetivo, kmActual);

  return (
    <div className="no-imprimir mt-5 rounded-xl border border-carbon-600 bg-carbon-950/40 p-4">
      <label htmlFor="km-actual" className="block text-sm font-medium text-carbon-200">
        Cuantos kilometros marca hoy tu vehiculo?
      </label>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          id="km-actual"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ej: 95000"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-base focus:border-marca-azul focus:outline-none sm:max-w-48"
        />

        <p aria-live="polite" className="text-sm sm:flex-1">
          {faltan == null ? (
            <span className="text-carbon-400">
              Te decimos cuanto te falta para los {formatearNumero(kilometrajeObjetivo)} km.
            </span>
          ) : faltan > 0 ? (
            <span className="text-estado-ok">
              Te faltan <strong>{formatearNumero(faltan)} km</strong> para el proximo cambio.
            </span>
          ) : faltan === 0 ? (
            <span className="text-estado-aviso">
              Llegaste justo al kilometraje del proximo cambio.
            </span>
          ) : (
            <span className="text-estado-mal">
              Te pasaste por <strong>{formatearNumero(Math.abs(faltan))} km</strong>. Conviene hacer
              el cambio ya.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
