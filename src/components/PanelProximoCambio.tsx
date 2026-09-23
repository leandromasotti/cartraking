import { CalculadoraDeKilometros } from '@/components/CalculadoraDeKilometros';
import { describirAntiguedad, formatearFechaLarga, formatearKilometros } from '@/lib/formato';
import {
  ETIQUETAS_ESTADO,
  INTERVALO_KM,
  INTERVALO_MESES,
  type EstadoMantenimiento,
  type ProximoServicio,
} from '@/lib/mantenimiento';

const ESTILO_POR_ESTADO: Record<EstadoMantenimiento, { borde: string; punto: string; texto: string }> =
  {
    'al-dia': {
      borde: 'border-estado-ok/50 bg-estado-ok/10',
      punto: 'bg-estado-ok',
      texto: 'text-estado-ok',
    },
    'por-vencer': {
      borde: 'border-estado-aviso/50 bg-estado-aviso/10',
      punto: 'bg-estado-aviso',
      texto: 'text-estado-aviso',
    },
    vencido: {
      borde: 'border-estado-mal/50 bg-estado-mal/10',
      punto: 'bg-estado-mal',
      texto: 'text-estado-mal',
    },
    'sin-datos': {
      borde: 'border-carbon-600 bg-carbon-800/60',
      punto: 'bg-carbon-400',
      texto: 'text-carbon-200',
    },
  };

function mensajePrincipal(proximo: ProximoServicio): string {
  switch (proximo.estado) {
    case 'vencido':
      return `Paso mas de ${INTERVALO_MESES === 12 ? 'un ano' : `${INTERVALO_MESES} meses`} desde el ultimo cambio. Conviene hacerlo cuanto antes.`;
    case 'por-vencer':
      return proximo.diasRestantes === 0
        ? 'El cambio vence hoy.'
        : `Faltan ${proximo.diasRestantes} dias para que venza por tiempo.`;
    case 'al-dia':
      return proximo.fechaObjetivo
        ? 'El vehiculo esta al dia por tiempo. Igual revisa el kilometraje.'
        : 'Tenemos el kilometraje del proximo cambio, pero no la fecha del ultimo servicio.';
    case 'sin-datos':
      return 'No hay servicios registrados para calcular el proximo cambio.';
  }
}

export function PanelProximoCambio({ proximo }: { proximo: ProximoServicio }) {
  const estilo = ESTILO_POR_ESTADO[proximo.estado];

  return (
    <section className={`rounded-2xl border p-5 sm:p-6 ${estilo.borde}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${estilo.punto}`} aria-hidden="true" />
        <h2 className={`text-lg font-bold sm:text-xl ${estilo.texto}`}>
          {ETIQUETAS_ESTADO[proximo.estado]}
        </h2>
      </div>

      <p className="mt-2 text-sm text-carbon-200 sm:text-base">{mensajePrincipal(proximo)}</p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <Dato
          etiqueta="Proximo cambio a los"
          valor={formatearKilometros(proximo.kilometrajeObjetivo, 'sin dato de km')}
          nota={
            proximo.kilometrajeObjetivo != null
              ? `Ultimo servicio + ${INTERVALO_KM.toLocaleString('es-AR')} km`
              : undefined
          }
          destacado
        />
        <Dato
          etiqueta="O antes del"
          valor={formatearFechaLarga(proximo.fechaObjetivo, 'sin dato de fecha')}
          nota={
            proximo.fechaObjetivo
              ? `Ultimo servicio + ${INTERVALO_MESES} meses`
              : undefined
          }
          destacado
        />
        <Dato
          etiqueta="Ultimo cambio"
          valor={describirAntiguedad(proximo.diasTranscurridos)}
          nota={
            proximo.diasRestantes != null && proximo.diasRestantes < 0
              ? `Vencido hace ${Math.abs(proximo.diasRestantes)} dias`
              : undefined
          }
        />
      </dl>

      {proximo.kilometrajeObjetivo != null && (
        <CalculadoraDeKilometros kilometrajeObjetivo={proximo.kilometrajeObjetivo} />
      )}
    </section>
  );
}

function Dato({
  etiqueta,
  valor,
  nota,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  nota?: string;
  destacado?: boolean;
}) {
  return (
    <div className="rounded-xl bg-carbon-950/40 p-4">
      <dt className="text-xs uppercase tracking-wide text-carbon-400">{etiqueta}</dt>
      <dd className={`mt-1 font-bold ${destacado ? 'text-xl sm:text-2xl' : 'text-lg'}`}>{valor}</dd>
      {nota && <p className="mt-1 text-xs text-carbon-400">{nota}</p>}
    </div>
  );
}
