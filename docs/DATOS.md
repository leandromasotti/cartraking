# Los datos: la Google Sheet

Toda la informacion del sistema sale de una sola planilla de Google. No hay
base de datos ni backend propio: la app **solo lee**.

## De donde sale

El personal del taller carga cada servicio desde un **Formulario de Google**.
La planilla es la hoja de respuestas de ese formulario, por eso se llama
`Respuestas de formulario 5` y la primera columna es la `Marca temporal` que
pone Google sola.

Eso tiene dos consecuencias que hay que tener presentes siempre:

1. **Nadie valida nada al cargar.** Lo que se tipea es lo que queda.
2. **La marca temporal es el momento de la carga**, no necesariamente el
   momento exacto del servicio. En la practica se cargan juntos, asi que la
   usamos como fecha del servicio.

## Estructura

| Col | Encabezado | Ejemplo | Uso en la app |
| --- | --- | --- | --- |
| A | `Marca temporal` | `1/02/2020 8:47:24` | Fecha del servicio |
| B | `VEHICULO` | `LOGAN 1.6 NAFTA` | Descripcion del auto |
| C | `PATENTE` | `AC313YQ` | Clave de busqueda |
| D | `KILOMETROS ` | `80800` | Kilometraje al momento del servicio |
| E | `FILTRO DE ACEITE` | `SI` / `NO` | Filtro cambiado |
| F | `FILTRO DE AIRE` | `SI` / `NO` | Filtro cambiado |
| G | `FILTRO DE COMBUSTIBLE` | `SI` / `NO` | Filtro cambiado |
| H | `FILTRO HABITACULO` | `SI` / `NO` | Filtro cambiado |
| I | `ACEITE` | `TOTAL 7000` | Producto usado |
| J | `PRECIO TOTAL` | `2580` | **Interno: nunca se expone** |

Ojo con el encabezado de la columna D: tiene un espacio al final
(`"KILOMETROS "`). La app lee por indice de columna, no por nombre, asi que no
la afecta.

## Volumen (relevamiento del 22/09/2026)

- **13.958** servicios cargados
- **5.738** patentes distintas
- Desde el **26/12/2018** hasta hoy: el sistema esta en uso activo

Servicios por vehiculo:

| Servicios | Vehiculos |
| --- | --- |
| 1 | 2.927 |
| 2 | 1.051 |
| 3 | 618 |
| 4 | 393 |
| 5 | 239 |
| 6 o mas | 510 |

Mas de la mitad de las patentes aparecen una sola vez. Es normal en un
lubricentro de ruta y explica por que el ticket con QR importa: es la forma de
que el cliente ocasional vuelva.

## Intervalos reales entre servicios

Calculado sobre los vehiculos con dos o mas servicios:

| Percentil | Kilometros | Dias |
| --- | --- | --- |
| p10 | 7.500 | 91 |
| p25 | 9.900 | 146 |
| **mediana** | **11.600** | **244** |
| p75 | 15.800 | 393 |
| p90 | 23.700 | 625 |

Por eso la regla de **10.000 km / 12 meses** que usa `src/lib/mantenimiento.ts`
no es arbitraria: cae cerca de la mediana real del taller.

## Suciedad de datos que hay que tolerar

Todo esto existe hoy en la planilla. Cualquier codigo que la lea tiene que
aguantarlo sin romperse.

**Filas mas cortas de lo esperado.** La API de Google no devuelve las celdas
vacias del final: hay 30 filas con 9 columnas en vez de 10. Por eso
`filaAServicio()` usa `fila[i] ?? ''` en todos los accesos. El codigo .NET
viejo accedia a `item[8]` directo y podia tirar `IndexOutOfRangeException`.

**Patentes escritas de cualquier forma.** Casos reales:

```
FOY 496      espacio en el medio
GRP'476      apostrofe
OFT488|      barra vertical pegada
hrc981       minusculas
SIN PATENTE  texto libre
CORSA        cargaron el modelo en vez de la patente
AC7556GW     un caracter de mas
```

`normalizarPatente()` deja solo letras y numeros en mayusculas, que es lo que
permite que `FOY 496` y `FOY'496` se agrupen como el mismo auto.

**Kilometrajes no numericos.** Hay un `NO INDICA`. `parsearKilometros()`
devuelve `null` y la UI muestra "sin dato" en vez de un `NaN`.

**Fechas en formato `d/M/yyyy`.** Dia primero, con hora opcional. Esto se
verifico sobre los datos: hay 7.589 filas con el primer numero mayor a 12 y
**ninguna** con el segundo mayor a 12, asi que el formato es inequivoco. Si se
interpretara como `M/d/yyyy` mas de la mitad de las fechas serian invalidas.

**Descripcion del vehiculo inconsistente.** El mismo auto puede figurar como
`LOGAN 1.6` en un servicio y `LOGAN 1.6 NAFTA` en otro. Se toma la del
servicio mas reciente que tenga algo cargado.

## Aceites mas usados

Util si alguna vez se quiere afinar el intervalo segun el tipo de aceite (hoy
es fijo):

| Producto | Servicios |
| --- | --- |
| TOTAL 7000 | 1.901 |
| ELAION F30 | 1.519 |
| HELIX HX7 | 1.041 |
| SELENIA K 15W 40 | 909 |
| ELAION AURO 5W 30 | 840 |
| ELF EVO 700 | 792 |
| ELAION F50E | 744 |
| SYNTIUM 1000 | 578 |

## Acceso

Se lee con la **Google Sheets API v4** y una API key de solo lectura. La
planilla tiene que estar compartida como "cualquiera con el enlace puede ver".

```
GET https://sheets.googleapis.com/v4/spreadsheets/{ID}/values/{RANGO}?key={API_KEY}
```

La respuesta completa pesa **~2,5 MB**. Ver `ARQUITECTURA.md` para como se
cachea.
