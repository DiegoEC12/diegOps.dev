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

## Mejoras UI/UX responsive

- El reproductor cassette se inicia minimizado en todos los tamaños, queda alineado a la derecha y conserva la reproducción al expandirse/minimizarse.
- El reproductor expandido ajusta ancho, controles y texto a móviles para evitar desbordamientos.
- La navegación del admin usa un menú hamburguesa superpuesto en tabletas y móviles.
- Ver [AVANCES_IMPLEMENTACION.md](AVANCES_IMPLEMENTACION.md) para el detalle del trabajo.

### Navegación del admin en pantallas compactas

En tablets y móviles, el panel usa una barra superior compacta con menú hamburguesa y navegación vertical desplegable. El menú incluye las secciones, acceso al portfolio y cierre de sesión; se cierra al seleccionar una sección.

- En el admin responsive, el menú hamburguesa se despliega como panel superpuesto y no desplaza los módulos. Los formularios, encuadres de imágenes, vistas previas y cassette se adaptan a móvil y tablet.
- Las vistas de audio limitan los controles, muestran un enlace corto al archivo guardado y no dejan que URLs largas deformen el formulario.
- El footer y las vistas previas usan el logotipo configurado en lugar de siglas; el formulario admin ya no edita iniciales.
- El cassette flotante inicia minimizado a la derecha en cualquier viewport, con controles explícitos para expandir y minimizar.

- El reproductor no genera audio de respaldo: sin una pista activa no reproduce sonido. Los enlaces YouTube se reproducen dentro del cassette mediante el reproductor incrustado; YouTube no expone una URL pública independiente de solo audio.

- El reproductor conserva la posición al pausar/reanudar, permite reiniciar al tocar el título y avanza a la siguiente pista al terminar. Al cargar se intenta iniciar la primera pista; el navegador puede exigir interacción para habilitar autoplay con sonido.

- El orden de música se asigna automáticamente al final de la cola; las flechas de la lista permiten mover pistas arriba o abajo. Al ingresar un enlace de YouTube se completa el título y canal automáticamente cuando YouTube ofrece esos metadatos.
- El player YouTube ahora mantiene un iframe estable con el origen configurado para evitar errores al cambiar de pista.

- El iframe de YouTube permanece montado tanto en el cassette expandido como en el minimizado; el estado visual solo cambia a reproduciendo cuando el reproductor lo confirma. Esto permite reintentar manualmente si el navegador bloquea autoplay.

- Si la pista activa viene de YouTube, el iframe sigue montado pero queda fuera de la pantalla mientras el cassette está minimizado; al expandirlo se muestra el reproductor. El primer toque, clic o tecla fuera del widget vuelve a intentar reproducir si el navegador bloqueó el inicio automático.
- El reproductor usa YouTube IFrame API para controlar pausa, reanudación, fin de pista y cola. YouTube no permite garantizar autoplay con sonido; el scroll no cuenta de forma fiable como gesto de activación.
