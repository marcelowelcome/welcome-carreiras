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
UPDATE jobs        SET brand = 'welcome_group' WHERE brand::text IN ('welconnect', 'corporativo');
UPDATE applications SET brand = 'welcome_group' WHERE brand::text IN ('welconnect', 'corporativo');
UPDATE talent_pool  SET brand = 'welcome_group' WHERE brand::text IN ('welconnect', 'corporativo');
UPDATE testimonials SET brand = 'welcome_group' WHERE brand::text IN ('welconnect', 'corporativo');
