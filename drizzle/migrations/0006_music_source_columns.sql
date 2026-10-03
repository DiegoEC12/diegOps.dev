ALTER TABLE public.music_tracks
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'direct_url',
  ADD COLUMN IF NOT EXISTS youtube_id TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

ALTER TABLE public.music_tracks
  ALTER COLUMN audio_url DROP NOT NULL;

UPDATE public.music_tracks
SET source_type = 'direct_url'
WHERE source_type IS NULL;
