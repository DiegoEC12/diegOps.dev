-- =============================================================================
-- PORTFOLIO MANGA LO-FI: PERMISOS Y RLS
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

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin manage site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can view timeline" ON public.timeline_entries;
DROP POLICY IF EXISTS "Admin manage timeline" ON public.timeline_entries;
DROP POLICY IF EXISTS "Public can view certifications" ON public.certifications;
DROP POLICY IF EXISTS "Admin manage certifications" ON public.certifications;
DROP POLICY IF EXISTS "Public can view active music tracks" ON public.music_tracks;
DROP POLICY IF EXISTS "Admin manage music" ON public.music_tracks;
DROP POLICY IF EXISTS "Public can view faq queries" ON public.faq_queries;
DROP POLICY IF EXISTS "Admin manage faq" ON public.faq_queries;
DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin manage contact messages" ON public.contact_messages;

CREATE POLICY "Public can view site_settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Public can view timeline"
ON public.timeline_entries FOR SELECT
USING (true);

CREATE POLICY "Public can view certifications"
ON public.certifications FOR SELECT
USING (published = true);

CREATE POLICY "Public can view active music tracks"
ON public.music_tracks FOR SELECT
USING (is_active = true);

CREATE POLICY "Public can view faq queries"
ON public.faq_queries FOR SELECT
USING (true);

CREATE POLICY "Public can insert contact messages"
ON public.contact_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage site_settings"
ON public.site_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage timeline"
ON public.timeline_entries FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage certifications"
ON public.certifications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage music"
ON public.music_tracks FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage faq"
ON public.faq_queries FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage contact messages"
ON public.contact_messages FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_set_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
