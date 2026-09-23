import { afterEach, describe, expect, it } from 'vitest';

import { claveCorrecta, destinoSeguro, generarToken, sesionValida, sonIguales } from './admin';

const CLAVE_ORIGINAL = process.env.CLAVE_ADMIN;

afterEach(() => {
  if (CLAVE_ORIGINAL === undefined) delete process.env.CLAVE_ADMIN;
  else process.env.CLAVE_ADMIN = CLAVE_ORIGINAL;
});

describe('destinoSeguro', () => {
  it('acepta rutas internas del area administrativa', () => {
    expect(destinoSeguro('/admin/ticket/AB123CD?ancho=58')).toBe('/admin/ticket/AB123CD?ancho=58');
  });

  it('rechaza rutas fuera de /admin', () => {
    expect(destinoSeguro('/patente/AB123CD')).toBe('/admin');
  });

  it('rechaza el open redirect disfrazado de ruta relativa', () => {
    // "//otro.com" el navegador lo resuelve como https://otro.com
    expect(destinoSeguro('//evil.example.com')).toBe('/admin');
    expect(destinoSeguro('https://evil.example.com/admin')).toBe('/admin');
  });

  it('no confunde una ruta que solo empieza parecido', () => {
    // '/adminfalso' arranca con '/admin' pero no pertenece al area
    expect(destinoSeguro('/adminfalso')).toBe('/admin');
    expect(destinoSeguro('/admin-otra-cosa')).toBe('/admin');
  });

  it('acepta el panel exacto', () => {
    expect(destinoSeguro('/admin')).toBe('/admin');
  });

  it('usa el panel cuando no viene destino', () => {
    expect(destinoSeguro(null)).toBe('/admin');
    expect(destinoSeguro('')).toBe('/admin');
  });
});

describe('sonIguales', () => {
  it('compara sin cortar al primer caracter distinto', () => {
    expect(sonIguales('abc123', 'abc123')).toBe(true);
    expect(sonIguales('abc123', 'abc124')).toBe(false);
    expect(sonIguales('abc', 'abcd')).toBe(false);
  });
});

describe('generarToken', () => {
  it('es determinista para la misma clave', async () => {
    expect(await generarToken('secreta')).toBe(await generarToken('secreta'));
  });

  it('cambia si cambia la clave', async () => {
    expect(await generarToken('secreta')).not.toBe(await generarToken('otra'));
  });

  it('no filtra la clave en el token', async () => {
    expect(await generarToken('secreta')).not.toContain('secreta');
  });
});

describe('claveCorrecta', () => {
  it('valida contra la variable de entorno', async () => {
    process.env.CLAVE_ADMIN = 'la-del-local';
    expect(await claveCorrecta('la-del-local')).toBe(true);
    expect(await claveCorrecta('otra')).toBe(false);
  });

  it('sin clave configurada no deja entrar a nadie', async () => {
    delete process.env.CLAVE_ADMIN;
    expect(await claveCorrecta('')).toBe(false);
    expect(await claveCorrecta('cualquiera')).toBe(false);
  });
});

describe('sesionValida', () => {
  it('acepta la cookie generada con la clave vigente', async () => {
    process.env.CLAVE_ADMIN = 'la-del-local';
    expect(await sesionValida(await generarToken('la-del-local'))).toBe(true);
  });

  it('rechaza una cookie de otra clave: cambiarla cierra las sesiones', async () => {
    const tokenViejo = await generarToken('la-vieja');
    process.env.CLAVE_ADMIN = 'la-nueva';
    expect(await sesionValida(tokenViejo)).toBe(false);
  });

  it('rechaza cookie ausente o basura', async () => {
    process.env.CLAVE_ADMIN = 'la-del-local';
    expect(await sesionValida(undefined)).toBe(false);
    expect(await sesionValida('cualquier-cosa')).toBe(false);
  });

  it('sin clave configurada el area queda cerrada', async () => {
    const token = await generarToken('la-del-local');
    delete process.env.CLAVE_ADMIN;
    expect(await sesionValida(token)).toBe(false);
  });
});
