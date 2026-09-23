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

## Lo que esta proteccion no es

Es una cerradura para que un cliente curioso no llegue al panel de impresion,
no un sistema de seguridad contra un atacante decidido. En concreto:

- No hay limite de intentos: alguien podria probar claves por fuerza bruta.
  Mitigacion practica: usar una clave larga. Si alguna vez hace falta, el lugar
  para poner el limite es el middleware.
- No hay registro de quien entro ni cuando, porque la clave es compartida.
- Si la clave se filtra, lo unico que se expone es la impresion de tickets: no
  hay forma de modificar la planilla desde la aplicacion.
