-- ============================================================
-- 001_initial_schema.sql
-- Portal de Carreiras — Welcome Group
-- Schema inicial: enums, tabelas, índices
-- ============================================================

-- --------------------
-- ENUMS
-- --------------------

CREATE TYPE brand AS ENUM (
  'welcome_weddings',
  'welcome_trips',
  'welconnect',
  'corporativo'
);

CREATE TYPE department AS ENUM (
  'marketing',
  'comercial',
  'operacoes',
  'tech',
  'criativo',
  'administrativo',
  'rh',
  'financeiro'
);

CREATE TYPE job_status AS ENUM (
  'draft',
  'published',
  'paused',
  'closed'
);

CREATE TYPE contract_type AS ENUM (
  'clt',
  'pj',
  'estagio',
  'temporario'
);

CREATE TYPE work_model AS ENUM (
  'presencial',
  'hibrido',
  'remoto'
);

CREATE TYPE application_stage AS ENUM (
  'inscrito',
  'triagem',
  'entrevista',
  'desafio',
  'proposta',
  'contratado',
  'reprovado'
);

CREATE TYPE referral_source AS ENUM (
  'linkedin',
  'instagram',
  'indicacao',
  'site',
  'google',
  'job_board',
  'outro'
);


-- --------------------
-- TABELAS
-- --------------------

CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  brand           brand NOT NULL,
  department      department NOT NULL,
  location        TEXT NOT NULL DEFAULT 'Curitiba, PR',
  work_model      work_model NOT NULL DEFAULT 'presencial',
  contract_type   contract_type NOT NULL DEFAULT 'clt',
  salary_range    TEXT,
  description     TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  requirements_must TEXT NOT NULL,
  requirements_nice TEXT,
  benefits        TEXT,
  process_steps   JSONB DEFAULT '[]'::jsonb,
  status          job_status NOT NULL DEFAULT 'draft',
  is_featured     BOOLEAN DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  closes_at       TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_brand ON jobs(brand);
CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_published ON jobs(published_at DESC) WHERE status = 'published';


CREATE TABLE applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  linkedin_url      TEXT,
  portfolio_url     TEXT,
  resume_path       TEXT NOT NULL,
  cover_letter      TEXT,
  salary_expectation TEXT,
  referral_source   referral_source NOT NULL DEFAULT 'site',
  stage             application_stage NOT NULL DEFAULT 'inscrito',
  stage_updated_at  TIMESTAMPTZ DEFAULT NOW(),
  notes             TEXT,
  score             SMALLINT CHECK (score BETWEEN 1 AND 5),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_stage ON applications(stage);
CREATE INDEX idx_applications_email ON applications(email);


CREATE TABLE talent_pool (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT NOT NULL,
  resume_path     TEXT,
  area_interest   department[],
  brand_interest  brand[],
  opt_in_alerts   BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_talent_pool_email ON talent_pool(email);


CREATE TABLE stage_evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage           application_stage NOT NULL,
  evaluator_id    UUID REFERENCES auth.users(id),
  score           SMALLINT CHECK (score BETWEEN 1 AND 5),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE stage_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_stage      application_stage,
  to_stage        application_stage NOT NULL,
  moved_by        UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stage_history_application ON stage_history(application_id);


CREATE TABLE culture_content (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key     TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  content         JSONB NOT NULL,
  sort_order      SMALLINT DEFAULT 0,
  is_visible      BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE testimonials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,
  brand           brand NOT NULL,
  quote           TEXT NOT NULL,
  photo_path      TEXT,
  is_featured     BOOLEAN DEFAULT FALSE,
  sort_order      SMALLINT DEFAULT 0,
  is_visible      BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- --------------------
-- UPDATED_AT TRIGGER
-- --------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_jobs
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_applications
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_culture
  BEFORE UPDATE ON culture_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- --------------------
-- STORAGE BUCKETS
-- --------------------
-- Execute via Supabase Dashboard ou SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('talent-pool', 'talent-pool', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('testimonials', 'testimonials', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('culture', 'culture', true);
