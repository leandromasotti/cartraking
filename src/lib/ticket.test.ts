import { describe, expect, it } from 'vitest';

import {
  FORMATOS,
  FORMATOS_DISPONIBLES,
  FORMATO_POR_DEFECTO,
  formatoDesdeParametro,
} from './ticket';

describe('formatoDesdeParametro', () => {
  it('reconoce los formatos validos', () => {
    expect(formatoDesdeParametro('58')).toBe(58);
    expect(formatoDesdeParametro('80')).toBe(80);
    expect(formatoDesdeParametro('sticker')).toBe('sticker');
  });

  it('cae en el formato por defecto con cualquier otra cosa', () => {
    expect(formatoDesdeParametro(undefined)).toBe(FORMATO_POR_DEFECTO);
    expect(formatoDesdeParametro('')).toBe(FORMATO_POR_DEFECTO);
    expect(formatoDesdeParametro('a4')).toBe(FORMATO_POR_DEFECTO);
    expect(formatoDesdeParametro('../../etc')).toBe(FORMATO_POR_DEFECTO);
  });

  it('toma el primer valor si el parametro viene repetido', () => {
    expect(formatoDesdeParametro(['58', '80'])).toBe(58);
  });
});

describe('FORMATOS', () => {
  it('el area util nunca supera el ancho del papel', () => {
    for (const medidas of Object.values(FORMATOS)) {
      expect(medidas.utilMm).toBeLessThanOrEqual(medidas.papelMm);
    }
  });

  it('el QR y el logo entran en el area util', () => {
    for (const medidas of Object.values(FORMATOS)) {
      expect(medidas.qrMm).toBeLessThanOrEqual(medidas.utilMm);
      expect(medidas.logoMm).toBeLessThanOrEqual(medidas.utilMm);
    }
  });

  it('el QR no baja del minimo legible por un celular', () => {
    for (const medidas of Object.values(FORMATOS)) {
      expect(medidas.qrMm).toBeGreaterThanOrEqual(30);
    }
  });

  it('en el sticker, los datos y el QR entran lado a lado', () => {
    const s = FORMATOS.sticker;
    // 3 mm de separacion entre las dos columnas
    expect(s.utilMm - s.qrMm - 3).toBeGreaterThan(30);
  });

  it('solo el sticker tiene alto fijo', () => {
    expect(FORMATOS.sticker.altoMm).not.toBeNull();
    expect(FORMATOS[58].altoMm).toBeNull();
    expect(FORMATOS[80].altoMm).toBeNull();
  });

  it('la lista de botones cubre todos los formatos', () => {
    // Object.keys siempre devuelve strings, aunque las claves 58 y 80 sean
    // numericas: se comparan como texto para que el cotejo tenga sentido.
    const enLaLista = FORMATOS_DISPONIBLES.map(String).sort();
    expect(enLaLista).toEqual(Object.keys(FORMATOS).sort());
  });
});
