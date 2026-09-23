# CLAUDE.md

Guia para trabajar en este repo con Claude Code.

## Que es esto

Sistema de consulta de cambios de aceite y filtros de **Dolores Lubricantes**
(Dolores, Provincia de Buenos Aires).

El cliente entra, pone la patente de su auto y ve:

1. el historial completo de servicios que le hizo el taller, y
2. cuando le toca el proximo cambio (10.000 km o 12 meses, lo que pase primero).

El taller imprime un ticket en impresora termica con un **QR** que lleva
directo al detalle de esa patente.

**No hay base de datos.** La unica fuente de verdad es una Google Sheet que se
llena desde un Formulario de Google que carga el personal del taller. La app
es de solo lectura.

## Stack

| Que | Con que |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19, Server Components) |
| Lenguaje | TypeScript en modo `strict` |
| Estilos | Tailwind CSS v4 (config en `src/app/globals.css`, no hay `tailwind.config`) |
| Datos | Google Sheets API v4, solo lectura, con API key |
| QR | `qrcode` (genera un data URI PNG en el servidor) |
| Tests | Vitest sobre la logica pura de `src/lib` |
| Deploy | Vercel |

Antes de octubre de 2026 esto era ASP.NET Core 3.1 + React 16 (CRA). Ese
codigo quedo congelado en `legacy/dotnet-cartracking/` como referencia; **no se
compila, no se toca y no forma parte del build**. Ver `docs/MIGRACION.md`.

## Mapa del repo

```
src/
  app/                         rutas (App Router)
    page.tsx                   inicio: buscador + contacto + mapa
    patente/[patente]/page.tsx detalle publico de un vehiculo
    imprimir/page.tsx          panel del mostrador
    imprimir/[patente]/page.tsx ticket termico con QR
    api/patente/[patente]/     JSON (reemplaza el viejo GET /car/detail?id=)
    globals.css                tema Tailwind + reglas @media print
  components/                  componentes de UI
  lib/
    sheets.ts                  descarga y parseo de la planilla  (servidor)
    mantenimiento.ts           reglas del proximo cambio         (puro)
    patente.ts                 normalizacion de patentes         (puro)
    formato.ts                 fechas y numeros es-AR            (puro)
    qr.ts                      generacion del QR                 (servidor)
    ticket.ts                  medidas del papel termico         (puro)
    config.ts                  entorno y datos del local
docs/                          documentacion detallada
legacy/dotnet-cartracking/     el sistema viejo, congelado
```

## Reglas del proyecto

**Idioma.** Codigo, comentarios, nombres de variables, commits y UI en
castellano. Sin tildes en identificadores ni en nombres de archivo. El texto
visible tampoco usa tildes: es una decision deliberada para que la impresora
termica no escupa caracteres raros, y se mantiene en toda la UI por
consistencia.

**La logica pura va en `src/lib` y se testea.** `mantenimiento.ts`,
`patente.ts`, `formato.ts` y el parseo de `sheets.ts` no dependen de React ni
de la red. Si tocas una regla de negocio, el test se actualiza en el mismo
cambio.

**Los modulos de servidor llevan `import 'server-only'`.** Va en `sheets.ts` y
`qr.ts`: la API key no puede terminar en el bundle del cliente. En los tests,
`vitest.config.ts` lo reemplaza por un stub.

**Nunca se expone el precio.** La columna J de la planilla (`PRECIO TOTAL`) es
informacion interna del taller. No se manda al cliente ni por la pagina ni por
la API. Si agregas un campo nuevo, revisa que no la arrastre.

**Los datos de la planilla vienen sucios.** Se carga a mano desde un
formulario: hay patentes con espacios y apostrofes, kilometrajes que dicen
`NO INDICA` y filas a las que les faltan columnas del final. Todo lo que lea
la planilla tiene que tolerar eso sin romperse. Ver `docs/DATOS.md`.

**Mobile primero.** Casi todo el trafico llega de un celular escaneando el QR
del ticket. Se disena para 360 px de ancho y despues se agranda.

**`.no-imprimir`** es la clase para lo que existe solo en pantalla
(navegacion, botones, formularios). Las reglas de impresion estan en
`globals.css` y en el `<style>` propio de `Ticket.tsx`.

## Comandos

```bash
npm run dev         # servidor de desarrollo en http://localhost:3000
npm run build       # build de produccion
npm test            # tests de la logica de dominio
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

Antes de dar por terminado un cambio: `npm test && npm run typecheck && npm run lint`.

## Variables de entorno

Estan documentadas en `.env.example`. Para desarrollo, copialo a `.env.local`.
La unica obligatoria es `GOOGLE_SHEETS_API_KEY`.

## Cosas que conviene saber antes de tocar

- **La planilla pesa ~2,5 MB**, por encima del limite de 2 MB del Data Cache de
  Next. Por eso `sheets.ts` tiene su propio cache en memoria y las paginas usan
  ISR (`export const revalidate = 300`). No cambies eso por `fetch` cacheado sin
  leer `docs/ARQUITECTURA.md`.
- **El QR se embebe como data URI**, no como una URL a un endpoint. Es a
  proposito: el ticket tiene que poder imprimirse aunque la PC del local se
  quede sin internet en ese momento.
- **La URL que codifica el QR sale de `NEXT_PUBLIC_SITE_URL`.** Si cambia el
  dominio, los QR ya impresos siguen apuntando al viejo. Manten el dominio
  anterior redirigiendo.
- **El intervalo de servicio (10.000 km / 12 meses) esta en
  `src/lib/mantenimiento.ts`** como unica fuente. No lo repitas en la UI.
