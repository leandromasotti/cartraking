import { describe, expect, it } from 'vitest';

import { agruparPorPatente, filaAServicio, parsearFecha, parsearKilometros } from './sheets';

describe('parsearFecha', () => {
  it('interpreta el formato d/M/yyyy del formulario', () => {
    // 1/02/2020 es 1 de febrero, no 2 de enero
    expect(parsearFecha('1/02/2020 8:47:24')).toEqual(new Date(2020, 1, 1, 8, 47, 24));
  });

  it('acepta dia de dos digitos mayor a 12', () => {
    expect(parsearFecha('25/12/2023 10:30:00')).toEqual(new Date(2023, 11, 25, 10, 30, 0));
  });

  it('funciona sin hora', () => {
    expect(parsearFecha('3/4/2021')).toEqual(new Date(2021, 3, 3, 0, 0, 0));
  });

  it('descarta fechas imposibles y basura', () => {
    expect(parsearFecha('31/02/2021')).toBeNull();
    expect(parsearFecha('pendiente')).toBeNull();
    expect(parsearFecha(undefined)).toBeNull();
  });
});

describe('parsearKilometros', () => {
  it('lee numeros planos y con separadores', () => {
    expect(parsearKilometros('80800')).toBe(80800);
    expect(parsearKilometros('150.550')).toBe(150550);
    expect(parsearKilometros('63 800 km')).toBe(63800);
  });

  it('devuelve null cuando no hay numero', () => {
    // Este valor existe tal cual en la planilla
    expect(parsearKilometros('NO INDICA')).toBeNull();
    expect(parsearKilometros('')).toBeNull();
    expect(parsearKilometros('0')).toBeNull();
  });
});

describe('filaAServicio', () => {
  it('mapea una fila completa', () => {
    const s = filaAServicio([
      '1/02/2020 8:47:24',
      'LOGAN 1.6 NAFTA',
      'AC313YQ',
      '80800',
      'SI',
      'SI',
      'SI',
      'NO',
      'SYNTIUM 1000',
      '2580',
    ]);
    expect(s.kilometros).toBe(80800);
    expect(s.filtroAceite).toBe(true);
    expect(s.filtroHabitaculo).toBe(false);
    expect(s.aceite).toBe('SYNTIUM 1000');
  });

  it('no explota con filas cortas', () => {
    // La API omite las celdas vacias del final: hay filas de 9 columnas
    const s = filaAServicio(['1/02/2020 8:47:24', 'CORSA', 'KHM802']);
    expect(s.kilometros).toBeNull();
    expect(s.aceite).toBe('');
    expect(s.filtroAire).toBe(false);
  });
});

describe('agruparPorPatente', () => {
  const filas = [
    ['1/02/2020 8:47:24', 'LOGAN 1.6', 'foy 496', '80800', 'SI', 'NO', 'NO', 'NO', 'TOTAL 7000'],
    ['5/03/2022 9:00:00', 'LOGAN 1.6 NAFTA', "FOY'496", '95000', 'SI', 'SI', 'NO', 'NO', 'ELAION F30'],
    ['7/07/2021 9:00:00', 'CORSA 1.4', 'KHM802', '150550', 'SI', 'SI', 'NO', 'SI', 'ELAION F30'],
    ['', '', '', '', ''],
  ];

  it('junta las variantes de escritura de la misma patente', () => {
    const v = agruparPorPatente(filas);
    expect(v.size).toBe(2);
    expect(v.get('FOY496')?.servicios).toHaveLength(2);
  });

  it('ordena del servicio mas nuevo al mas viejo', () => {
    const servicios = agruparPorPatente(filas).get('FOY496')!.servicios;
    expect(servicios[0].kilometros).toBe(95000);
    expect(servicios[1].kilometros).toBe(80800);
  });

  it('toma la descripcion del vehiculo del servicio mas reciente', () => {
    expect(agruparPorPatente(filas).get('FOY496')?.vehiculo).toBe('LOGAN 1.6 NAFTA');
  });

  it('ignora filas sin patente', () => {
    expect(agruparPorPatente(filas).has('')).toBe(false);
  });
});
