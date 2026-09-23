# Dolores Lubricantes

Consulta de cambios de aceite y filtros para el lubricentro **Dolores
Lubricantes** (Moreno 305, Dolores, Provincia de Buenos Aires).

El cliente pone la patente de su auto y ve el historial completo de servicios
del taller, mas la fecha y el kilometraje en los que le toca el proximo cambio.
El taller le entrega un ticket impreso en impresora termica con un **QR** que
lleva directo a esa pagina.

## Como funciona

```
Formulario de Google  ->  Google Sheet  ->  Next.js  ->  pagina publica por patente
                                                     ->  ticket termico con QR
```

No hay base de datos. La carga de servicios sigue siendo por el Formulario de
Google que ya usa el personal; la app **solo lee** la planilla.

## Arrancar

```bash
cp .env.example .env.local     # completar GOOGLE_SHEETS_API_KEY
npm install
npm run dev                    # http://localhost:3000
```

Se necesita Node 20.9 o superior.

## Rutas

| Ruta | Para quien | Que muestra |
| --- | --- | --- |
| `/` | cliente | Buscador de patente, pedir turno, contacto, ubicacion |
| `/patente/AB123CD` | cliente | Historial + proximo cambio |
| `/api/patente/AB123CD` | integraciones | Los mismos datos en JSON |
| `/admin` | taller | Panel para generar el ticket **(pide clave)** |
| `/admin/ticket/AB123CD` | taller | Ticket o sticker con QR (`?formato=58`, `80` o `sticker`) **(pide clave)** |

Todo lo que ve el cliente es publico y de **solo lectura**: la aplicacion no
tiene ningun camino de escritura sobre la planilla. Lo unico protegido por
clave es el panel del local. Ver [docs/ACCESO.md](docs/ACCESO.md).

## Comandos

```bash
npm run dev         # desarrollo
npm run build       # build de produccion
npm test            # tests de la logica de dominio
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

## Documentacion

| Documento | De que trata |
| --- | --- |
| [CLAUDE.md](CLAUDE.md) | Convenciones del repo, para trabajar con Claude Code |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Como esta armado y por que, incluido el cacheo |
| [docs/ACCESO.md](docs/ACCESO.md) | Que ve el cliente, que ve el local y como funciona la clave |
| [docs/DATOS.md](docs/DATOS.md) | La Google Sheet: estructura, volumen y su suciedad |
| [docs/IMPRESION-TERMICA.md](docs/IMPRESION-TERMICA.md) | Configurar la impresora y resolver problemas |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Deploy en Vercel y variables de entorno |
| [docs/MIGRACION.md](docs/MIGRACION.md) | De ASP.NET Core 3.1 a Next.js |

## Stack

Next.js 15 (App Router) - React 19 - TypeScript - Tailwind CSS v4 -
Google Sheets API v4 - Vitest - Vercel

## Regla de mantenimiento

El proximo cambio vence a los **10.000 km** o a los **12 meses**, lo que ocurra
primero. Esta definido en un solo lugar,
[`src/lib/mantenimiento.ts`](src/lib/mantenimiento.ts).
