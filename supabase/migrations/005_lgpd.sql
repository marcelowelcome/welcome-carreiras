-- ============================================================
-- 005_lgpd.sql
-- LGPD Fase 2 — solicitações de acesso/exclusão de dados
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lgpd_request_type') THEN
    CREATE TYPE lgpd_request_type AS ENUM ('exclusao', 'acesso');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lgpd_request_status') THEN
    CREATE TYPE lgpd_request_status AS ENUM ('pendente', 'resolvido', 'cancelado');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS lgpd_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  request_type  lgpd_request_type NOT NULL DEFAULT 'exclusao',
  reason        TEXT,                           -- motivo opcional informado pelo candidato
  status        lgpd_request_status NOT NULL DEFAULT 'pendente',
  ip            TEXT,
  resolved_by   UUID REFERENCES auth.users(id),
  resolved_note TEXT,
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lgpd_requests_status
  ON lgpd_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lgpd_requests_email
  ON lgpd_requests(email);

ALTER TABLE lgpd_requests ENABLE ROW LEVEL SECURITY;
-- Sem policies: só service role lê/escreve, via rotas /api que já são protegidas.
