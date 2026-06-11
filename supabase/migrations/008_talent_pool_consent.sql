-- ============================================================
-- 008_talent_pool_consent.sql
-- Portal de Carreiras — Welcome Group
-- Consentimento LGPD no talent_pool + políticas UPDATE/DELETE para admins
-- ============================================================

-- Coluna lgpd_consent_at para banco de talentos (RN-006)
ALTER TABLE talent_pool
  ADD COLUMN IF NOT EXISTS lgpd_consent_at TIMESTAMPTZ;

UPDATE talent_pool
  SET lgpd_consent_at = created_at
  WHERE lgpd_consent_at IS NULL;

-- Políticas UPDATE e DELETE para administradores autenticados (RN-018)
DROP POLICY IF EXISTS talent_pool_authenticated_update ON talent_pool;
DROP POLICY IF EXISTS talent_pool_authenticated_delete ON talent_pool;

CREATE POLICY talent_pool_authenticated_update ON talent_pool
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY talent_pool_authenticated_delete ON talent_pool
  FOR DELETE
  TO authenticated
  USING (true);
