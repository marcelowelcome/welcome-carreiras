-- ============================================================
-- 010_rls_and_housekeeping.sql
-- Portal de Carreiras — Welcome Group
-- Restringe insert de candidaturas a vagas publicadas e não expiradas (RN-002)
-- ============================================================

-- Substitui a política permissiva por uma que valida status e prazo da vaga
DROP POLICY IF EXISTS applications_public_insert ON applications;

CREATE POLICY applications_public_insert ON applications
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.status = 'published'
        AND (jobs.closes_at IS NULL OR jobs.closes_at > NOW())
    )
  );

-- ============================================================
-- Limpeza automática de rate_limit_log (RN-020)
-- Requer extensão pg_cron habilitada no projeto Supabase.
-- Execute manualmente no SQL Editor do painel Supabase caso
-- pg_cron ainda não esteja ativo:
--
--   SELECT cron.schedule(
--     'cleanup-rate-limit',
--     '0 * * * *',
--     $$DELETE FROM rate_limit_log WHERE created_at < NOW() - INTERVAL '1 hour'$$
--   );
-- ============================================================
