# Portfolio Diego Yeferson EC

Portfolio personal profesional con estética manga lo-fi, enfoque técnico y panel de administración conectado a Supabase.

## Estado actual

El proyecto ya quedó funcional en estructura, contenido dinámico y administración:

- vista pública conectada a Supabase
- panel /admin con gestión de contenido real
- migraciones SQL enumeradas para la base de datos
- música lo-fi cargada desde Supabase Storage con URL pública
- reproductor del cassette funcionando con pistas activas desde la base
- build verificado en producción con Vite

### Checklist de progreso
- [x] Diagnóstico del stack y estructura del proyecto.
- [x] Orden de migraciones SQL por ejecución.
- [x] Migración 0003: esquema base del portfolio.
- [x] Migración 0004: permisos y RLS para admin y lectura pública.
- [x] Migración 0005: seed inicial de contenido.
- [x] Migración 0006: columnas de música y ajuste del flujo de origen multimedia.
- [x] Sincronización del esquema en drizzle/schema.ts.
- [x] Conexión de la vista pública a Supabase con contenido real.
- [x] Panel /admin con gestión completa de contenido y secciones.
- [x] Ajuste de logo, hero, timeline, certificaciones, FAQ y mensajes de contacto.
- [x] Reproductor lo-fi conectado a la base de datos.
- [x] Flujo de audio con upload a Supabase Storage y URL pública.
- [x] Validación del build con `npm run build`.

## Orden de migraciones

1. 0003_portfolio_manga_lofi_schema.sql
   - crea el esquema base del portfolio, timeline, certificaciones, música, FAQ y mensajes.
2. 0004_portfolio_manga_lofi_security.sql
   - habilita RLS y permisos de administración.
3. 0005_portfolio_manga_lofi_seed.sql
   - inserta el contenido semilla inicial del sitio.
4. 0006_music_source_columns.sql
   - agrega columnas de soporte para tipo de origen de audio, YouTube y duración.

## Base de datos y almacenamiento

La app usa PostgreSQL en Supabase como fuente principal de contenido y un bucket llamado music para archivos de audio.

El flujo correcto es:

- el admin sube el archivo MP3/WAV
- el archivo se guarda en Supabase Storage
- la base de datos guarda la URL pública del archivo
- el reproductor y la vista de edición leen esa URL desde music_tracks

Esto evita guardar un blob del navegador como referencia permanente.

## Stack principal

- Frontend: React + TypeScript + Vite
- Router: TanStack Router
- UI: Tailwind + shadcn/ui
- Base de datos: PostgreSQL + Supabase
- ORM y migraciones: Drizzle
- Estilo: manga lo-fi / blueprint técnico / tinta y grafito

## Estructura relevante

- src/components/portfolio/AdminPage.tsx
- src/components/portfolio/PortfolioPage.tsx
- src/components/portfolio/LofiCassettePlayer.tsx
- src/integrations/supabase/client.ts
- src/integrations/supabase/types.ts
- drizzle/schema.ts
- drizzle/migrations/

## Comandos

```bash
npm install
npm run dev
npm run build
```

## Documentación del plan

- [plan-implementacion.md](plan-implementacion.md)
- [AVANCES_IMPLEMENTACION.md](AVANCES_IMPLEMENTACION.md)

This project was built with [Lovable](https://lovable.dev).

## Development

```bash
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
