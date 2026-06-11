-- ============================================================
-- 009_storage_buckets.sql
-- Portal de Carreiras — Welcome Group
-- Criação dos buckets de storage com limites e tipos MIME (RN-017)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'resumes',
    'resumes',
    false,
    5242880,  -- 5 MB
    ARRAY['application/pdf']
  ),
  (
    'talent-pool',
    'talent-pool',
    false,
    5242880,  -- 5 MB
    ARRAY['application/pdf']
  ),
  (
    'testimonials',
    'testimonials',
    true,
    2097152,  -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'culture',
    'culture',
    true,
    5242880,  -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
ON CONFLICT (id) DO NOTHING;
