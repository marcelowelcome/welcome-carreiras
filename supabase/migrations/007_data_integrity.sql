-- ============================================================
-- 007_data_integrity.sql
-- Portal de Carreiras — Welcome Group
-- Unique constraint em candidaturas, lgpd_consent_at, updated_at em testimonials
-- ============================================================

-- Unique constraint: um candidato só pode se inscrever uma vez por vaga (RN-001)

-- 1) Remover duplicatas: manter apenas a candidatura mais recente por (job_id, email)
DELETE FROM applications
WHERE id NOT IN (
  SELECT DISTINCT ON (job_id, email) id
  FROM applications
  ORDER BY job_id, email, created_at DESC
);

-- 2) Criar a constraint (idempotente via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_application_job_email'
  ) THEN
    ALTER TABLE applications
      ADD CONSTRAINT uq_application_job_email UNIQUE (job_id, email);
  END IF;
END;
$$;

-- Coluna lgpd_consent_at para registrar momento do consentimento LGPD (RN-007)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS lgpd_consent_at TIMESTAMPTZ;

UPDATE applications
  SET lgpd_consent_at = created_at
  WHERE lgpd_consent_at IS NULL;

-- updated_at para testimonials + trigger automático (RN-016)
ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_testimonials_updated_at ON testimonials;

CREATE TRIGGER set_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_testimonials_updated_at();
