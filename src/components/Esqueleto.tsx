/**
 * Piezas para armar pantallas de carga con la forma del contenido real.
 *
 * Se usa un esqueleto y no un spinner a proposito: reserva el espacio que va
 * a ocupar el contenido, asi la pagina no salta cuando llegan los datos, y
 * comunica que es lo que se esta cargando.
 */

export function Linea({ className = '' }: { className?: string }) {
  return <div className={`esqueleto h-4 ${className}`} />;
}

export function Bloque({ className = '' }: { className?: string }) {
  return <div className={`esqueleto ${className}`} />;
}

/** Barra indeterminada: no sabemos cuanto falta, solo que esta trabajando. */
export function BarraDeProgreso() {
  return <div className="barra-progreso h-1 w-full overflow-hidden rounded-full" />;
}

export function EncabezadoDeCarga({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div role="status" aria-live="polite">
      <p className="text-sm font-semibold text-carbon-200">{titulo}</p>
      <p className="mt-1 text-xs text-carbon-400">{detalle}</p>
      <div className="mt-3">
        <BarraDeProgreso />
      </div>
    </div>
  );
}
