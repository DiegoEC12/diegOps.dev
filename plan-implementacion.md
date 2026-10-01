# 📖 Blueprint Técnico: Portfolio Manga Lo-Fi & Panel Admin Dinámico
**Desarrollador:** Diego Yeferson EC  
**Perfil:** Técnico en Desarrollo de Sistemas e Información & Estudiante de Ingeniería de Software (UTP - 1er ciclo)  
**Estilo Visual:** Manga Lo-Fi Chill / Tinta & Grafito / Blueprint Técnico  

---

## 1. Principios de Diseño & Coherencia Estética
- **Hero Section:** Se mantiene 100% intacto según la configuración resuelta.
- **Paleta cromática:** 
  - Fondo papel / lienzo: `oklch(0.96 0.01 75)` / `oklch(0.18 0.02 260)`
  - Tinta negra y grafito: `oklch(0.12 0.01 260)`
  - Acento cobre envejecido: `oklch(0.65 0.12 45)`
  - Pantalla / terminal SQL: fondo noche con rejilla milimétrica tenue.
- **Técnicas manga:** Tramas de achurado (*screentones* mecánicos), bordes de viñeta entintados con sombras desplazadas duras (`box-shadow: 3px 3px 0px var(--ink)`), marcas de corte de imprenta (*crop marks*) y sellos tradicionales (*Hankō*).
- **Enfoque técnico:** Sustitución de elementos genéricos por metáforas de ingeniería de software (consola de queries SQL, expedientes tabulados, blueprints de arquitectura).

---

## 2. Script SQL Completo (Supabase Local / Lovable Cloud)

Ejecuta este script en el editor SQL de tu Supabase local para crear la estructura completa con RLS, permisos PostgREST y datos semilla.

```sql
-- =============================================================================
-- PORTFOLIO MANGA LO-FI: ESQUEMA DE BASE DE DATOS COMPLETO
-- =============================================================================

-- 1. TABLA: CONFIGURACIÓN GENERAL DEL SITIO
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'general_config',
  brand_initials TEXT NOT NULL DEFAULT 'DY',
  brand_name TEXT NOT NULL DEFAULT 'Diego Yeferson EC',
  hero_title TEXT NOT NULL DEFAULT 'Diego Yeferson EC',
  hero_role TEXT NOT NULL DEFAULT 'Técnico en desarrollo de sistemas e información',
  hero_copy TEXT NOT NULL DEFAULT 'Construyo soluciones digitales útiles, mantenibles y bien pensadas. Actualmente curso Ingeniería de Software en la UTP.',
  availability_status TEXT NOT NULL DEFAULT 'Disponible para nuevos retos y proyectos',
  email_contact TEXT DEFAULT 'tu-correo@ejemplo.com',
  github_url TEXT DEFAULT 'https://github.com/',
  linkedin_url TEXT DEFAULT 'https://linkedin.com/',
  location TEXT DEFAULT 'Lima, Perú',
  logo_url TEXT,
  logo_fit TEXT NOT NULL DEFAULT 'contain',
  logo_position TEXT NOT NULL DEFAULT '50% 50%',
  footer_tagline TEXT DEFAULT 'Diseñado entre café, código y lluvia.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. AJUSTES EN TABLA PROYECTOS (COLUMNAS DE ENCUADRE DINÁMICO)
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS image_fit TEXT NOT NULL DEFAULT 'cover',
  ADD COLUMN IF NOT EXISTS image_position TEXT NOT NULL DEFAULT '50% 50%';

-- 3. TABLA: EXPEDIENTE / TRAYECTORIA ACADÉMICA Y LABORAL
CREATE TABLE IF NOT EXISTS public.timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('education', 'experience')),
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completado',
  description TEXT NOT NULL,
  skills_learned TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLA: CERTIFICACIONES & CREDENCIALES
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  credential_url TEXT,
  credential_id TEXT,
  hours INTEGER,
  badge_url TEXT,
  image_fit TEXT NOT NULL DEFAULT 'contain',
  image_position TEXT NOT NULL DEFAULT '50% 50%',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABLA: COLA DE MÚSICA LO-FI
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'Lo-Fi Records',
  audio_url TEXT NOT NULL,
  duration TEXT DEFAULT '2:30',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TABLA: CONSOLA SQL & FAQ (PREGUNTAS FRECUENTES INTERACTIVAS)
CREATE TABLE IF NOT EXISTS public.faq_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_label TEXT NOT NULL,
  sql_command TEXT NOT NULL,
  result_columns TEXT[] NOT NULL DEFAULT '{}',
  result_rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TABLA: BANDEJA DE MENSAJES DE CONTACTO
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- PERMISOS DE ACCESO (GRANTS POSTGREST)
-- =============================================================================
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.timeline_entries TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_entries TO authenticated;
GRANT ALL ON public.timeline_entries TO service_role;

GRANT SELECT ON public.certifications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;

GRANT SELECT ON public.music_tracks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music_tracks TO authenticated;
GRANT ALL ON public.music_tracks TO service_role;

GRANT SELECT ON public.faq_queries TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq_queries TO authenticated;
GRANT ALL ON public.faq_queries TO service_role;

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- =============================================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Public can view site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view timeline" ON public.timeline_entries FOR SELECT USING (true);
CREATE POLICY "Public can view certifications" ON public.certifications FOR SELECT USING (published = true);
CREATE POLICY "Public can view active music tracks" ON public.music_tracks FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view faq queries" ON public.faq_queries FOR SELECT USING (true);
CREATE POLICY "Public can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Políticas de gestión para Administrador (usa la función has_role existente)
CREATE POLICY "Admin manage site_settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage timeline" ON public.timeline_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage certifications" ON public.certifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage music" ON public.music_tracks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage faq" ON public.faq_queries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage contact messages" ON public.contact_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================================================
-- DATOS SEMILLA (SEEDS)
-- =============================================================================
INSERT INTO public.site_settings (id, brand_initials, brand_name, hero_role, availability_status)
VALUES ('general_config', 'DY', 'Diego Yeferson EC', 'Técnico en desarrollo de sistemas e información', 'Disponible para nuevos retos y proyectos')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.timeline_entries (kind, title, institution, period, status, description, skills_learned, sort_order)
VALUES 
('education', 'Ingeniería de Software', 'Universidad Tecnológica del Perú (UTP)', '2026 - Presente', 'En curso (1er ciclo)', 'Formación profesional orientada a arquitectura de software, algoritmia y sistemas de misión crítica.', ARRAY['Arquitectura', 'Estructuras de Datos', 'POO'], 1),
('education', 'Técnico en Desarrollo de Sistemas e Información', 'Instituto de Educación Superior', '2023 - 2025', 'Titulado / Egresado', 'Especialización práctica en modelado de datos relacionales, desarrollo web fullstack y administración de redes.', ARRAY['PHP', 'MySQL', 'PostgreSQL', 'JavaScript', 'Docker'], 2);

INSERT INTO public.faq_queries (question_label, sql_command, result_columns, result_rows, sort_order)
VALUES 
('Disponibilidad laboral', 'SELECT modalidad, jornada, disponibilidad_inmediata FROM candidato_perfil;', ARRAY['modalidad', 'jornada', 'disponibilidad_inmediata'], '[{"modalidad": "Remoto / Híbrido", "jornada": "Tiempo Completo / Prácticas", "disponibilidad_inmediata": "Sí"}]'::jsonb, 1),
('Ventaja de contratar a un técnico en ingeniería', 'SELECT formacion_tecnica, enfoque_universitario, valor_agregado FROM perfil_tecnico;', ARRAY['formacion_tecnica', 'enfoque_universitario', 'valor_agregado'], '[{"formacion_tecnica": "Experiencia práctica directa en bases de datos y backend", "enfoque_universitario": "Base sólida en algoritmia y buenas prácticas", "valor_agregado": "Rápida curva de aprendizaje y productividad desde el primer día"}]'::jsonb, 2),
('Bases de datos que domino', 'SELECT motor, tipo, experiencia FROM stack_databases ORDER BY nivel DESC;', ARRAY['motor', 'tipo', 'experiencia'], '[{"motor": "PostgreSQL", "tipo": "Relacional / ACID", "experiencia": "Avanzado"}, {"motor": "MySQL / MariaDB", "tipo": "Relacional", "experiencia": "Avanzado"}, {"motor": "SQL Server", "tipo": "Relacional / T-SQL", "experiencia": "Intermedio"}]'::jsonb, 3);

### 3. Especificación del Encuadre por Arrastre (`ImageDragFramer`)

**Lógica de Interacción:**

1. El usuario pega una URL de imagen en el formulario del panel `/admin`.

2. El visor muestra un marco con las proporciones exactas del contenedor (`aspect-video` 16:9 para proyectos, `aspect-[4/3]` para certificados, `aspect-square` 1:1 para logo).

3. **Mecánica Drag-to-Pan:**

   - Al presionar con el ratón (`onMouseDown`) o el dedo (`onTouchStart`), se captura la posición inicial.
   
   - Al mover el cursor (`cursor: grab` $\rightarrow$ `cursor: grabbing`), la imagen se desplaza visualmente dentro del marco delimitador.
   
   - Al soltar (`onMouseUp`), se calcula automáticamente el desplazamiento porcentual:
     $$\text{Posición X} = \text{Clamp}\left(\frac{\Delta X}{\text{Ancho Contenedor}} \times 100, 0\%, 100\%\right)$$
     $$\text{Posición Y} = \text{Clamp}\left(\frac{\Delta Y}{\text{Alto Contenedor}} \times 100, 0\%, 100\%\right)$$
   
   - Se almacena como string CSS: `"X% Y%"` (ej. `"42% 68%"`).

4. **Selector `object-fit`:** Permite alternar con un botón estilizado entre `cover` (llenar marco) y `contain` (ver completo sin recorte).

5. **Estética del visor:** Diseñado como una mesa de corte de imprenta manga: marcas de registro en las 4 esquinas, rejilla de tercios en líneas tenues de tinta y botón *"Centrar encuadre"*.

4. Estructura de Componentes Frontend


src/
├── components/
│   └── portfolio/
│       ├── PortfolioPage.tsx            # Orquestador público
│       ├── TechnicalTimeline.tsx        # Expediente: Título técnico + Ingeniería UTP
│       ├── CertificationsSection.tsx    # Tarjetas técnicas de certificados
│       ├── SqlConsoleFaq.tsx            # Consola SQL interactiva click-to-run
│       ├── MangaContactForm.tsx         # Hoja de papel manuscrito + copy directo
│       ├── StudioFooter.tsx             # Footer ampliado con telemetría y sello Hankō
│       ├── LofiCassettePlayer.tsx       # Widget cassette con lista de reproducción activa
│       ├── AdminPage.tsx                # Panel /admin modular por pestañas
│       └── ImageDragFramer.tsx          # Componente reutilizable de recorte/arrastre




5. Detalle de Módulos & Experiencia de Usuario

A. Consola SQL & FAQ (SqlConsoleFaq.tsx)

Sustituye la terminal de comandos vacía por una interfaz intuitiva para reclutadores.

Header: Simula una consola de gestión de base de datos con pestañas de consulta (faq_consultas.sql).

Botones de consulta rápida:

[Ejecutar: Disponibilidad] -> Genera SELECT modalidad, jornada FROM perfil;

[Ejecutar: Experiencia BD] -> Genera SELECT motor, nivel FROM stack_bd;

[Ejecutar: Enfoque Profesional] -> Genera SELECT ventaja_competitiva FROM bio;


Área de salida: Cuadrícula de datos estilo terminal SQL con líneas de división claras y tipografía monoespaciada limpia.

B. Expediente Técnico (TechnicalTimeline.tsx)

Viñeta editorial manga con línea guía vertical entintada.

Hito 1 (En curso): Ingeniería de Software - Universidad Tecnológica del Perú (1er ciclo). Badge de estado animado suave.

Hito 2 (Concluido): Técnico en Desarrollo de Sistemas e Información. Etiqueta destacada de "Titulado / Egresado" con lista de competencias clave.

C. Certificaciones (CertificationsSection.tsx)

Tarjetas con estética de credencial técnica.

Muestra institución emisora, fecha, cantidad de horas académicas y botón con enlace oficial de verificación.

Aplica el encuadre exacto guardado mediante image_fit e image_position.

D. Hoja de Contacto Manuscrita (MangaContactForm.tsx)

Aspecto de hoja de borrador de mangaka con marco de dibujo y textura de papel blanco hueso.

Formulario directo con campos: Nombre, Correo, Asunto y Mensaje.

Envía a la tabla contact_messages.

Botones de acción rápida: Copiar correo, enlace a GitHub y LinkedIn.

E. Footer de Estudio Manga (StudioFooter.tsx)

Bloque expandido con 3 zonas:

Autor & Sello: Siglas DY, nombre y sello Hankō rojo tradicional estilizado.

Índice de navegación: Enlaces a Proyectos, Blueprint, Expediente, SQL FAQ y Contacto.

Telemetría: Indicador en vivo de estado del sistema (● Operativo · Lima, Perú) y enlace para volver al inicio.


F. Reproductor Cassette Multi-Pista (LofiCassettePlayer.tsx)


Lee de la tabla music_tracks.

Controles: Play / Pause, Pista Anterior, Pista Siguiente, Barra de volumen y Mute.

La pantalla LCD del cassette muestra el título y artista de la pista actual con ecualizador animado.

G. Panel de Administración /admin (Pestañas)


⚙️ General: Logo (con encuadre por arrastre), siglas, titular, enlaces de redes sociales, correo y disponibilidad.
📁 Proyectos: Catálogo actual + selector de encuadre por arrastre en cada imagen de proyecto.
🎓 Expediente: Crear y ordenar hitos de formación y experiencia.
📜 Certificaciones: Añadir credenciales, horas, links y encuadre de imagen.
🎵 Música: Agregar archivos MP3 / enlaces de streaming, definir orden y activar/desactivar pistas.
❓ Consultas FAQ: Gestionar las preguntas y respuestas que aparecen en la consola SQL.
📬 Mensajes: Bandeja de lectura para los mensajes enviados desde la web.


6. Hoja de Ruta de Implementación

Paso 1: Ejecutar migración SQL en Supabase para registrar las tablas y políticas RLS.

Paso 2: Crear el componente ImageDragFramer.tsx para encuadre interactivo.

Paso 3: Reestructurar /admin con el sistema de pestañas y formularios para todas las entidades.

Paso 4: Implementar la Consola SQL & FAQ (SqlConsoleFaq.tsx) en la página principal.

Paso 5: Crear la sección de Expediente & Certificaciones dinámicas.

Paso 6: Implementar la Hoja de Contacto Manuscrita y el Footer de Estudio Manga.

Paso 7: Conectar la lista de reproducción de la base de datos con el Cassette Player.