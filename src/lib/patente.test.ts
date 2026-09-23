import { describe, expect, it } from 'vitest';

import { esPatenteBuscable, formatearPatente, normalizarPatente } from './patente';

describe('normalizarPatente', () => {
  it('pasa a mayusculas y saca separadores', () => {
    expect(normalizarPatente('foy 496')).toBe('FOY496');
    expect(normalizarPatente('ab-123-cd')).toBe('AB123CD');
  });

  it('limpia la basura real que hay cargada en la planilla', () => {
    // Casos tomados tal cual de la hoja de calculo
    expect(normalizarPatente("GRP'476")).toBe('GRP476');
    expect(normalizarPatente('OFT488|')).toBe('OFT488');
    expect(normalizarPatente('  hrc981  ')).toBe('HRC981');
  });

  it('tolera vacios', () => {
    expect(normalizarPatente('')).toBe('');
    expect(normalizarPatente(null)).toBe('');
    expect(normalizarPatente(undefined)).toBe('');
  });
});

describe('formatearPatente', () => {
  it('separa el formato Mercosur', () => {
    expect(formatearPatente('ac313yq')).toBe('AC 313 YQ');
  });

  it('separa el formato viejo', () => {
    expect(formatearPatente('khm802')).toBe('KHM 802');
  });

  it('deja intacto lo que no encaja en ningun formato', () => {
    expect(formatearPatente('AC7556GW')).toBe('AC7556GW');
  });
});

describe('esPatenteBuscable', () => {
  it('rechaza lo demasiado corto', () => {
    expect(esPatenteBuscable('AB12')).toBe(false);
  });

  it('acepta los dos formatos argentinos', () => {
    expect(esPatenteBuscable('ABC123')).toBe(true);
    expect(esPatenteBuscable('AB123CD')).toBe(true);
  });
});
