/* eslint-disable @next/next/no-img-element -- El QR es un data URI y el logo un PNG ya dimensionado: next/image no aporta y complica la impresion. */
import { formatearFecha, formatearKilometros } from '@/lib/formato';
import type { ProximoServicio } from '@/lib/mantenimiento';
import { formatearPatente } from '@/lib/patente';
import type { Medidas } from '@/lib/ticket';

interface Props {
  patente: string;
  vehiculo: string;
  proximo: ProximoServicio;
  qrDataUrl: string;
  medidas: Medidas;
  local: { telefono: string };
}

/**
 * Etiqueta autoadhesiva para la libreta de servicio del cliente.
 *
 * A diferencia del ticket, el alto es fijo: la etiqueta ya viene cortada, no
 * se puede estirar. Por eso entra solo lo que el cliente necesita despues:
 * de que auto es, cuando tiene que volver y el QR al historial. El detalle
 * del servicio que se acaba de hacer va en el ticket, no aca.
 *
 * El layout es de dos columnas para aprovechar el ancho: los datos a la
 * izquierda y el QR a la derecha. Apilado no entraria en 60 mm.
 */
export function Sticker({ patente, vehiculo, proximo, qrDataUrl, medidas, local }: Props) {
  const anchoDatos = medidas.utilMm - medidas.qrMm - 3; // 3 mm de separacion

  return (
    <>
      <style>{`
        .sticker {
          box-sizing: border-box;
          width: ${medidas.papelMm}mm;
          height: ${medidas.altoMm}mm;
          padding: 3mm ${(medidas.papelMm - medidas.utilMm) / 2}mm;
          margin: 0 auto;
          background: #fff;
          color: #000;
          font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
          line-height: 1.2;
          /* Alto fijo: si algo se pasa, se recorta en vez de empujar la
             etiqueta siguiente. */
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .sticker-logo {
          width: ${medidas.logoMm}mm;
          height: auto;
          display: block;
          margin: 0 auto 1.5mm;
          image-rendering: pixelated;
        }
        .sticker-cuerpo {
          display: flex;
          gap: 3mm;
          align-items: flex-start;
          flex: 1;
        }
        .sticker-datos {
          width: ${anchoDatos}mm;
          overflow-wrap: anywhere;
        }
        .sticker-patente {
          font-size: 15pt;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .sticker-vehiculo {
          font-size: 6.5pt;
          margin: 0.3mm 0 1.5mm;
          /* Una descripcion larga no puede comerse el bloque de km. */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sticker-rotulo {
          font-size: 6pt;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin: 0;
          border-top: 1px solid #000;
          padding-top: 1mm;
        }
        .sticker-km {
          font-size: 13pt;
          font-weight: 700;
          margin: 0.5mm 0 0;
        }
        .sticker-fecha {
          font-size: 8pt;
          margin: 0.5mm 0 0;
        }
        .sticker-tel {
          font-size: 7pt;
          margin: 1.5mm 0 0;
        }
        .sticker-qr {
          width: ${medidas.qrMm}mm;
          height: ${medidas.qrMm}mm;
          display: block;
          image-rendering: pixelated;
        }
        .sticker-qr-pie {
          font-size: 5.5pt;
          text-align: center;
          margin: 0.5mm 0 0;
          width: ${medidas.qrMm}mm;
        }

        @media screen {
          .sticker {
            border-radius: 3px;
            box-shadow: 0 10px 30px rgb(0 0 0 / 0.5);
            max-width: 100%;
          }
        }

        @media print {
          .sticker {
            margin: 0;
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>

      <article className="sticker">
        <img className="sticker-logo" src={medidas.logo} alt="" />

        <div className="sticker-cuerpo">
          <div className="sticker-datos">
            <p className="sticker-patente">{formatearPatente(patente)}</p>
            {vehiculo && <p className="sticker-vehiculo">{vehiculo}</p>}

            <p className="sticker-rotulo">Proximo cambio</p>
            {proximo.kilometrajeObjetivo != null && (
              <p className="sticker-km">{formatearKilometros(proximo.kilometrajeObjetivo)}</p>
            )}
            {proximo.fechaObjetivo && (
              <p className="sticker-fecha">
                {proximo.kilometrajeObjetivo != null ? 'o el ' : 'antes del '}
                {formatearFecha(proximo.fechaObjetivo)}
              </p>
            )}
            {proximo.kilometrajeObjetivo == null && !proximo.fechaObjetivo && (
              <p className="sticker-fecha">Sin datos del ultimo servicio</p>
            )}

            <p className="sticker-tel">Turnos: {local.telefono}</p>
          </div>

          <div>
            <img
              className="sticker-qr"
              src={qrDataUrl}
              alt={`Codigo QR con el historial de ${patente}`}
            />
            <p className="sticker-qr-pie">Tu historial</p>
          </div>
        </div>
      </article>
    </>
  );
}
