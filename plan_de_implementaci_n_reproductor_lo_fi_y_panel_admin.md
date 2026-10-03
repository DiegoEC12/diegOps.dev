# 🎵 Plan de Implementación: Módulo de Música & Ambiente en Panel Admin y Reproductor Lo-Fi

---

## 1. 🎯 Visión General & Objetivos

* **Soporte Dual Híbrido**: Permitir tanto la subida directa de archivos `.mp3` (almacenados en Supabase Storage con control de ecualizador nativo por Web Audio API) como la incorporación de enlaces de YouTube (mediante YouTube IFrame API).
* **Mesa de Trabajo en `/admin`**: Interfaz intuitiva con selector de tipo de origen, autocompletado de metadatos (duración del MP3 o miniatura/título de YouTube) y previsualización interactiva tipo Cassette con prueba de audio en tiempo real antes de guardar.
* **Coherencia Visual**: Conservar al 100% la estética manga lo-fi (marcas de imprenta, líneas de tinta, pantalla LCD retro, microanimaciones de ecualizador).

---

## 2. 🗄️ Base de Datos y Supabase Storage

### 2.1 Bucket de Almacenamiento en Supabase

Creación del bucket público `music` y sus políticas de seguridad (RLS):

```sql
-- 1. Crear el bucket 'music' para los archivos de audio
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'music', 
  'music', 
  true, 
  15728640, -- Límite de 15 MB por pista
  array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
)
on conflict (id) do nothing;

-- 2. Permitir lectura pública de las pistas
create policy "Lectura pública de archivos de música"
on storage.objects for select
using (bucket_id = 'music');

-- 3. Solo usuarios administradores pueden subir pistas
create policy "Solo admin puede subir música"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'music' 
  and public.has_role(auth.uid(), 'admin')
);

-- 4. Solo usuarios administradores pueden borrar pistas
create policy "Solo admin puede borrar música"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'music' 
  and public.has_role(auth.uid(), 'admin')
);
```

### 2.2 Tabla `music_tracks`

Estructura relacional con validaciones y Row Level Security (RLS):

```sql
create table if not exists public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null default 'Lo-Fi Artist',
  source_type text not null check (source_type in ('upload', 'direct_url', 'youtube')),
  audio_url text,               -- URL pública de Supabase Storage o enlace directo .mp3
  youtube_id text,              -- Identificador de YouTube (ej. 5qap5aO4i9A)
  duration_seconds integer,     -- Duración en segundos (ej. 214 para 03:34)
  is_active boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Permisos PostgREST
grant select on public.music_tracks to anon, authenticated;
grant all on public.music_tracks to service_role;
grant insert, update, delete on public.music_tracks to authenticated;

-- Row Level Security (RLS)
alter table public.music_tracks enable row level security;

create policy "Pistas públicas visibles para visitantes"
on public.music_tracks for select
using (is_active = true or public.has_role(auth.uid(), 'admin'));

create policy "Administradores gestionan pistas"
on public.music_tracks for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));
```

---

## 3. 🎛️ Flujo en el Panel de Administración (`/admin` → Pestaña Música)

### 3.1 Estructura Visual de la Pestaña

Dos columnas asimétricas con estética de mesa de trabajo de ingeniería de audio:

* **Columna Izquierda (60%)**: Formulario de Ingesta Inteligente.
* **Columna Derecha (40%)**: Live Cassette Preview & Tester.
* **Sección Inferior**: Tabla de Cola de Reproducción (Playlist Management).

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│  MESA DE TRABAJO: BANDA SONORA & AMBIENTE LO-FI                                │
├────────────────────────────────────────┬───────────────────────────────────────┤
│  [1] INGESTA DE PISTA                  │  [2] LIVE CASSETTE PREVIEW            │
│                                        │                                       │
│  Modo de origen:                       │  ┌─────────────────────────────────┐ │
│  [ (•) Archivo MP3 ] [ ( ) YouTube ]   │  │ [TAPE: 60 MIN]     [● REC 44.1k]│ │
│                                        │  │ ┌─────────────────────────────┐ │ │
│  [ZONA MP3]                            │  │ │ >> Shinjuku Rain [3:42]     │ │ │
│  ┌──────────────────────────────────┐  │  │ └─────────────────────────────┘ │ │
│  │ Arrastra tu .mp3 aquí o examina  │  │  │   ( O )             ( O )       │ │
│  │ Límite: 15MB • MIME: audio/mpeg  │  │  │  Carrete L         Carrete R    │ │
│  └──────────────────────────────────┘  │  │  ||||||||||||||||||| [EQ TEST]  │ │
│  o [ZONA YOUTUBE]                      │  └─────────────────────────────────┘ │
│  URL: [ youtube.com/watch?v=...     ]  │  [ Botón: Probar Sonido (10s) ]     │
│                                        │  Fuente detectada: [MP3 NATIVO]       │
│  Metadatos:                            │                                       │
│  Título:  [ Shinjuku Rain           ]  │                                       │
│  Artista: [ Kupla                   ]  │                                       │
│  Orden:   [ 1 ]    [x] Pista Activa    │                                       │
│  [ BOTÓN: Guardar en Playlist ]        │                                       │
├────────────────────────────────────────┴───────────────────────────────────────┤
│  [3] COLA DE PISTAS REGISTRADAS (REORDENABLE)                                  │
│  #1 | [MP3] Shinjuku Rain - Kupla (03:42) | [x] Activo | [Test] [Editar] [X]  │
│  #2 | [YT]  Coffee & Code - Lofi Girl     | [x] Activo | [Test] [Editar] [X]  │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Lógica del Formulario de Ingesta

#### A. Detección y Extracción Automática

* **Caso MP3**:
  Al seleccionar el archivo con `input[type="file"]`, se instancia un objeto `Audio` temporal en el navegador para extraer metadatos sin subir aún el archivo:

  ```typescript
  const audioObj = new Audio(URL.createObjectURL(file));
  audioObj.onloadedmetadata = () => {
    setDurationSeconds(Math.round(audioObj.duration));
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
  };
  ```

  Al guardar, se ejecuta `supabase.storage.from('music').upload(...)`, se obtiene la `publicUrl` y se registra en la base de datos `music_tracks`.
* **Caso YouTube**:
  Uso de expresión regular para extraer el `youtube_id` tanto de URLs estándar como cortas (`youtu.be/` o `watch?v=`):

  ```typescript
  const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(ytRegex);
  const videoId = match ? match[1] : null;
  ```

  Si es válido, se autogenera la miniatura previa (`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`) y se marca el origen como `youtube`.

#### B. Previsualización Interactiva (Live Preview)

* Refleja instantáneamente los cambios en el título, artista y tipo de fuente.
* **Botón "Probar Audio"**:
  * **Si es MP3**: Ejecuta un `play()` de prueba directo con un límite automático de 10 segundos para verificar volumen y ecualización.
  * **Si es YouTube**: Monta un contenedor iframe oculto que reproduce 5 segundos para verificar que el video no tenga restricciones de inserción (*"Embedding disabled by request"*).

#### C. Gestión de la Lista

* Reordenamiento dinámico mediante `sort_order`.
* Alternador rápido de visibilidad pública (`is_active`).
* **Borrado seguro**: Si la pista eliminada era un archivo subido (`upload`), borra primero el archivo físico en `storage.objects` antes de eliminar el registro en la tabla `music_tracks`.

---

## 4. 📻 Arquitectura del Reproductor Público (`LofiCassettePlayer.tsx`)

### 4.1 Motor Híbrido de Reproducción

Un controlador unificado que abstrae la fuente para que la experiencia del usuario sea transparente, sin importar si la canción proviene de un MP3 o de un video de YouTube:

```text
                  ┌───────────────────────────────┐
                  │    LofiCassettePlayer State   │
                  │ (currentTrack, isPlaying, vol)│
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [Pista tipo 'upload']            [Pista tipo 'youtube']
                 │                               │
                 ▼                               ▼
         <audio> Nativo                YouTube IFrame API
      • Web Audio Analyser           • Iframe invisible (1x1 px)
      • Ecualizador real             • Ecualizador sincronizado
      • Cero latencia                • Control por postMessage
```

### 4.2 Especificaciones del Reproductor

* **Comportamiento Inicial**:
  Inicia siempre silenciado (`isMuted: true` o `volume: 0`) para cumplir estrictamente con las políticas de *autoplay* de los navegadores modernos y no interrumpir abruptamente la navegación del usuario. Carga la lista activa desde `public.music_tracks` ordenada por `sort_order asc`.
* **Ciclo de Reproducción Continuo**:
  Al terminar una pista (`audio.onended` o `YT.PlayerState.ENDED`), avanza automáticamente al siguiente índice:

  ```typescript
  const nextIndex = (currentIndex + 1) % playlist.length;
  setCurrentIndex(nextIndex);
  ```
* **Controles Físicos del Cassette**:

  * Botón Play / Pausa.
  * Botón Pista Anterior / Pista Siguiente.
  * Deslizador de volumen (0% a 100%).
  * Selector de lista (Queue modal / popover estilo libreta técnica manga).

---

## 5. 🚀 Hoja de Ruta de Implementación

| Paso             | Módulo                              | Descripción / Entregables                                                                                                                                                                                                                                                         |
| :--------------- | :----------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Paso 1** | **Supabase Backend & Storage** | • Crear el bucket`music` con políticas de lectura pública y escritura solo para el rol `admin`.• Crear la tabla `public.music_tracks` con sus respectivas políticas RLS.                                                                                                |
| **Paso 2** | **Servicio Frontend de Audio** | • Crear el módulo`musicService.ts` con funciones clave:  - `uploadTrackAudio()`  - `deleteTrackAudio()`  - `extractYoutubeId()`  - `getPlaylist()`                                                                                                                     |
| **Paso 3** | **Panel Admin (`/admin`)**   | • Desarrollar el formulario dual (MP3 / YouTube) con la vista`LiveCassettePreview`.• Implementar la lógica de subida con barra de progreso.• Crear la lista administrable con edición rápida y eliminación física de archivos.                                           |
| **Paso 4** | **Reproductor Público**       | • Actualizar`LofiCassettePlayer.tsx` para consumir datos de Supabase.• Integrar condicionalmente el SDK del YouTube Player para pistas remotas.• Sincronizar las animaciones CSS/SVG (carretes giratorios y barras del ecualizador estilo manga) con el estado de audio real. |
