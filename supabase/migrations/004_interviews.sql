-- ============================================================
-- 004_interviews.sql
-- Portal de Carreiras — Welcome Group
-- Tabela de entrevistas (Bar Raiser, Pares, Painel) com voto
-- e avaliação por pilares BeWelcome
-- ============================================================

-- Enums ------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_type') THEN
    CREATE TYPE interview_type AS ENUM (
      'bar_raiser',
      'par_1',
      'par_2',
      'par_3',
      'painel_decisao'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_vote') THEN
    CREATE TYPE interview_vote AS ENUM (
      'muito_inclinado',
      'inclinado',
      'pouco_inclinado',
      'nao_inclinado'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rate_limit_log_table') THEN
    -- sentinel: presença serve só para evitar recriação em reruns
    PERFORM 1;
  END IF;
END $$;


-- Tabela -----------------------------------------------------

CREATE TABLE IF NOT EXISTS interviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type             interview_type NOT NULL,
  interviewer_name TEXT,
  vote             interview_vote,
  -- scores por pilar BeWelcome (1-5). Chaves:
  -- apaixonados_jornada_cliente, seja_bem_vindo, protagonize_se,
  -- invente, conforto_desconforto, data_driven
  pillar_scores    JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_application ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_type ON interviews(type);


-- RLS --------------------------------------------------------

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interviews_authenticated_all" ON interviews;
CREATE POLICY "interviews_authenticated_all" ON interviews
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- Trigger de updated_at --------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_interviews_updated_at ON interviews;
CREATE TRIGGER trg_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- Rate limit (tabela simples pra endpoints públicos)
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_limit_log (
  id          BIGSERIAL PRIMARY KEY,
  ip          TEXT NOT NULL,
  endpoint    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup
  ON rate_limit_log(ip, endpoint, created_at DESC);

ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;
-- Só o service role escreve/lê; não criamos policy para anon/authenticated.
