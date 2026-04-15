# ARCHITECTURE.md — Portal de Carreiras Welcome Group

> **Repositório:** raiz do projeto (`welcome-carreiras`) — a aplicação Next.js vive na raiz.  
> **Stack:** Next.js 14 (App Router) · TypeScript · Supabase · Tailwind CSS · Resend · Vercel  
> **Última atualização:** Abril 2026

---

## 1. Visão Geral

O Portal de Carreiras é uma aplicação web composta por duas camadas:

- **Pública (candidate-facing):** páginas de carreiras, vagas, cultura e banco de talentos
- **Administrativa (backoffice):** painel para gestão de vagas, candidaturas e métricas

A aplicação é self-contained — não depende de ATS externo (Gupy/InHire). Todo o fluxo de publicação de vagas, recebimento de candidaturas e gestão do pipeline é feito internamente.

---

## 2. Estrutura de Diretórios

A aplicação Next.js vive na **raiz do repositório**. Os arquivos de documentação (PROMPT_CONTEXT, ARCHITECTURE, AGENT_INSTRUCTIONS, SESSION_STARTER, DESIGN_SYSTEM_WELCOME_TRIPS) ficam ao lado. Migrations em `supabase/migrations/`.

```
welcome-carreiras/
├── .env.local                    # Variáveis locais (gitignored)
├── .gitignore                    # Ignora node_modules, .next, .env*.local, PDFs internos, .claude/
├── next.config.mjs
├── tailwind.config.ts            # Inclui tokens wt.* do design system Welcome Trips
├── tsconfig.json
├── middleware.ts                 # Auth guard para /admin e /api/admin
├── vercel.json                   # Fixa framework preset = nextjs
├── package.json
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_seed_data.sql
│       └── 004_interviews.sql    # interviews + rate_limit_log
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Fontes (Inter + Nunito Sans), bg wt-off-white
│   │   ├── globals.css
│   │   ├── page.tsx              # Home /
│   │   ├── vagas/
│   │   │   ├── page.tsx          # Lista pública /vagas
│   │   │   └── [slug]/page.tsx   # Detalhe da vaga
│   │   ├── cultura/page.tsx
│   │   ├── banco-de-talentos/page.tsx
│   │   ├── sitemap.ts            # Sitemap dinâmico (tolerante a envs ausentes)
│   │   ├── (admin-auth)/
│   │   │   └── admin/login/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Sidebar + guarda
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── vagas/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── AdminJobsTable.tsx
│   │   │   │   ├── nova/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── candidaturas/page.tsx  # Kanban
│   │   │   ├── candidaturas/
│   │   │   │   ├── page.tsx                    # Lista global de candidaturas
│   │   │   │   └── AdminApplicationsTable.tsx
│   │   │   ├── banco-de-talentos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── TalentPoolTable.tsx
│   │   │   └── configuracoes/
│   │   │       ├── page.tsx
│   │   │       ├── cultura/(page.tsx + CultureEditor.tsx)
│   │   │       └── depoimentos/(page.tsx + TestimonialsAdmin.tsx)
│   │   └── api/
│   │       ├── applications/route.ts     # POST candidatura (rate limit + magic bytes + emails)
│   │       ├── talent-pool/route.ts      # POST banco de talentos (rate limit + email)
│   │       └── admin/
│   │           ├── dashboard/route.ts
│   │           ├── jobs/{route.ts, [id]/route.ts}
│   │           ├── applications/{route.ts, [id]/route.ts, [id]/evaluations/route.ts, [id]/interviews/route.ts}
│   │           ├── interviews/[id]/route.ts
│   │           └── resumes/route.ts      # Gera signed URL para baixar CV
│   ├── components/
│   │   ├── ui/SimpleEditor.tsx
│   │   ├── public/
│   │   │   ├── Nav.tsx, Footer.tsx
│   │   │   ├── HeroSection.tsx, EVPBlock.tsx, NumbersGrid.tsx
│   │   │   ├── JobCard.tsx, JobFilters.tsx
│   │   │   ├── ApplicationForm.tsx, TalentPoolForm.tsx
│   │   │   ├── ProcessTimeline.tsx
│   │   │   └── TestimonialCarousel.tsx
│   │   └── admin/
│   │       ├── Sidebar.tsx
│   │       ├── StatsCard.tsx, DataTable.tsx
│   │       ├── JobFormEditor.tsx
│   │       ├── KanbanBoard.tsx, KanbanColumn.tsx, CandidateCard.tsx
│   │       ├── CandidateDrawer.tsx       # Drawer reutilizável com notas + avaliações + entrevistas
│   │       └── InterviewsSection.tsx     # Bar Raiser + Pares + Painel + pilares BeWelcome
│   ├── lib/
│   │   ├── supabase/{client.ts, server.ts, admin.ts}
│   │   ├── email/{resend.ts, templates.ts}
│   │   ├── rate-limit.ts
│   │   ├── file-validation.ts            # Checa %PDF- magic bytes
│   │   ├── utils.ts, constants.ts, validators.ts
│   ├── hooks/
│   └── types/index.ts
└── public/
```

---

## 3. Schema do Banco de Dados (Supabase/PostgreSQL)

### 3.1 Enums

```sql
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
```

### 3.2 Tabelas

```sql
-- ==========================================
-- VAGAS
-- ==========================================
CREATE TABLE jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  brand         brand NOT NULL,
  department    department NOT NULL,
  location      TEXT NOT NULL DEFAULT 'Curitiba, PR',
  work_model    work_model NOT NULL DEFAULT 'presencial',
  contract_type contract_type NOT NULL DEFAULT 'clt',
  salary_range  TEXT,                          -- Ex: "R$ 4.000 - R$ 6.000" (nullable = não divulgar)
  description   TEXT NOT NULL,                 -- Rich text (HTML sanitizado)
  responsibilities TEXT NOT NULL,              -- Rich text
  requirements_must TEXT NOT NULL,             -- Requisitos obrigatórios (rich text)
  requirements_nice TEXT,                      -- Requisitos desejáveis (rich text)
  benefits      TEXT,                          -- Rich text
  process_steps JSONB DEFAULT '[]'::jsonb,     -- [{order, title, description}]
  status        job_status NOT NULL DEFAULT 'draft',
  is_featured   BOOLEAN DEFAULT FALSE,         -- Destaque na landing
  published_at  TIMESTAMPTZ,
  closes_at     TIMESTAMPTZ,                   -- Data limite para candidaturas
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_brand ON jobs(brand);
CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_published ON jobs(published_at DESC) WHERE status = 'published';

-- ==========================================
-- CANDIDATURAS
-- ==========================================
CREATE TABLE applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  linkedin_url    TEXT,
  portfolio_url   TEXT,
  resume_path     TEXT NOT NULL,                -- Path no Supabase Storage
  cover_letter    TEXT,
  salary_expectation TEXT,
  referral_source referral_source NOT NULL DEFAULT 'site',
  stage           application_stage NOT NULL DEFAULT 'inscrito',
  stage_updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes           TEXT,                         -- Notas internas do recrutador
  score           SMALLINT CHECK (score BETWEEN 1 AND 5),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_stage ON applications(stage);
CREATE INDEX idx_applications_email ON applications(email);

-- ==========================================
-- BANCO DE TALENTOS
-- ==========================================
CREATE TABLE talent_pool (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT NOT NULL,
  resume_path     TEXT,
  area_interest   department[],                -- Array de áreas de interesse
  brand_interest  brand[],                     -- Array de marcas de interesse
  opt_in_alerts   BOOLEAN DEFAULT TRUE,        -- Receber alertas de novas vagas
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_talent_pool_email ON talent_pool(email);

-- ==========================================
-- AVALIAÇÕES POR ETAPA (Fase 2)
-- ==========================================
CREATE TABLE stage_evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage           application_stage NOT NULL,
  evaluator_id    UUID REFERENCES auth.users(id),
  score           SMALLINT CHECK (score BETWEEN 1 AND 5),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- LOG DE MOVIMENTAÇÃO (auditoria)
-- ==========================================
CREATE TABLE stage_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_stage      application_stage,
  to_stage        application_stage NOT NULL,
  moved_by        UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ENTREVISTAS ESTRUTURADAS (004_interviews.sql)
-- Reflete o fluxo BeWelcome: Bar Raiser + 3 Pares + Painel de Decisão.
-- Cada entrevista armazena voto (4 opções) e score 1-5 por pilar de cultura.
-- ==========================================
CREATE TYPE interview_type AS ENUM ('bar_raiser','par_1','par_2','par_3','painel_decisao');
CREATE TYPE interview_vote AS ENUM ('muito_inclinado','inclinado','pouco_inclinado','nao_inclinado');

CREATE TABLE interviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type             interview_type NOT NULL,
  interviewer_name TEXT,
  vote             interview_vote,
  -- chaves: apaixonados_jornada_cliente, seja_bem_vindo, protagonize_se,
  -- invente, conforto_desconforto, data_driven
  pillar_scores    JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- RATE LIMIT (endpoints públicos)
-- Tabela consultada por src/lib/rate-limit.ts. Só service role lê/escreve.
-- ==========================================
CREATE TABLE rate_limit_log (
  id          BIGSERIAL PRIMARY KEY,
  ip          TEXT NOT NULL,
  endpoint    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CONTEÚDO DA PÁGINA DE CULTURA (CMS leve)
-- ==========================================
CREATE TABLE culture_content (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key     TEXT UNIQUE NOT NULL,         -- Ex: 'manifesto', 'values', 'benefits', 'dei'
  title           TEXT NOT NULL,
  content         JSONB NOT NULL,               -- Estrutura varia por seção
  sort_order      SMALLINT DEFAULT 0,
  is_visible      BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- DEPOIMENTOS DE COLABORADORES
-- ==========================================
CREATE TABLE testimonials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,
  brand           brand NOT NULL,
  quote           TEXT NOT NULL,
  photo_path      TEXT,                         -- Path no Supabase Storage
  is_featured     BOOLEAN DEFAULT FALSE,
  sort_order      SMALLINT DEFAULT 0,
  is_visible      BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Row Level Security (RLS)

```sql
-- Vagas: leitura pública (published), escrita para autenticados
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_public_read" ON jobs
  FOR SELECT USING (status = 'published');

CREATE POLICY "jobs_admin_all" ON jobs
  FOR ALL USING (auth.role() = 'authenticated');

-- Candidaturas: escrita pública (insert), leitura para autenticados
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_public_insert" ON applications
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "applications_admin_read" ON applications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "applications_admin_update" ON applications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Banco de talentos: escrita pública, leitura admin
ALTER TABLE talent_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "talent_pool_public_insert" ON talent_pool
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "talent_pool_admin_read" ON talent_pool
  FOR SELECT USING (auth.role() = 'authenticated');

-- Conteúdo e depoimentos: leitura pública, escrita admin
ALTER TABLE culture_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "culture_public_read" ON culture_content
  FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "culture_admin_all" ON culture_content
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "testimonials_public_read" ON testimonials
  FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "testimonials_admin_all" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');
```

### 3.4 Supabase Storage Buckets

```
resumes/           → Currículos dos candidatos (privado, RLS)
talent-pool/       → CVs do banco de talentos (privado, RLS)
testimonials/      → Fotos dos depoimentos (público)
culture/           → Imagens da página de cultura (público)
```

---

## 4. Rotas e Páginas

### 4.1 Rotas Públicas

| Rota | Método | Descrição |
|------|--------|-----------|
| `/` | GET | Landing de carreiras (hero, EVP, vagas destaque, depoimentos, CTA) |
| `/vagas` | GET | Lista paginada com filtros (brand, department, work_model, search) |
| `/vagas/[slug]` | GET | Detalhe da vaga + formulário de candidatura |
| `/cultura` | GET | Página de cultura (valores, galeria, benefícios, depoimentos) |
| `/banco-de-talentos` | GET | Formulário de cadastro espontâneo |

### 4.2 API Routes

| Rota | Método | Descrição | Auth |
|------|--------|-----------|------|
| `/api/applications` | POST | Submeter candidatura + upload CV | Público |
| `/api/talent-pool` | POST | Cadastro no banco de talentos | Público |
| `/api/admin/jobs` | GET/POST | Listar / criar vagas | Admin |
| `/api/admin/jobs/[id]` | PUT/DELETE | Atualizar / excluir vaga | Admin |
| `/api/admin/applications` | GET | Listar candidaturas (filtros) | Admin |
| `/api/admin/applications/[id]` | PUT | Atualizar stage/notas | Admin |
| `/api/admin/dashboard` | GET | KPIs agregados | Admin |

### 4.3 Rotas Admin (protegidas por middleware.ts)

| Rota | Descrição |
|------|-----------|
| `/admin/login` | Login via Supabase Auth |
| `/admin` | Dashboard com KPIs |
| `/admin/vagas` | Lista de vagas com contador de candidaturas |
| `/admin/vagas/nova` | Formulário de criação |
| `/admin/vagas/[id]` | Edição de vaga |
| `/admin/vagas/[id]/candidaturas` | Kanban por vaga |
| `/admin/candidaturas` | Lista global de candidaturas com filtros (busca, vaga, marca, etapa) |
| `/admin/banco-de-talentos` | Lista do talent pool com filtros (busca, área, marca) |
| `/admin/configuracoes` | Hub de configurações |
| `/admin/configuracoes/cultura` | CMS leve da página de cultura |
| `/admin/configuracoes/depoimentos` | CRUD dos depoimentos |

### 4.4 Rotas API

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/applications` | POST | Candidatura + upload CV. Rate limit (5/IP/15min), magic-bytes check, e-mail p/ candidato e RH |
| `/api/talent-pool` | POST | Cadastro no banco de talentos. Rate limit (3/IP/10min), e-mail de confirmação |
| `/api/admin/dashboard` | GET | KPIs agregados |
| `/api/admin/jobs` | GET, POST | Lista/cria vaga |
| `/api/admin/jobs/[id]` | GET, PATCH | Busca/atualiza/encerra vaga |
| `/api/admin/applications` | GET | Lista candidaturas (filtra por job_id, stage) |
| `/api/admin/applications/[id]` | PATCH | Atualiza stage, notas, score. Loga stage_history quando muda etapa |
| `/api/admin/applications/[id]/evaluations` | GET, POST | Avaliações genéricas por etapa (1-5 + notas) |
| `/api/admin/applications/[id]/interviews` | GET, POST | Entrevistas estruturadas (Bar Raiser/Pares/Painel) |
| `/api/admin/interviews/[id]` | PATCH, DELETE | Edita/remove entrevista |
| `/api/admin/resumes` | GET | Redireciona para signed URL do CV (bucket `resumes` ou `talent-pool`) |

---

## 5. Componentes Principais

### 5.1 Públicos

| Componente | Props Principais | Usado em |
|------------|-----------------|----------|
| `HeroSection` | `headline, subtitle, ctaText, ctaHref, backgroundImage` | Landing |
| `EVPBlock` | `pillars: {icon, title, description}[]` | Landing |
| `NumbersGrid` | `stats: {value, label}[]` | Landing |
| `JobCard` | `job: Job` | Landing, Lista de vagas |
| `JobFilters` | `filters, onChange` | Lista de vagas |
| `ProcessTimeline` | `steps: {title, description}[]` | Página de vaga |
| `ApplicationForm` | `jobId, jobTitle` | Página de vaga |
| `TestimonialCarousel` | `testimonials: Testimonial[]` | Landing, Cultura |
| `CultureValues` | `values: {icon, title, description}[]` | Cultura |
| `BenefitsGrid` | `benefits: {icon, title, items}[]` | Cultura |
| `TalentPoolForm` | — | Banco de talentos |

### 5.2 Admin

| Componente | Props Principais | Usado em |
|------------|-----------------|----------|
| `Sidebar` | `currentPath` | Layout admin |
| `JobFormEditor` | `job?: Job` | Criar/editar vaga (usa API /api/admin/jobs) |
| `KanbanBoard` | `initialApplications, jobId` | Kanban da vaga |
| `KanbanColumn` | `stage, applications, onUpdate, label?` | Kanban (label opcional para override — ex: "Phone Screen") |
| `CandidateCard` | `application, onUpdate` | Kanban — abre `CandidateDrawer` |
| `CandidateDrawer` | `application, open, onClose, onUpdate?` | Modal reutilizável (Kanban + lista global de candidaturas) |
| `InterviewsSection` | `applicationId` | Entrevistas Bar Raiser/Pares/Painel com scorecard de pilares BeWelcome |
| `StatsCard` | `title, value, icon` | Dashboard |
| `DataTable<T>` | `columns, data, emptyMessage?` | Listas genéricas |

---

## 6. Fluxos Críticos

### 6.1 Candidatura (público)

```
1. Candidato acessa /vagas/[slug]
2. Preenche ApplicationForm; formulário valida campos básicos client-side
3. POST /api/applications
   ├─ rate limit (5/IP/15min) via rate_limit_log
   ├─ valida com applicationSchema (Zod)
   ├─ valida MIME + tamanho + magic bytes %PDF-
   ├─ upload para bucket `resumes` via service role
   ├─ insert em `applications`
   └─ fire-and-forget e-mails via Resend (confirmação candidato + notificação RH)
4. Candidato vê tela de sucesso
5. Candidatura aparece em /admin/candidaturas e no Kanban da vaga como "inscrito"
```

### 6.2 Gestão de vaga (admin)

```
1. Admin acessa /admin/vagas/nova ou /admin/vagas/[id]
2. JobFormEditor envia POST/PATCH para /api/admin/jobs[/id] (service role)
3. Salva como "rascunho" ou publica (gera slug, seta published_at)
4. Encerrar é PATCH status=closed
```

### 6.3 Pipeline de candidaturas (admin)

```
1. Kanban em /admin/vagas/[id]/candidaturas (ou lista global em /admin/candidaturas)
2. Drag-and-drop chama PATCH /api/admin/applications/[id] { stage }
   → API loga em stage_history se stage mudou
3. Click no card abre CandidateDrawer com:
   - Info + CV via signed URL (/api/admin/resumes)
   - Avaliação geral + notas (persiste em applications)
   - Avaliações por etapa (stage_evaluations)
   - Entrevistas estruturadas: Bar Raiser + 3 Pares + Painel de Decisão
     com voto (4 opções) + score 1-5 por pilar BeWelcome
   - Botões para mover entre etapas
```

### 6.4 E-mails transacionais

- Templates HTML inline em `src/lib/email/templates.ts` seguindo o design system WT.
- `sendEmail` em `src/lib/email/resend.ts` é idempotente e no-op quando `RESEND_API_KEY` está ausente, para que o stack funcione em dev sem quebrar.
- Atualmente há três templates: confirmação de candidatura, notificação para RH, confirmação de talent pool.

---

## 7. Variáveis de Ambiente

```env
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_SITE_URL=https://carreiras.welcomegroup.com.br
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Sprint 4

# Resend (e-mails transacionais)
# Se RESEND_API_KEY estiver ausente, os envios viram no-op (apenas warn no log).
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Welcome Carreiras <carreiras@welcomegroup.com.br>
RESEND_RH_EMAIL=rh@welcomegroup.com.br
```

**Lembretes operacionais:**
- Todas as envs acima precisam estar em Vercel → Project Settings → Environment Variables (Production + Preview + Development) e em `.env.local` para dev.
- `SUPABASE_SERVICE_ROLE_KEY` é lida em runtime pelas rotas `/admin` e `/api/admin/*` — é obrigatória no ambiente de produção.
- Enquanto o domínio do Resend não estiver verificado, usar `onboarding@resend.dev` como `RESEND_FROM_EMAIL`.

---

## 8. Dependências Chave

```json
{
  "dependencies": {
    "next": "^14.2",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "zod": "^3.x",
    "tailwindcss": "^3.x",
    "lucide-react": "^0.x",
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "react-hot-toast": "^2.x",
    "slugify": "^1.x",
    "resend": "^6.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x"
  }
}
```

---

## 9. Decisões Arquiteturais

| Decisão | Justificativa |
|---------|---------------|
| **App Router (não Pages)** | Padrão do grupo, Server Components por default, melhor SEO |
| **Supabase Auth (não NextAuth)** | Consistência com stack existente, RLS nativo |
| **Rich text como HTML sanitizado** | Simplicidade; sem overhead de Slate/TipTap no MVP — editor simples com toolbar básica |
| **Slug gerado no create** | Imutável após publicação para preservar URLs/SEO |
| **JSONB para process_steps** | Flexível, cada vaga pode ter etapas diferentes |
| **stage_history como log** | Auditoria de movimentação, base para time-to-hire |
| **Sem ORM (query builder Supabase)** | Menos abstração, queries diretas, tipagem via types gerados |
| **@dnd-kit para kanban** | Leve, acessível, melhor que react-beautiful-dnd (descontinuado) |
| **Service role nos reads do admin** | Middleware já garante auth na borda; service role evita fragilidade do repasse de sessão Supabase Auth via cookies em SSR e elimina falsos zeros por RLS. |
| **Service role em todas as escritas do admin via `/api/admin/*`** | Cliente browser com anon key mostrou escrever "silenciosamente" quando a sessão não traduz para `authenticated`. APIs com service role são confiáveis e o middleware já protege as rotas. |
| **Rate limit em tabela Supabase** | Evita adicionar Upstash/Redis só pra 2 endpoints. Sliding window simples via `rate_limit_log`. Fail-open se a query errar. |
| **E-mails com Resend em fire-and-forget** | `void sendEmail(...)` não bloqueia a resposta. No-op silencioso quando `RESEND_API_KEY` ausente para que dev/preview continuem funcionando. |
| **Design system Welcome Trips como linguagem visual global** | Decisão de produto: todo o portal adota a estética WT (off-white #F8F7F4, teal deep #0D5257, CTA laranja #EA7600, Nunito Sans). Outras marcas se diferenciam pelos badges nas vagas, não pelo chrome da página. |
| **PDFs de material interno (BeWelcome) fora do repo** | Repo é público; conteúdo interno não versionado via `.gitignore` (padrão `Group*.pdf`). |
