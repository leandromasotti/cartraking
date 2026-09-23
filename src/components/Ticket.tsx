/* eslint-disable @next/next/no-img-element -- El QR es un data URI: next/image no aporta nada y romperia la impresion offline. */
import { formatearFecha, formatearKilometros } from '@/lib/formato';
import type { ProximoServicio } from '@/lib/mantenimiento';
import { INTERVALO_KM, INTERVALO_MESES } from '@/lib/mantenimiento';
import { formatearPatente } from '@/lib/patente';
import type { Servicio } from '@/lib/sheets';
import type { Medidas } from '@/lib/ticket';

interface Props {
  patente: string;
  vehiculo: string;
  ultimoServicio: Servicio | null;
  proximo: ProximoServicio;
  /** QR ya renderizado como data URI PNG. */
  qrDataUrl: string;
  /** La URL que codifica el QR, impresa tambien en texto como respaldo. */
  url: string;
  medidas: Medidas;
  local: { nombre: string; telefono: string; direccion: string };
}

/**
 * Ticket para impresora termica.
 *
 * Todo el layout va en milimetros y en escala de grises puro: la termica no
 * imprime color ni medios tonos, cualquier fondo gris sale como una mancha.
 * Las medidas se calculan sobre el ancho util del rollo, no sobre el ancho
 * del papel, porque el cabezal no llega a los bordes.
 */
export function Ticket({
  patente,
  vehiculo,
  ultimoServicio,
  proximo,
  qrDataUrl,
  url,
  medidas,
  local,
}: Props) {
  const filtrosCambiados = ultimoServicio
    ? [
        ultimoServicio.filtroAceite && 'Aceite',
        ultimoServicio.filtroAire && 'Aire',
        ultimoServicio.filtroCombustible && 'Combustible',
        ultimoServicio.filtroHabitaculo && 'Habitaculo',
      ].filter(Boolean as unknown as (v: unknown) => v is string)
    : [];

  return (
    <>
      <style>{`
        .ticket {
          width: ${medidas.papelMm}mm;
          padding: 4mm ${(medidas.papelMm - medidas.utilMm) / 2}mm 6mm;
          margin: 0 auto;
          background: #fff;
          color: #000;
          font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
          font-size: 9pt;
          line-height: 1.35;
          text-align: center;
          /* Sin esto, una descripcion larga de vehiculo desborda el rollo. */
          overflow-wrap: anywhere;
        }
        .ticket-linea {
          border: 0;
          border-top: 1px dashed #000;
          margin: 2.5mm 0;
        }
        /* El nombre ya esta dentro del logo; el h1 queda solo para lectores
           de pantalla y para cuando la imagen no carga. */
        .ticket-titulo-oculto {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip-path: inset(50%);
          margin: 0;
        }
        .ticket-logo {
          width: ${medidas.logoMm}mm;
          height: auto;
          display: block;
          margin: 0 auto;
          /* Ya viene en blanco y negro puro al tamano exacto: sin suavizado. */
          image-rendering: pixelated;
        }
        .ticket-subtitulo { font-size: 7.5pt; margin: 0.5mm 0 0; }
        .ticket-rotulo {
          font-size: 7pt;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin: 0 0 0.5mm;
        }
        .ticket-patente {
          font-size: 20pt;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin: 0;
        }
        .ticket-vehiculo { font-size: 8.5pt; margin: 0.8mm 0 0; }
        .ticket-dato {
          display: flex;
          justify-content: space-between;
          gap: 2mm;
          text-align: left;
          font-size: 8.5pt;
        }
        .ticket-dato + .ticket-dato { margin-top: 0.8mm; }
        .ticket-dato dt { margin: 0; }
        .ticket-dato dd { margin: 0; font-weight: 700; text-align: right; }
        .ticket-recuadro {
          border: 1.5px solid #000;
          border-radius: 1.5mm;
          padding: 2mm 1.5mm;
          margin: 1mm 0;
        }
        .ticket-vuelta {
          font-size: 7pt;
          font-weight: 700;
          letter-spacing: 1px;
          margin: 1mm 0 0;
        }
        .ticket-destacado {
          font-size: 15pt;
          font-weight: 700;
          margin: 0;
        }
        .ticket-secundario { font-size: 9pt; margin: 0.8mm 0 0; }
        .ticket-nota { font-size: 7pt; margin: 1mm 0 0; }
        .ticket-qr {
          width: ${medidas.qrMm}mm;
          height: ${medidas.qrMm}mm;
          display: block;
          margin: 1.5mm auto 0;
          /* El QR tiene que salir nitido, sin interpolacion del navegador. */
          image-rendering: pixelated;
        }
        .ticket-url {
          font-size: 6.5pt;
          margin: 1mm 0 0;
          word-break: break-all;
        }
        .ticket-pie { font-size: 7.5pt; margin: 0; }

        /* Vista previa en pantalla: hoja de papel sobre el fondo oscuro. */
        @media screen {
          .ticket {
            border-radius: 4px;
            box-shadow: 0 10px 30px rgb(0 0 0 / 0.5);
            max-width: 100%;
          }
        }

        @media print {
          .ticket {
            width: auto;
            margin: 0;
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>

      <article className="ticket">
        <h1 className="ticket-titulo-oculto">{local.nombre}</h1>
        <img className="ticket-logo" src={medidas.logo} alt="" />
        <p className="ticket-subtitulo">Cambio de aceite y filtros</p>

        <hr className="ticket-linea" />

        <p className="ticket-rotulo">Patente</p>
        <p className="ticket-patente">{formatearPatente(patente)}</p>
        {vehiculo && <p className="ticket-vehiculo">{vehiculo}</p>}

        {ultimoServicio && (
          <>
            <hr className="ticket-linea" />
            <p className="ticket-rotulo">Ultimo servicio</p>
            <dl>
              <div className="ticket-dato">
                <dt>Fecha</dt>
                <dd>{formatearFecha(ultimoServicio.fecha, ultimoServicio.fechaTexto)}</dd>
              </div>
              <div className="ticket-dato">
                <dt>Kilometros</dt>
                <dd>{formatearKilometros(ultimoServicio.kilometros)}</dd>
              </div>
              {ultimoServicio.aceite && (
                <div className="ticket-dato">
                  <dt>Aceite</dt>
                  <dd>{ultimoServicio.aceite}</dd>
                </div>
              )}
              {filtrosCambiados.length > 0 && (
                <div className="ticket-dato">
                  <dt>Filtros</dt>
                  <dd>{filtrosCambiados.join(', ')}</dd>
                </div>
              )}
            </dl>
          </>
        )}

        <hr className="ticket-linea" />

        <div className="ticket-recuadro">
          <p className="ticket-rotulo">Tu proximo cambio</p>

          {proximo.kilometrajeObjetivo != null ? (
            <>
              <p className="ticket-vuelta">A LOS</p>
              <p className="ticket-destacado">{formatearKilometros(proximo.kilometrajeObjetivo)}</p>
            </>
          ) : (
            <p className="ticket-secundario">Sin kilometraje de referencia</p>
          )}

          {proximo.fechaObjetivo && (
            <>
              <p className="ticket-vuelta">{proximo.kilometrajeObjetivo != null ? 'O EL' : 'ANTES DEL'}</p>
              <p className="ticket-destacado">{formatearFecha(proximo.fechaObjetivo)}</p>
            </>
          )}

          <p className="ticket-nota">
            Lo que ocurra primero ({INTERVALO_KM.toLocaleString('es-AR')} km o {INTERVALO_MESES}{' '}
            meses)
          </p>
        </div>

        <hr className="ticket-linea" />

        <p className="ticket-rotulo">Escanea y mira tu historial</p>
        <img className="ticket-qr" src={qrDataUrl} alt={`Codigo QR con el historial de ${patente}`} />
        <p className="ticket-url">{url.replace(/^https?:\/\//, '')}</p>

        <hr className="ticket-linea" />

        <p className="ticket-pie">{local.direccion}</p>
        <p className="ticket-pie">Tel {local.telefono}</p>
        <p className="ticket-pie">Gracias por su visita!</p>
      </article>
    </>
  );
}
