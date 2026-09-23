# Quien ve que

El sistema tiene dos publicos con necesidades opuestas, y la separacion entre
ellos es una decision de diseno, no un detalle de implementacion.

## El cliente: publico y de solo lectura

Cualquier persona puede entrar sin identificarse y:

- buscar su patente y ver el historial completo de servicios,
- ver cuando le toca el proximo cambio (kilometraje y fecha),
- calcular cuanto le falta cargando lo que marca su odometro hoy,
- escribir al local por WhatsApp para pedir un turno o consultar,
- ver telefono, mail, direccion y ubicacion en el mapa.

**No puede modificar nada, y no porque se lo impida un permiso: la aplicacion
entera es de solo lectura sobre la planilla.** No existe ningun camino de
escritura en el codigo. La carga de servicios sigue siendo por el Formulario de
Google que usa el personal. Eso hace que el "usuario de solo lectura" no
dependa de que un chequeo de permisos este bien puesto: no hay nada que
escribir.

Tampoco ve nada del negocio: el **precio** de cada servicio (columna J de la
planilla) nunca sale del servidor, ni por la pagina ni por la API.

### Por que el cliente no tiene login

Porque destruiria el caso de uso. El cliente escanea el QR del ticket con la
camara del celular y tiene que ver su historial en el acto. Pedirle que cree
una cuenta para eso haria que no lo use nadie.

La consecuencia asumida es que **quien conozca una patente puede ver el
historial de servicios de ese vehiculo**: fechas, kilometrajes, filtros y tipo
de aceite. Es informacion de bajo riesgo (no hay datos personales, ni nombre,
ni telefono, ni domicilio del dueno) y el beneficio de que el sistema se use
supera holgadamente ese costo. Aun asi, las paginas de patente van con
`noindex` y estan excluidas en `robots.txt`, asi que no quedan listadas en
buscadores: hay que saber la patente para llegar.

## El local: detras de una clave

Todo lo administrativo vive bajo `/admin` y pide la clave del local:

| Ruta | Que es |
| --- | --- |
| `/admin` | Panel del mostrador: se ingresa la patente |
| `/admin/ticket/[patente]` | Ticket termico con QR, listo para imprimir |
| `/admin/ingresar` | Pantalla de clave |

El sitio publico **no enlaza a `/admin` desde ningun lado**. Conviene dejar un
acceso directo en el escritorio de la PC del mostrador.

## Como funciona la clave

Una sola clave compartida por el local, en la variable de entorno
`CLAVE_ADMIN`. Para un taller de dos o tres personas, usuarios individuales
serian infraestructura (base de datos, altas y bajas, recupero de contrasena)
sin beneficio real.

El flujo:

1. `src/middleware.ts` intercepta todo `/admin/*` y busca la cookie de sesion.
2. Sin cookie valida, redirige a `/admin/ingresar` guardando a donde se queria
   ir, para volver ahi despues de entrar.
3. El formulario postea a `/api/admin/ingresar`, que compara la clave y, si
   coincide, deja una cookie de sesion.
4. **Ademas, cada pagina de `/admin` vuelve a verificar la sesion del lado del
   servidor** con `exigirSesionAdmin()` (`src/lib/sesion-admin.ts`).

## Por que la verificacion esta duplicada

Next acumula un historial de vulnerabilidades de *middleware bypass*:
peticiones fabricadas que llegan a la pagina sin pasar por el middleware
(GHSA-492v-c6pp-mqqv, GHSA-267c-6grr-h53f, GHSA-26hh-7cqf-hhc6, entre otras).
La recomendacion del propio equipo de Next despues de esos casos es no apoyar
la autorizacion unicamente ahi.

Asi que el middleware es la capa que da la redireccion prolija, y el chequeo
dentro de la pagina es el que de verdad decide. Esta verificado: con el
middleware desactivado a proposito, `/admin` y `/admin/ticket/...` siguen sin
entregar contenido a quien no tiene sesion.

Un detalle de como se ve eso: `/admin/ticket/...` tiene `loading.tsx`, asi que
Next envia la carcasa de carga con un 200 antes de que el guard resuelva, y el
redirect viaja dentro del stream en vez de como cabecera `307`. El navegador lo
sigue igual y **no se emite nada del ticket**; en produccion, ademas, el
middleware corta antes con un 307 limpio.

Detalles que importan:

- **La cookie no guarda la clave**, guarda un HMAC-SHA256 derivado de ella. Si
  alguien lee la cookie no obtiene la contrasena del local.
- **Cambiar `CLAVE_ADMIN` cierra todas las sesiones abiertas**, porque el token
  deriva de la clave y los viejos dejan de validar. Es la forma de sacar acceso
  a alguien que se fue.
- La cookie es `httpOnly` (JavaScript no la puede leer), `sameSite=lax` y
  `secure` en produccion. Dura 30 dias para que la PC del mostrador no tenga
  que reingresar la clave seguido.
- La comparacion es en **tiempo constante**, para no filtrar informacion por
  cuanto tarda en fallar.
- El parametro de retorno se valida contra **open redirect**: solo se vuelve a
  `/admin` o a algo que cuelgue de `/admin/`. Un `//otro-dominio.com` o un
  `/adminfalso` caen al panel.
- **Sin `CLAVE_ADMIN` configurada, `/admin` queda cerrado para todos** y la
  pantalla de ingreso lo dice explicitamente. Nunca queda abierto por omision.

## Probar el ingreso con curl

La cookie sale con el flag `Secure` en produccion, y **curl no guarda ni manda
cookies `Secure` sobre HTTP plano**. Si probas `next start` en localhost con
`curl -c/-b`, el ingreso va a parecer roto: el login devuelve 303 con su
`set-cookie`, pero el pedido siguiente a `/admin` vuelve a redirigir.

No es un problema de la aplicacion. Los navegadores tratan `http://localhost`
como contexto seguro, asi que desde el navegador funciona bien. Para probarlo
con curl, mandale la cookie a mano:

```bash
TOKEN=$(curl -s -o /dev/null -D - -X POST localhost:3000/api/admin/ingresar   --data-urlencode "clave=LACLAVE" --data-urlencode "destino=/admin"   | sed -n 's/.*dl_admin=\([a-f0-9]*\).*//p')
curl -s -o /dev/null -w '%{http_code}
' -H "Cookie: dl_admin=$TOKEN" localhost:3000/admin
```

En `npm run dev` no pasa: ahi la cookie va sin `Secure`.

## Lo que esta proteccion no es

Es una cerradura para que un cliente curioso no llegue al panel de impresion,
no un sistema de seguridad contra un atacante decidido. En concreto:

- No hay limite de intentos: alguien podria probar claves por fuerza bruta.
  Mitigacion practica: usar una clave larga. Si alguna vez hace falta, el lugar
  para poner el limite es el middleware.
- No hay registro de quien entro ni cuando, porque la clave es compartida.
- Si la clave se filtra, lo unico que se expone es la impresion de tickets: no
  hay forma de modificar la planilla desde la aplicacion.
