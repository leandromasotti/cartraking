# Arquitectura

## En una frase

Next.js 15 con Server Components lee una Google Sheet, calcula cuando toca el
proximo cambio de aceite y renderiza dos cosas: una pagina publica por patente
y un ticket con QR para impresora termica.

## Diagrama

```
                    Formulario de Google
                            |
                            v
                     Google Sheet  (unica fuente de verdad)
                            |
                            | Sheets API v4 (solo lectura, API key)
                            v
        +---------------------------------------------+
        |              Next.js (Vercel)               |
        |                                             |
        |  src/lib/sheets.ts   descarga + parseo      |
        |         |            + cache en memoria     |
        |         v                                   |
        |  src/lib/mantenimiento.ts  regla 10.000 km  |
        |         |                  / 12 meses       |
        |         v                                   |
        |  Server Components  ---> HTML (ISR 5 min)   |
        |  src/lib/qr.ts      ---> QR como data URI   |
        +---------------------------------------------+
                  |                        |
                  v                        v
          Celular del cliente        Impresora termica
          (escanea el QR)            (ticket de 58/80 mm)
```

## Las tres capas

**`src/lib` es logica pura y testeable.** `mantenimiento.ts`, `patente.ts` y
`formato.ts` no tocan la red ni React. El parseo de `sheets.ts` (`parsearFecha`,
`parsearKilometros`, `filaAServicio`, `agruparPorPatente`) tambien es puro y se
exporta aparte de la descarga justamente para poder testearlo sin red.

**Los Server Components hacen el trabajo.** Las paginas son `async` y llaman a
`obtenerVehiculo()` directo. No hay estado global, ni data fetching en el
cliente, ni loading spinners. Los unicos componentes cliente son tres, y cada
uno existe por una razon concreta:

| Componente | Por que es cliente |
| --- | --- |
| `BuscadorDePatente` | valida y navega con `useRouter` |
| `CalculadoraDeKilometros` | calcula mientras el usuario tipea |
| `BotonImprimir` | llama a `window.print()` |

**`import 'server-only'`** en `sheets.ts` y `qr.ts`. Si alguien los importa
desde un componente cliente, el build falla en vez de filtrar la API key al
bundle.

## El cacheo, que es la parte no obvia

La planilla pesa ~2,5 MB. El **Data Cache de Next tiene un limite de 2 MB por
entrada**, asi que `fetch` con `next: { revalidate }` simplemente no la cachea:
cada request se bajaria los 2,5 MB de nuevo.

La solucion son dos capas:

**1. Cache en memoria dentro del modulo** (`sheets.ts`). Guarda el `Map` ya
parseado con un TTL de `SHEET_CACHE_TTL_SECONDS` (5 min por defecto). Mientras
la instancia siga viva, las consultas no salen a Google. Ademas, si llegan
varias consultas juntas con el cache vencido, todas se cuelgan de la *misma*
descarga en vuelo (`descargaEnCurso`) en lugar de disparar una cada una.

**2. ISR en las paginas** (`export const revalidate = 300`). Es la capa que de
verdad evita casi todas las descargas: Vercel sirve el HTML ya renderizado de
cada patente y lo regenera en segundo plano cada 5 minutos.

El cache en memoria no sobrevive a un cold start ni se comparte entre
instancias. No importa: es un cache oportunista, y el ISR es el que sostiene la
performance.

**Consecuencia practica:** un servicio cargado en la planilla tarda hasta ~5
minutos en aparecer en la web. Es aceptable para el caso de uso y evita
depender de un webhook desde Google.

## Rutas

| Ruta | Tipo | Que hace |
| --- | --- | --- |
| `/` | estatica | Buscador, contacto, mapa |
| `/patente/[patente]` | ISR 5 min | Detalle publico del vehiculo |
| `/imprimir` | estatica | Panel del mostrador |
| `/imprimir/[patente]` | ISR 5 min | Ticket termico con QR |
| `/api/patente/[patente]` | dinamica | JSON, reemplaza `GET /car/detail?id=` |

Las paginas de patente llevan `robots: { index: false }`: son datos del cliente,
no contenido para buscadores.

## El QR

`src/lib/qr.ts` genera un **data URI PNG en el servidor** y lo embebe en el
HTML. No es un endpoint de imagen. La razon es concreta: el ticket tiene que
poder imprimirse aunque la PC del local pierda internet justo en ese momento.
Si el QR fuera `<img src="/api/qr/...">` y la conexion se cortara entre que
carga la pagina y se manda a imprimir, saldria un ticket con un hueco blanco.

Parametros y por que:

- **Correccion de errores `M`** (~15%): tolera que el papel termico se manche o
  se borronee. `L` seria mas chico pero mas fragil; `H` agranda el codigo sin
  necesidad real.
- **`margin: 2`**: el "quiet zone" minimo. Sin el, muchos lectores de celular
  no enganchan el codigo.
- **8 px por milimetro**: la termica imprime a 203 dpi, que son exactamente 8
  puntos por mm. Generar el PNG a esa escala hace que cada modulo del QR caiga
  entero sobre un punto del cabezal, sin bordes grises.

La URL que codifica sale de `NEXT_PUBLIC_SITE_URL`. **Si cambia el dominio, los
QR ya impresos siguen apuntando al viejo**, asi que hay que mantenerlo
redirigiendo.

## Que NO tiene el sistema, a proposito

- **No hay login.** Cualquiera que sepa una patente ve su historial. Es
  informacion de bajo riesgo y agregar cuentas destruiria el caso de uso
  (escanear y ver).
- **No hay escritura.** La carga sigue siendo por el Formulario de Google, que
  ya funciona y el personal ya sabe usar.
- **No hay base de datos.** Agregarla obligaria a sincronizar dos fuentes de
  verdad.
