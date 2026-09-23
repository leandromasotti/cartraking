import { describe, expect, it } from 'vitest';

import {
  DIAS_DE_AVISO_PREVIO,
  INTERVALO_KM,
  calcularProximoServicio,
  diferenciaEnDias,
  kilometrosRestantes,
  sumarMeses,
} from './mantenimiento';

describe('sumarMeses', () => {
  it('mantiene el dia cuando el mes destino lo tiene', () => {
    expect(sumarMeses(new Date(2024, 0, 15), 12)).toEqual(new Date(2025, 0, 15));
  });

  it('recorta al ultimo dia del mes destino', () => {
    // 31/01 + 1 mes no puede ser 03/03
    expect(sumarMeses(new Date(2024, 0, 31), 1)).toEqual(new Date(2024, 1, 29));
  });

  it('cruza el fin de ano', () => {
    expect(sumarMeses(new Date(2024, 10, 20), 12)).toEqual(new Date(2025, 10, 20));
  });
});

describe('diferenciaEnDias', () => {
  it('ignora la hora del dia', () => {
    const a = new Date(2024, 2, 1, 23, 50);
    const b = new Date(2024, 2, 2, 0, 10);
    expect(diferenciaEnDias(a, b)).toBe(1);
  });
});

describe('calcularProximoServicio', () => {
  const hoy = new Date(2026, 8, 22); // 22/09/2026

  it('marca vencido cuando paso mas de un ano', () => {
    const r = calcularProximoServicio(
      { fecha: new Date(2025, 0, 10), kilometros: 80_000 },
      hoy,
    );
    expect(r.estado).toBe('vencido');
    expect(r.vencidoPorTiempo).toBe(true);
    expect(r.diasRestantes).toBeLessThan(0);
    expect(r.kilometrajeObjetivo).toBe(80_000 + INTERVALO_KM);
    expect(r.fechaObjetivo).toEqual(new Date(2026, 0, 10));
  });

  it('avisa cuando faltan pocos dias', () => {
    const ultimoServicio = { fecha: sumarMeses(hoy, -12), kilometros: 50_000 };
    const r = calcularProximoServicio(ultimoServicio, hoy);
    expect(r.diasRestantes).toBe(0);
    expect(r.estado).toBe('por-vencer');
  });

  it('esta al dia cuando falta mas que el margen de aviso', () => {
    const fecha = new Date(hoy.getTime());
    fecha.setDate(fecha.getDate() - 30);
    const r = calcularProximoServicio({ fecha, kilometros: 120_000 }, hoy);
    expect(r.estado).toBe('al-dia');
    expect(r.diasRestantes).toBeGreaterThan(DIAS_DE_AVISO_PREVIO);
    expect(r.diasTranscurridos).toBe(30);
  });

  it('sin km igual calcula el vencimiento por tiempo', () => {
    const r = calcularProximoServicio({ fecha: new Date(2026, 7, 1), kilometros: null }, hoy);
    expect(r.kilometrajeObjetivo).toBeNull();
    expect(r.estado).toBe('al-dia');
    expect(r.fechaObjetivo).toEqual(new Date(2027, 7, 1));
  });

  it('sin fecha devuelve solo el km objetivo', () => {
    const r = calcularProximoServicio({ fecha: null, kilometros: 10_000 }, hoy);
    expect(r.kilometrajeObjetivo).toBe(20_000);
    expect(r.fechaObjetivo).toBeNull();
    expect(r.estado).toBe('al-dia');
  });

  it('sin servicio previo informa sin-datos', () => {
    expect(calcularProximoServicio(null, hoy).estado).toBe('sin-datos');
  });
});

describe('kilometrosRestantes', () => {
  it('devuelve lo que falta', () => {
    expect(kilometrosRestantes(90_000, 85_500)).toBe(4_500);
  });

  it('devuelve negativo si ya se paso', () => {
    expect(kilometrosRestantes(90_000, 93_000)).toBe(-3_000);
  });

  it('null si falta algun dato', () => {
    expect(kilometrosRestantes(null, 10)).toBeNull();
    expect(kilometrosRestantes(10, null)).toBeNull();
  });
});
