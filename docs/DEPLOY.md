# Deploy

## Antes que nada: rotar la API key

La API key de Google Sheets estaba **hardcodeada** en el codigo .NET viejo
(`CarController.cs`) y ese codigo esta en un repositorio publico. Hay que darla
por comprometida.

1. Entrar a [Google Cloud Console > Credenciales](https://console.cloud.google.com/apis/credentials).
2. **Borrar** la key vieja (`AIzaSyCl4...`).
3. Crear una nueva y restringirla:
   - **Restricciones de API**: solo `Google Sheets API`.
   - **Restricciones de aplicacion**: si el deploy tiene IP fija, por IP.
     Vercel no la tiene, asi que ahi queda sin restringir por origen y la
     restriccion de API es la que cuenta.
4. Cargarla en Vercel como `GOOGLE_SHEETS_API_KEY`.

Nunca vuelvas a poner la key en el codigo: va siempre por variable de entorno.

## Vercel

### Primera vez

1. En [vercel.com/new](https://vercel.com/new), importar el repo
   `leandromasotti/cartraking`.
2. Framework: **Next.js** (se detecta solo). No hay que tocar los comandos de
   build.
3. Cargar las variables de entorno (ver mas abajo).
4. Deploy.

### Variables de entorno

En **Settings > Environment Variables**, para Production, Preview y Development:

| Variable | Obligatoria | Valor |
| --- | --- | --- |
| `GOOGLE_SHEETS_API_KEY` | **si** | la key nueva |
| `GOOGLE_SHEET_ID` | no | por defecto usa la planilla actual |
| `GOOGLE_SHEET_RANGE` | no | por defecto `Respuestas de formulario 5!A:J` |
| `SHEET_CACHE_TTL_SECONDS` | no | por defecto `300` |
| `NEXT_PUBLIC_SITE_URL` | recomendada | la URL publica final |

`NEXT_PUBLIC_SITE_URL` es la que define **que URL codifica el QR**. Si la
dejas vacia, se deduce de `VERCEL_PROJECT_PRODUCTION_URL`, que funciona pero te
ata al dominio `.vercel.app`. Conviene ponerla explicita apenas tengas dominio
propio.

### Ramas

- `main` -> produccion
- `dev` -> preview automatico en cada push

## Dominio propio

Los QR impresos son papel: **la URL que llevan no se puede cambiar despues**.
Por eso conviene definir el dominio definitivo *antes* de empezar a imprimir
tickets en volumen.

1. Agregar el dominio en **Settings > Domains** de Vercel.
2. Apuntar el DNS como indique Vercel.
3. Actualizar `NEXT_PUBLIC_SITE_URL` al dominio nuevo.
4. Redeploy (la variable se aplica en build).

Si alguna vez migras de dominio, **deja el anterior redirigiendo** a
`/patente/:patente`. Los tickets viejos tienen que seguir funcionando.

## Desarrollo local

```bash
cp .env.example .env.local     # y completar GOOGLE_SHEETS_API_KEY
npm install
npm run dev                    # http://localhost:3000
```

Para probar la impresion en local, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
hace que el QR apunte a la maquina local. Desde el celular no lo vas a poder
abrir salvo que uses la IP de la red (`http://192.168.x.x:3000`).

## Antes de cada deploy

```bash
npm test && npm run typecheck && npm run lint && npm run build
```

## Que mirar cuando algo falla

**Error 403 de Google.** La API key esta mal, vencida, o no tiene habilitada la
Sheets API. Revisa tambien que la planilla siga compartida como "cualquiera con
el enlace puede ver".

**Error 400 de Google.** El nombre de la hoja en `GOOGLE_SHEET_RANGE` no
coincide. Si alguien renombra la pestana `Respuestas de formulario 5`, se rompe.

**Los servicios nuevos no aparecen.** Es el ISR: hasta 5 minutos de demora. Si
pasan mas, mira los logs de la funcion en Vercel.

**El QR lleva a la URL equivocada.** `NEXT_PUBLIC_SITE_URL` quedo con un valor
viejo. Es una variable `NEXT_PUBLIC_`, asi que se congela en el build: no
alcanza con cambiarla, hay que redeployar.
