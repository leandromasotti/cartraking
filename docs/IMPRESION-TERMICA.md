# Impresion termica del ticket con QR

## Como funciona

El ticket se imprime **desde el navegador**, con la impresora termica instalada
en Windows (o Android) como una impresora comun. No hace falta instalar nada
en el sistema mas alla del driver de la impresora, ni un servicio intermedio,
ni comandos ESC/POS.

El flujo del mostrador es:

1. Se carga el servicio en el Formulario de Google, como siempre.
2. Se abre `/imprimir` en la PC del local.
3. Se tipea la patente y se aprieta **Generar ticket**.
4. **Imprimir ticket** abre el dialogo del navegador. Enter.

El cliente se lleva el ticket, escanea el QR con el celular y entra directo a
`/patente/SUPATENTE`, donde ve el historial y cuando le toca el proximo cambio.

## Conexion de la impresora: USB, red o Bluetooth

**Da lo mismo.** Al navegador no le importa como esta conectada la impresora:
imprime contra lo que Windows tenga instalado como impresora. USB es incluso
la opcion mas simple y confiable de las tres, porque no depende de la red del
local.

Lo unico que hace falta es que la impresora aparezca en **Configuracion >
Bluetooth y dispositivos > Impresoras y escaneres**.

**El detalle que si importa: el driver.** Muchas termicas chinas se pueden
instalar con el driver **"Generic / Text Only"** de Windows. Ese driver
imprime texto pero **no imprime imagenes**, asi que el QR y el logo saldrian en
blanco. Hay que instalar el driver del fabricante (XPrinter, EPSON TM, Gadnic,
Nextep, segun la marca), que soporta graficos raster.

Como verificarlo en un minuto: imprimi cualquier ticket de prueba. Si sale el
texto pero el recuadro del QR queda vacio, el driver es el problema.

## De donde sale el codigo QR

**No hace falta ninguna herramienta externa.** No hay que ir a una pagina de
"generar QR gratis" ni pegar nada a mano.

El QR lo genera la propia aplicacion, en el servidor, cada vez que se abre un
ticket. Lo hace `src/lib/qr.ts` con la libreria [`qrcode`](https://www.npmjs.com/package/qrcode)
de npm, a partir de la URL del detalle de esa patente:

```
https://TU-DOMINIO/patente/AB123CD
```

Esa URL se arma con `NEXT_PUBLIC_SITE_URL` + la patente normalizada. O sea:
**cada ticket lleva su propio QR**, distinto para cada auto, generado
automaticamente. El resultado se embebe en el HTML como imagen, asi que no hay
llamadas a servicios de terceros ni dependencia de internet al momento de
imprimir.

Si queres ver que URL lleva un QR antes de imprimirlo, la pagina del ticket la
muestra en texto arriba de la vista previa, y tambien impresa abajo del codigo
como respaldo por si alguien no puede escanear.

## Que se imprime en el ticket

1. **El logo de Dolores Lubricantes**, en blanco y negro puro.
2. La patente y el vehiculo.
3. El ultimo servicio: fecha, kilometraje, aceite y filtros cambiados.
4. **Cuando tiene que volver**, en un recuadro destacado: el kilometraje
   objetivo (ultimo + 10.000 km) y la fecha limite (ultimo + 12 meses).
5. El QR y la URL en texto.
6. Direccion y telefono del local.

### El logo

El logo original es texto blanco sobre fondo negro texturado. Impreso tal cual
en una termica saldria como una mancha, asi que hay dos versiones monocromas
preparadas: `public/logo-ticket-58.png` y `public/logo-ticket-80.png`, negro
puro sobre blanco, generadas al tamano exacto en pixeles que corresponde a cada
rollo (8 px por milimetro, la resolucion del cabezal de 203 dpi). Asi el
navegador no tiene que reescalar nada.

Si alguna vez cambia el logo, hay que regenerar esos dos archivos con el mismo
criterio: silueta negra sobre blanco, sin grises ni degrades.

## Configuracion del navegador (una sola vez)

En el dialogo de impresion de Chrome o Edge, en **Mas opciones**:

| Opcion | Valor |
| --- | --- |
| Destino | la impresora termica |
| Margenes | **Ninguno** |
| Escala | **100%** (no "Ajustar al area de impresion") |
| Encabezados y pies de pagina | **desactivado** |
| Graficos de fondo | desactivado (activar solo si el QR sale en blanco) |

Chrome recuerda estas opciones por impresora, asi que se configura una vez.

Las dos que mas importan:

- **Margenes en "Ninguno".** Si quedan los margenes por defecto, el navegador
  encoge todo y el QR sale demasiado chico para que un celular lo lea.
- **Escala en 100%.** "Ajustar al area de impresion" reescala el QR a un tamano
  arbitrario y aparecen artefactos de interpolacion que rompen la lectura.

## Ancho de papel

La pagina soporta los dos rollos estandar. Se elige con los botones o con el
parametro `?ancho=`:

| Rollo | Area util | QR impreso | URL |
| --- | --- | --- | --- |
| 58 mm | 48 mm | 34 mm | `/imprimir/AB123CD?ancho=58` |
| 80 mm | 72 mm | 46 mm | `/imprimir/AB123CD?ancho=80` |

El area util es menor que el papel porque el cabezal no imprime hasta el borde.
Las medidas estan en `src/lib/ticket.ts`; si la impresora del local imprime un
area distinta, se cambian ahi y todo el ticket se reacomoda solo.

El ancho por defecto es **80 mm**. Para cambiarlo, `ANCHO_POR_DEFECTO` en el
mismo archivo.

## Impresion en un click

Agregando `?auto=1` el dialogo de impresion se abre solo al cargar la pagina:

```
/imprimir/AB123CD?ancho=58&auto=1
```

Sirve para dejar un acceso directo en el escritorio de la PC del mostrador.

## Como esta hecho

**La regla `@page` se inyecta desde el servidor**, en
`src/app/imprimir/[patente]/page.tsx`, porque el tamano depende del rollo
elegido:

```css
@page { size: 58mm auto; margin: 0; }
```

`auto` de alto es lo que hace que el rollo corte a la medida del contenido en
vez de avanzar una hoja A4 entera.

**Todo el ticket esta en milimetros**, no en pixeles: es la unica forma de que
lo que se ve en pantalla sea lo que sale en el papel.

**No hay color ni fondos.** La termica es monocromo: cualquier fondo gris sale
como una mancha. Las reglas de `@media print` en `globals.css` matan sombras y
fondos, y el ticket es negro sobre blanco.

**La clase `.no-imprimir`** saca de la impresion todo lo que solo sirve en
pantalla: la navegacion, los botones, el selector de ancho.

**`image-rendering: pixelated`** en el QR. Sin eso el navegador suaviza los
bordes al escalar y la termica convierte ese gris en ruido.

## Problemas conocidos

**El QR no lo lee el celular.** Casi siempre es escala o margenes. Verifica que
el dialogo tenga Margenes "Ninguno" y Escala 100%. Si el rollo es de 58 mm,
confirma que estes usando `?ancho=58` y no el de 80.

**Sale una hoja en blanco al final.** El `@page` tiene `margin: 0`, pero algunos
drivers agregan su propio margen. En las propiedades de la impresora, en
Windows, poni el tamano de papel en el rollo correcto (58 x 297 mm o similar).

**El ticket sale cortado a lo ancho.** El area util configurada es mayor que la
real de esa impresora. Bajala en `ANCHOS_DE_PAPEL` en `src/lib/ticket.ts`.

**Sale todo muy chico.** Escala distinta de 100%, o el navegador quedo en
"Ajustar al area de impresion".

## Si en algun momento hace falta ESC/POS

La impresion por navegador cubre el caso del mostrador y funciona tambien desde
un celular. Si mas adelante se quiere corte automatico de papel, cajon de
dinero o impresion sin dialogo, el camino es un servicio local en Node con
`node-thermal-printer` hablando por USB o red. Eso implica instalar y mantener
software en la PC del local, por eso no se hizo ahora.
