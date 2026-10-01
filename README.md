# Portfolio Diego Yeferson EC

Portfolio personal profesional con enfoque visual manga lo-fi, estilo técnico y administrativo, orientado a mostrar proyectos, experiencia, credenciales y un panel privado para gestionar contenido.

## Estado actual del proyecto

Este repositorio ya avanzó en la base de datos y la estructura del proyecto siguiendo el plan técnico. El punto principal completado es la organización de la capa de datos en migraciones enumeradas, para que el esquema se ejecute en orden y quede listo para la siguiente fase de UI y admin.

### Checklist de progreso
- [x] Diagnóstico del proyecto y del stack actual.
- [x] Ordenación de migraciones SQL para la base de datos.
- [x] Migración 0003: schema principal del portfolio.
- [x] Migración 0004: permisos, RLS y seguridad de admin.
- [x] Migración 0005: seed inicial de contenido.
- [x] Sincronización del esquema en drizzle/schema.ts.
- [x] Conexión de la vista pública a Supabase con contenido real.
- [x] Panel /admin con pestañas para proyectos y contenido general.
- [x] Guardado de configuración general del sitio desde la base de datos.
- [ ] Componente de encuadre por arrastre (ImageDragFramer).
- [ ] Secciones de timeline, certificados, FAQ, contacto y footer.
- [ ] Reproductor lo-fi conectado a la base de datos.

## Orden de migraciones

La base de datos queda preparada con el siguiente orden de ejecución:

1. 0003_portfolio_manga_lofi_schema.sql — crea el esquema base del portfolio: ajustes de proyecto, configuración del sitio, timeline, certificaciones, música, FAQ y mensajes de contacto.
2. 0004_portfolio_manga_lofi_security.sql — habilita RLS, define permisos y políticas para lectura pública y gestión de admin, además de disparadores de timestamp.
3. 0005_portfolio_manga_lofi_seed.sql — inserta contenido inicial real del portfolio (proyectos publicados, configuración general y datos base del sitio).

### Qué hace cada migración

- 0003: prepara la estructura de datos del portfolio y sus módulos principales. Aquí se define casi todo el esquema de negocio del sitio.
- 0004: deja la capa segura para que la web pueda leer públicamente lo necesario y el panel admin gestione contenido con permisos restringidos.
- 0005: siembra el contenido inicial para que la UI pública no quede vacía, cargando proyectos, ajustes del sitio y datos base.

## Stack y enfoque

- Frontend: React + TypeScript + Vite
- Routing: TanStack Router
- UI: Tailwind + shadcn/ui
- Base de datos: PostgreSQL / Supabase
- ORM/migraciones: Drizzle
- Estética visual: Manga lo-fi / blueprint técnico / papel tinta grafito

## Fase actual recomendada

La implementación ya dejó conectada la base de datos con la vista pública y reforzó la administración principal. La siguiente fase del desarrollo debe centrarse en:

1. el componente de encuadre por arrastre,
2. la sección de timeline/certificados/FAQ,
3. el contacto, footer y reproductor lo-fi.

## Documentación del plan

La referencia técnica completa del proyecto sigue en [plan-implementacion.md](plan-implementacion.md), y el registro incremental de progreso está en [AVANCES_IMPLEMENTACION.md](AVANCES_IMPLEMENTACION.md).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/056f8dfd-5174-47d2-bbea-adfc728673ce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
