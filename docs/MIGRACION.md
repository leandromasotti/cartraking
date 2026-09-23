# Migracion de ASP.NET Core a Next.js

Septiembre de 2026.

## Por que se migro

El sistema original era ASP.NET Core 3.1 con un SPA de React 16 servido por
`Microsoft.AspNetCore.SpaServices`. Tres razones concretas, no una preferencia
de stack:

**No compilaba mas.** .NET Core 3.1 esta fuera de soporte desde diciembre de
2022 y el SDK 3.1 ya no estaba instalado en la maquina de desarrollo. En
paralelo, `react-scripts` 3.4 no arranca con Node 17 o superior por el cambio
de OpenSSL 3 (`digital envelope routines::unsupported`). O sea: el proyecto no
se podia levantar ni para tocarle una coma.

**La API key estaba en el codigo.** `CarController.cs` tenia la key de Google
Sheets escrita literal, en un repositorio publico.

**Todo el trafico es de celular** (el cliente escanea el QR del ticket) y la UI
no era responsive: una tabla de siete columnas con una clase `d-none-mobile`
que nunca existio en el CSS.

## Que cambio

| Antes | Ahora |
| --- | --- |
| ASP.NET Core 3.1 + React 16 (CRA) | Next.js 15, React 19, Server Components |
| JavaScript sin tipos | TypeScript `strict` |
| Bootstrap 4 + reactstrap + jQuery | Tailwind CSS v4 |
| API key hardcodeada | Variable de entorno |
| Sin tests | Vitest sobre la logica de dominio |
| IIS / servidor propio | Vercel |
| Fetch en el cliente, spinner | Server Components con ISR |

## Equivalencias de codigo

| Archivo viejo | Reemplazo |
| --- | --- |
| `Controllers/CarController.cs` (`Detail`) | `src/lib/sheets.ts` + `src/app/api/patente/[patente]/route.ts` |
| `Model/Car.cs`, `Model/CarService.cs` | tipos `Vehiculo` y `Servicio` en `src/lib/sheets.ts` |
| `ClientApp/src/components/Home.js` | `src/app/page.tsx` + `src/components/BuscadorDePatente.tsx` |
| `ClientApp/src/components/CarDetail.js` | `src/app/patente/[patente]/page.tsx` + `HistorialDeServicios.tsx` |
| `ClientApp/src/components/NavMenu.js` | `src/components/Encabezado.tsx` |
| `ClientApp/src/components/Footer.js` | `src/components/PieDePagina.tsx` |
| `Startup.cs`, `Program.cs` | no aplica |
| `Counter.js`, `FetchData.js` | eliminados (eran del template de Visual Studio) |

La ruta publica cambio de `/car-detail/:id` a **`/patente/:patente`**. No hace
falta redirigir: la version vieja nunca imprimio QR, asi que no hay links en
papel apuntando a la ruta anterior.

## Errores del codigo viejo que se corrigieron

**`IndexOutOfRangeException` latente.** `CarController.Detail` validaba
`item.Count > 1` y despues accedia hasta `item[8]`. Hay 30 filas en la planilla
con solo 9 columnas; una fila con menos hubiera tirado la excepcion. Ahora todo
acceso usa `fila[i] ?? ''`.

**`Convert.ToInt32(item[3])` sin proteccion.** La planilla tiene un kilometraje
cargado como `NO INDICA`. Ese registro rompia la consulta del vehiculo entero.
`parsearKilometros()` devuelve `null` y la UI muestra "sin dato".

**Patentes que no se agrupaban.** La comparacion era
`item[2].ToUpper() == id.ToUpper()`, sin limpiar. `FOY 496` y `FOY'496` eran
autos distintos para el sistema. `normalizarPatente()` los unifica.

**Checkboxes de solo lectura mal hechos.** `<input type="checkbox" checked={...}>`
sin `onChange` genera un warning de React y un control que el usuario puede
tildar. Ahora son texto y chips, que ademas se leen mejor en celular.

**`key={serv.date}`.** Dos servicios cargados el mismo dia colisionaban. Ahora
la key incluye el indice.

**`NextServiceKilometers`** existia en `CarService.cs` y nunca se llenaba. Esa
es, justamente, la funcionalidad que ahora implementa `mantenimiento.ts`.

## Funcionalidad nueva

- **Calculo del proximo cambio**: 10.000 km o 12 meses, lo que ocurra primero,
  con estado visible (al dia / por vencer / vencido).
- **Ticket termico con QR** que lleva al detalle de la patente.
- **Calculadora de kilometros**: el cliente pone cuanto marca hoy el odometro y
  el sistema le dice cuanto le falta.
- **Diseno responsive de verdad**: tarjetas en celular, tabla en escritorio.
- **Link de WhatsApp** con mensaje prearmado para sacar turno.

## El codigo viejo

Quedo congelado en `legacy/dotnet-cartracking/`. No se compila ni se incluye en
el build (`next.config.ts` lo excluye del tracing, `vitest.config.ts` y
`eslint.config.mjs` lo ignoran).

Se puede borrar cuando el sistema nuevo lleve un tiempo en produccion. La
historia de git lo conserva igual: el ultimo commit con el sistema .NET vivo es
`720e50f`.
