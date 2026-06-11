-- ============================================================
-- 006_brand_enum.sql
-- Portal de Carreiras — Welcome Group
-- Adiciona 'welcome_group' ao enum brand e migra dados legados
-- ============================================================

-- PostgreSQL não permite DROP VALUE em enums, então adicionamos o novo
-- valor e atualizamos as linhas que ainda usam os valores antigos.
ALTER TYPE brand ADD VALUE IF NOT EXISTS 'welcome_group';

-- Migrar dados existentes: welconnect e corporativo → welcome_group
-- Comparação via ::text para evitar cast error quando o valor não existe no enum

-- Tabelas com coluna brand escalar
UPDATE jobs
  SET brand = 'welcome_group'
  WHERE brand::text IN ('welconnect', 'corporativo');

UPDATE testimonials
  SET brand = 'welcome_group'
  WHERE brand::text IN ('welconnect', 'corporativo');

-- talent_pool usa brand_interest brand[] (array); substituir elemento a elemento
UPDATE talent_pool
  SET brand_interest = (
    SELECT array_agg(
      CASE elem::text
        WHEN 'welconnect'  THEN 'welcome_group'::brand
        WHEN 'corporativo' THEN 'welcome_group'::brand
        ELSE elem
      END
    )
    FROM unnest(brand_interest) AS elem
  )
  WHERE brand_interest::text[] && ARRAY['welconnect', 'corporativo'];

-- applications não possui coluna brand (herda a marca via job_id → jobs.brand)
