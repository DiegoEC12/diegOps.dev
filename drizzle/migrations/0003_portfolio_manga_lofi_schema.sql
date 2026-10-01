-- =============================================================================
-- PORTFOLIO MANGA LO-FI: BASE DE DATOS ESQUEMA CORE
-- =============================================================================

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS image_fit TEXT NOT NULL DEFAULT 'cover',
  ADD COLUMN IF NOT EXISTS image_position TEXT NOT NULL DEFAULT '50% 50%';

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

CREATE TABLE IF NOT EXISTS public.faq_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_label TEXT NOT NULL,
  sql_command TEXT NOT NULL,
  result_columns TEXT[] NOT NULL DEFAULT '{}',
  result_rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_settings_updated_at_idx
  ON public.site_settings (updated_at DESC);

CREATE INDEX IF NOT EXISTS timeline_entries_kind_sort_idx
  ON public.timeline_entries (kind, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS certifications_published_sort_idx
  ON public.certifications (published, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS music_tracks_active_sort_idx
  ON public.music_tracks (is_active, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS faq_queries_sort_idx
  ON public.faq_queries (sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_messages_read_created_at_idx
  ON public.contact_messages (is_read, created_at DESC);
