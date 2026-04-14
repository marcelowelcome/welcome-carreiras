-- ============================================================
-- 002_rls_policies.sql
-- Portal de Carreiras — Welcome Group
-- Row Level Security policies
-- ============================================================

-- --------------------
-- JOBS
-- --------------------
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Público: lê apenas vagas publicadas
CREATE POLICY "jobs_public_read" ON jobs
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Admin: acesso total
CREATE POLICY "jobs_authenticated_select" ON jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "jobs_authenticated_insert" ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "jobs_authenticated_update" ON jobs
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "jobs_authenticated_delete" ON jobs
  FOR DELETE
  TO authenticated
  USING (true);


-- --------------------
-- APPLICATIONS
-- --------------------
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Público: pode inserir (candidatar-se)
CREATE POLICY "applications_public_insert" ON applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin: leitura e atualização
CREATE POLICY "applications_authenticated_select" ON applications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "applications_authenticated_update" ON applications
  FOR UPDATE
  TO authenticated
  USING (true);


-- --------------------
-- TALENT POOL
-- --------------------
ALTER TABLE talent_pool ENABLE ROW LEVEL SECURITY;

-- Público: pode se cadastrar
CREATE POLICY "talent_pool_public_insert" ON talent_pool
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin: leitura
CREATE POLICY "talent_pool_authenticated_select" ON talent_pool
  FOR SELECT
  TO authenticated
  USING (true);


-- --------------------
-- STAGE EVALUATIONS
-- --------------------
ALTER TABLE stage_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluations_authenticated_all" ON stage_evaluations
  FOR ALL
  TO authenticated
  USING (true);


-- --------------------
-- STAGE HISTORY
-- --------------------
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;

-- Público: pode inserir (via API route com service role)
CREATE POLICY "history_authenticated_select" ON stage_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "history_authenticated_insert" ON stage_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- --------------------
-- CULTURE CONTENT
-- --------------------
ALTER TABLE culture_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "culture_public_read" ON culture_content
  FOR SELECT
  TO anon
  USING (is_visible = true);

CREATE POLICY "culture_authenticated_all" ON culture_content
  FOR ALL
  TO authenticated
  USING (true);


-- --------------------
-- TESTIMONIALS
-- --------------------
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_public_read" ON testimonials
  FOR SELECT
  TO anon
  USING (is_visible = true);

CREATE POLICY "testimonials_authenticated_all" ON testimonials
  FOR ALL
  TO authenticated
  USING (true);


-- --------------------
-- STORAGE POLICIES
-- --------------------

-- Resumes: público pode fazer upload, admin pode ler
CREATE POLICY "resumes_public_upload" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "resumes_authenticated_read" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes');

-- Talent pool CVs: público pode fazer upload, admin pode ler
CREATE POLICY "talent_pool_public_upload" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'talent-pool');

CREATE POLICY "talent_pool_authenticated_read" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'talent-pool');

-- Testimonials e culture: público pode ler, admin pode tudo
CREATE POLICY "public_media_read" ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id IN ('testimonials', 'culture'));

CREATE POLICY "public_media_admin" ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id IN ('testimonials', 'culture'));
