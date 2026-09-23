import { NextResponse } from 'next/server';

import { calcularProximoServicio } from '@/lib/mantenimiento';
import { formatearPatente, normalizarPatente } from '@/lib/patente';
import { urlDelDetalle } from '@/lib/qr';
import { obtenerVehiculo } from '@/lib/sheets';

/**
 * Reemplazo del viejo endpoint `GET /car/detail?id=` del proyecto .NET.
 *
 * Devuelve el vehiculo con su historial y el calculo del proximo cambio.
 * El precio de la columna J nunca se expone: es informacion interna.
 */
export async function GET(_pedido: Request, { params }: { params: Promise<{ patente: string }> }) {
  const { patente: patenteCruda } = await params;
  const patente = normalizarPatente(decodeURIComponent(patenteCruda));

  if (!patente) {
    return NextResponse.json({ error: 'Patente invalida' }, { status: 400 });
  }

  try {
    const vehiculo = await obtenerVehiculo(patente);

    if (!vehiculo) {
      return NextResponse.json(
        { patente, encontrado: false, url: urlDelDetalle(patente) },
        { status: 404 },
      );
    }

    const proximo = calcularProximoServicio(vehiculo.servicios[0]);

    return NextResponse.json(
      {
        patente,
        patenteFormateada: formatearPatente(patente),
        encontrado: true,
        vehiculo: vehiculo.vehiculo,
        url: urlDelDetalle(patente),
        proximoCambio: {
          estado: proximo.estado,
          kilometrajeObjetivo: proximo.kilometrajeObjetivo,
          fechaObjetivo: proximo.fechaObjetivo?.toISOString() ?? null,
          diasTranscurridos: proximo.diasTranscurridos,
          diasRestantes: proximo.diasRestantes,
          vencidoPorTiempo: proximo.vencidoPorTiempo,
        },
        servicios: vehiculo.servicios.map((servicio) => ({
          fecha: servicio.fecha?.toISOString() ?? null,
          fechaTexto: servicio.fechaTexto,
          kilometros: servicio.kilometros,
          aceite: servicio.aceite,
          filtroAceite: servicio.filtroAceite,
          filtroAire: servicio.filtroAire,
          filtroCombustible: servicio.filtroCombustible,
          filtroHabitaculo: servicio.filtroHabitaculo,
        })),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (error) {
    console.error('Error consultando la planilla', error);
    return NextResponse.json({ error: 'No pudimos consultar la planilla' }, { status: 502 });
  }
}
