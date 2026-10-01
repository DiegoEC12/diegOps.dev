-- =============================================================================
-- PORTFOLIO MANGA LO-FI: SEMILLAS INICIALES
-- =============================================================================

INSERT INTO public.projects (
  title,
  slug,
  summary,
  problem,
  category,
  technologies,
  github_url,
  demo_url,
  image_url,
  featured,
  published,
  sort_order
)
VALUES
  (
    'Gestor de inventario',
    'gestor-inventario',
    'Control de stock, movimientos y alertas en tiempo real para pequeños negocios.',
    'Centraliza el inventario y reduce quiebres de stock.',
    'Full Stack',
    ARRAY['TypeScript', 'PostgreSQL', 'Docker'],
    'https://github.com/',
    NULL,
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    true,
    true,
    1
  ),
  (
    'Mesa de ayuda TI',
    'mesa-ayuda-ti',
    'Sistema de tickets con prioridades, responsables e historial de atención.',
    'Ordena solicitudes internas y acelera la resolución de incidencias.',
    'Backend',
    ARRAY['PHP', 'MySQL', 'JavaScript'],
    'https://github.com/',
    NULL,
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
    true,
    true,
    2
  ),
  (
    'Panel de métricas académicas',
    'metricas-academicas',
    'Visualización clara del avance académico y rendimiento por curso.',
    'Convierte datos complejos en decisiones comprensibles para docentes y alumnos.',
    'Data',
    ARRAY['TypeScript', 'SQL Server', 'HTML'],
    'https://github.com/',
    NULL,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    false,
    true,
    3
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.site_settings (
  id,
  brand_initials,
  brand_name,
  hero_title,
  hero_role,
  hero_copy,
  availability_status,
  email_contact,
  github_url,
  linkedin_url,
  location,
  footer_tagline
)
VALUES (
  'general_config',
  'DY',
  'Diego Yeferson EC',
  'Diego Yeferson EC',
  'Técnico en desarrollo de sistemas e información',
  'Construyo soluciones digitales útiles, mantenibles y bien pensadas. Actualmente curso Ingeniería de Software en la UTP.',
  'Disponible para nuevos retos y proyectos',
  'tu-correo@ejemplo.com',
  'https://github.com/',
  'https://linkedin.com/',
  'Lima, Perú',
  'Diseñado entre café, código y lluvia.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.timeline_entries (
  kind,
  title,
  institution,
  period,
  status,
  description,
  skills_learned,
  sort_order
)
VALUES
  (
    'education',
    'Ingeniería de Software',
    'Universidad Tecnológica del Perú (UTP)',
    '2026 - Presente',
    'En curso (1er ciclo)',
    'Formación profesional orientada a arquitectura de software, algoritmia y sistemas de misión crítica.',
    ARRAY['Arquitectura', 'Estructuras de Datos', 'POO'],
    1
  ),
  (
    'education',
    'Técnico en Desarrollo de Sistemas e Información',
    'Instituto de Educación Superior',
    '2023 - 2025',
    'Titulado / Egresado',
    'Especialización práctica en modelado de datos relacionales, desarrollo web fullstack y administración de redes.',
    ARRAY['PHP', 'MySQL', 'PostgreSQL', 'JavaScript', 'Docker'],
    2
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.certifications (
  title,
  issuer,
  issued_date,
  credential_url,
  credential_id,
  hours,
  badge_url,
  image_fit,
  image_position,
  sort_order,
  published
)
VALUES
  (
    'Desarrollo Web Full Stack',
    'Academia Técnica',
    '2025',
    'https://example.com/certificado-1',
    'CERT-001',
    120,
    NULL,
    'contain',
    '50% 50%',
    1,
    true
  ),
  (
    'SQL y Bases de Datos',
    'Academia Técnica',
    '2024',
    'https://example.com/certificado-2',
    'CERT-002',
    80,
    NULL,
    'contain',
    '50% 50%',
    2,
    true
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.music_tracks (
  title,
  artist,
  audio_url,
  duration,
  is_active,
  sort_order
)
VALUES
  (
    'Midnight Blueprint',
    'Lo-Fi Records',
    'https://example.com/audio/midnight-blueprint.mp3',
    '2:58',
    true,
    1
  ),
  (
    'Terminal Rain',
    'Lo-Fi Records',
    'https://example.com/audio/terminal-rain.mp3',
    '3:12',
    true,
    2
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.faq_queries (
  question_label,
  sql_command,
  result_columns,
  result_rows,
  sort_order
)
VALUES
  (
    'Disponibilidad laboral',
    'SELECT modalidad, jornada, disponibilidad_inmediata FROM candidato_perfil;',
    ARRAY['modalidad', 'jornada', 'disponibilidad_inmediata'],
    '[{"modalidad": "Remoto / Híbrido", "jornada": "Tiempo Completo / Prácticas", "disponibilidad_inmediata": "Sí"}]'::jsonb,
    1
  ),
  (
    'Experiencia en bases de datos',
    'SELECT motor, tipo, experiencia FROM stack_databases ORDER BY nivel DESC;',
    ARRAY['motor', 'tipo', 'experiencia'],
    '[{"motor": "PostgreSQL", "tipo": "Relacional / ACID", "experiencia": "Avanzado"}, {"motor": "MySQL / MariaDB", "tipo": "Relacional", "experiencia": "Avanzado"}]'::jsonb,
    2
  )
ON CONFLICT DO NOTHING;
