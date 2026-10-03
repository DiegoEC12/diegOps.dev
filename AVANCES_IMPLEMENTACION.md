# Avances de implementación — Portfolio Manga Lo-Fi

## Estado general

El proyecto ya quedó en una etapa funcional estable: contenido dinámico conectado a Supabase, panel de administración operativo y flujo de audio de música validado con Storage público.

## Checklist actual

### Base de datos y migraciones
- [x] Revisión del esquema actual.
- [x] Migración 0003 creada y aplicada.
- [x] Migración 0004 creada y aplicada.
- [x] Migración 0005 creada y aplicada.
- [x] Migración 0006 creada para soportar música con origen upload/direct_url/youtube.
- [x] `drizzle/schema.ts` sincronizado con el esquema real.
- [x] Tipado de Supabase actualizado.

### UI pública y admin
- [x] Vista pública conectada a Supabase.
- [x] Admin con gestión de contenido general, proyectos, timeline, certificaciones, música, FAQ y mensajes.
- [x] Preview visual y formularios con edición real.
- [x] Reproductor lo-fi funcionando desde la base de datos.

### Música / almacenamiento
- [x] Subida a Supabase Storage desde el admin.
- [x] Validación del bucket `music` antes de guardar.
- [x] Guardado de URL pública en `music_tracks`.
- [x] Normalización de URLs para evitar `blob:` y rutas duplicadas.
- [x] Control de duplicados con nombre único por archivo.
- [x] Reproducción de pistas desde la URL pública en el player.

### Verificación técnica
- [x] Build verificado con `npm run build`.

## Cambios recientes relevantes

- Corrección del flujo de música para no persistir URLs temporales del navegador.
- Ajuste del bucket y validación previa a la subida.
- Prevención de rutas duplicadas `.mp3.mp3` y nombres repetidos en Storage.
- Mejora del feedback del admin con mensajes de éxito/error.
- Revisión del player para ignorar pistas no válidas y leer desde la base de datos.

## Archivos clave

- src/components/portfolio/AdminPage.tsx
- src/components/portfolio/PortfolioPage.tsx
- src/components/portfolio/LofiCassettePlayer.tsx
- src/integrations/supabase/client.ts
- src/integrations/supabase/types.ts
- drizzle/migrations/

## Estado actual del proyecto

La implementación principal quedó entregada como una base funcional para portfolio + admin + reproducción lo-fi desde Supabase. La siguiente etapa recomendada es refinamiento de contenido editorial, ajustes finos de UX y preparación para despliegue final.

### UI/UX responsive (03-10-2026)
- [x] Detección de viewport móvil e inicio colapsado del reproductor cassette, manteniendo la reproducción al expandir o minimizar.
- [x] Botones accesibles para expandir y minimizar, con indicador visual de reproducción.
- [x] Ajuste del reproductor en móvil con selector actualizado, ancho fluido y controles compactos para evitar desbordamientos.
- [x] Navegación del admin en tabletas/móviles mediante pestañas horizontales desplazables, conservando todas las secciones y acciones.
- [x] Documentación de los cambios UI/UX en README.
- [x] Build de producción verificado con `node node_modules/vite/bin/vite.js build` (cliente, SSR y Nitro). `npm run build` sigue bloqueado por la instalación global de npm (npm-cli.js inexistente).
- [x] `git diff --check` sin errores de whitespace en los cambios.

### Navegación admin para tablets y móviles (03-10-2026)
- [x] Sustitución de pestañas horizontales por menú hamburguesa desplegable en pantallas de hasta 900px.
- [x] Barra compacta con identidad del panel y sección activa; destinos en lista vertical con áreas táctiles amplias.
- [x] Accesos a portfolio y cierre de sesión integrados en el menú, sin botón flotante en la cabecera.
- [x] El menú se cierra al seleccionar una sección.
- [x] Build de producción verificado con el ejecutable local de Vite; `npm run build` continúa afectado por la instalación global de npm.

### Pulido responsive de navegación y módulos admin (03-10-2026)
- [x] Menú compacto desplegable en capa superpuesta con fondo de cierre; no empuja el contenido al abrirse.
- [x] Composición fluida del módulo Contenido General y vista previa en tablet y móvil.
- [x] Reducción del encuadre cuadrado del logo y ajuste adaptable de controles de encuadre.
- [x] Formulario y preview del cassette ordenados en columna en pantallas compactas, con LCD adaptable.
- [x] Drawers, rejillas de formulario, acciones de guardado y checkboxes adaptados a móvil.
- [x] Build de producción verificado con el ejecutable local de Vite; `npm run build` continúa afectado por la instalación global de npm.

### Reproductor, editor de música e identidad de marca (03-10-2026)
- [x] Editor de música: inputs de archivo, reproductor de audio y URL larga se limitan al ancho de sus paneles; enlace guardado reemplaza el volcado de URL.
- [x] Preview del cassette compacto, con LCD adaptable en desktop, tablet y móvil.
- [x] Reproductor flotante inicia minimizado en todos los tamaños, alineado abajo a la derecha y con acciones explícitas de expandir/minimizar.
- [x] Footer y preview de marca muestran el logo configurado en lugar de iniciales.
- [x] Eliminado el campo de iniciales del admin y retiradas del tipo de cliente generado.
- [x] Reproductor flotante minimizado por defecto en todos los tamaños y alineado en la esquina inferior derecha.
- [x] Controles dedicados para expandir desde el badge y minimizar desde el panel expandido.
- [x] Build de producción verificado con el ejecutable local de Vite; `npm run build` continúa afectado por la instalación global de npm.

### Fuentes YouTube y URL directa en música (03-10-2026)
- [x] Normalización y validación de URLs/IDs de YouTube y guardado del ID limpio.
- [x] Preview embebido de YouTube antes de guardar.
- [x] Preview de audio nativo para URL directa y validación HTTP(S).
- [x] Player público reconoce pistas YouTube y las abre en YouTube, sin descartarlas por carecer de URL de archivo.
- [x] Compatibilidad con registros anteriores que almacenaron el enlace YouTube en `audio_url`.
- [x] Build de producción verificado con `node node_modules/vite/bin/vite.js build`.

### Reproducción sin audio de respaldo y YouTube incrustado (03-10-2026)
- [x] Quitado el sintetizador ambiental/fallback; sin pistas válidas, el reproductor queda silencioso y los controles se deshabilitan.
- [x] Errores de carga de pista ya no inician audio sintético.
- [x] YouTube se reproduce dentro del cassette mediante iframe incrustado y no navega a una pestaña externa.
- [x] El iframe se detiene al pausar o cambiar pista.
- [ ] YouTube no ofrece una URL pública de audio-only; el embed autorizado puede incluir video.

### Controles y cola del reproductor (03-10-2026)
- [x] Pausa/reanudación conserva la posición para archivos de audio y videos YouTube incrustados.
- [x] El título/artista del cassette reinicia la pista actual desde el inicio.
- [x] Al terminar una pista se intenta reproducir la siguiente en la cola.
- [x] Al cargar la lista activa se intenta iniciar la primera pista; autoplay queda sujeto al permiso del navegador.
- [x] Build de producción verificado con Vite local (cliente, SSR y Nitro).

### Cola y mantenimiento de pistas (03-10-2026)
- [x] Al agregar canciones, el orden se asigna automáticamente después de la última pista; se quitó el input manual de orden.
- [x] Flechas arriba/abajo en la lista del admin reordenan la cola y guardan la posición.
- [x] Autocompletado de título y autor/canal usando metadatos oEmbed públicos de YouTube.
- [x] Iframe existente controlado por React y origin explícito para corregir postMessage y el crash al avanzar.
- [x] Protección contra carrera entre pausa y evento de inicialización del reproductor YouTube.

### Inicialización de autoplay YouTube (03-10-2026)
- [x] El iframe permanece montado en modo compacto, pero se oculta fuera de la pantalla para evitar que la imagen del video aparezca debajo del cassette.
- [x] El botón refleja reproducción real cuando YouTube emite estado PLAYING, en vez de asumir éxito antes de la respuesta del navegador.
- [x] Autoplay bloqueado deja disponible el control Play para reintentar después de interacción.
- [x] El aviso WebGPU powerPreference identificado en consola no afecta el player y proviene del navegador/runtime externo.

### Autoplay por interacción (03-10-2026)
- [x] Si el navegador bloquea el autoplay inicial, el primer toque/clic fuera del widget o una tecla vuelve a intentar iniciar la pista activa.
- [x] Se mantiene YouTube IFrame API para reproducir, pausar, detectar el fin y avanzar la cola.
- [x] Se oculta el video en modo compacto sin desmontar el iframe; expandir el cassette vuelve a mostrarlo.
- [x] El cassette conserva sus controles compactos para expandir/minimizar y reproducir/pausar.
- [x] Build de producción verificado con Vite local.
- [ ] El autoplay audible sigue sujeto a la política del navegador y a los permisos de reproducción del video.
