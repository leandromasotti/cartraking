import 'server-only';

import QRCode from 'qrcode';

import { urlDelSitio } from './config';
import { normalizarPatente } from './patente';

/** URL publica del detalle de una patente: es lo que abre el QR al escanearlo. */
export function urlDelDetalle(patente: string): string {
  return `${urlDelSitio()}/patente/${encodeURIComponent(normalizarPatente(patente))}`;
}

/**
 * QR como data URI PNG, listo para meter en un <img>.
 *
 * Va embebido en el HTML a proposito: el ticket tiene que poder imprimirse
 * aunque la PC del local pierda internet justo en ese momento.
 *
 * - Correccion de errores 'M': tolera que el papel termico se manche o se
 *   borronee sin volverse ilegible.
 * - `margin: 2` es el "quiet zone" minimo que piden los lectores; sin el,
 *   muchos celulares no enganchan el codigo.
 * - Escala alta porque la termica imprime a 203 dpi y un QR chico sale con
 *   los modulos pisados.
 */
export async function generarQrDataUrl(texto: string, anchoPx = 320): Promise<string> {
  return QRCode.toDataURL(texto, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: anchoPx,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

export async function generarQrDeLaPatente(patente: string, anchoPx = 320): Promise<string> {
  return generarQrDataUrl(urlDelDetalle(patente), anchoPx);
}
