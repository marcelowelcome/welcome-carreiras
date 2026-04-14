# ARCHITECTURE.md — Portal de Carreiras Welcome Group

> **Repositório:** `careers-portal`  
> **Stack:** Next.js 14 (App Router) · TypeScript · Supabase · Tailwind CSS · Vercel  
> **Última atualização:** Abril 2026

---

## 1. Visão Geral

O Portal de Carreiras é uma aplicação web composta por duas camadas:

- **Pública (candidate-facing):** páginas de carreiras, vagas, cultura e banco de talentos
- **Administrativa (backoffice):** painel para gestão de vagas, candidaturas e métricas

A aplicação é self-contained — não depende de ATS externo (Gupy/InHire). Todo o fluxo de publicação de vagas, recebimento de candidaturas e gestão do pipeline é feito internamente.

---

## 2. Estrutura de Diretórios

```
careers-portal/
├── .env.local                    # Variáveis de ambiente (nunca commitado)
├── .env.example                  # Template de variáveis
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── middleware.ts                  # Auth guard para /admin/*
├── supabase/
│   └── migrations/               # SQL migrations versionadas
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_seed_data.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (fontes, metadata global)
│   │   ├── page.tsx              # Landing de carreiras (/carreiras)
│   │   ├── vagas/
│   │   │   ├── page.tsx          # Lista de vagas (/carreiras/vagas)
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Vaga individual (/carreiras/vagas/[slug])
│   │   ├── cultura/
│   │   │   └── page.tsx          # Página de cultura (/carreiras/cultura)
│   │   ├── banco-de-talentos/
│   │   │   └── page.tsx          # Cadastro espontâneo
│   │   ├── api/
│   │   │   ├── applications/
│   │   │   │   └── route.ts      # POST candidatura + upload CV
│   │   │   ├── talent-pool/
│   │   │   │   └── route.ts      # POST banco de talentos
│   │   │   └── admin/
│   │   │       ├── jobs/
│   │   │       │   └── route.ts  # CRUD vagas (protegido)
│   │   │       ├── applications/
│   │   │       │   └── route.ts  # Gestão candidaturas (protegido)
│   │   │       └── dashboard/
│   │   │           └── route.ts  # KPIs e métricas (protegido)
│   │   └── admin/
│   │       ├── layout.tsx        # Layout admin (sidebar + auth)
│   │       ├── page.tsx          # Dashboard principal
│   │       ├── vagas/
│   │       │   ├── page.tsx      # Lista de vagas (admin)
│   │       │   ├── nova/
│   │       │   │   └── page.tsx  # Criar vaga
│   │       │   └── [id]/
│   │       │       ├── page.tsx  # Editar vaga
│   │       │       └── candidaturas/
│   │       │           └── page.tsx  # Kanban de candidaturas
│   │       ├── banco-de-talentos/
│   │       │   └── page.tsx      # Gestão do talent pool
│   │       └── configuracoes/
│   │           └── page.tsx      # Configurações gerais
│   ├── components/
│   │   ├── ui/                   # Componentes genéricos (Button, Input, Modal, Badge, etc.)
│   │   ├── public/               # Componentes das páginas públicas
│   │   │   ├── HeroSection.tsx
│   │   │   ├── EVPBlock.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobFilters.tsx
│   │   │   ├── TestimonialCarousel.tsx
│   │   │   ├── ApplicationForm.tsx
│   │   │   ├── ProcessTimeline.tsx
│   │   │   ├── NumbersGrid.tsx
│   │   │   ├── CultureValues.tsx
│   │   │   ├── BenefitsGrid.tsx
│   │   │   └── TalentPoolForm.tsx
│   │   └── admin/                # Componentes do backoffice
│   │       ├── Sidebar.tsx
│   │       ├── JobFormEditor.tsx
│   │       ├── KanbanBoard.tsx
│   │       ├── KanbanColumn.tsx
│   │       ├── CandidateCard.tsx
│   │       ├── StatsCard.tsx
│   │       └── DataTable.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # createBrowserClient
│   │   │   ├── server.ts         # createServerClient (para Server Components / Route Handlers)
│   │   │   └── admin.ts          # createServiceRoleClient (para operações admin)
│   │   ├── utils.ts              # Helpers genéricos (cn, formatDate, slugify)
│   │   ├── constants.ts          # Enums, labels, opções de filtro
│   │   └── validators.ts         # Schemas Zod para validação de forms
│   ├── hooks/
│   │   ├── useJobs.ts            # Fetch e filtro de vagas
│   │   ├── useApplication.ts     # Submit de candidatura
│   │   └── useAdmin.ts           # Operações admin
│   └── types/
│       └── index.ts              # TypeScript types (espelham o schema do banco)
└── public/
    ├── logos/                    # Logos por marca
    ├── icons/                    # Ícones customizados
    └── og/                       # Open Graph images
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

### 4.3 Rotas Admin

| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard com KPIs |
| `/admin/vagas` | Lista de vagas (todas, com filtro por status) |
| `/admin/vagas/nova` | Formulário de criação |
| `/admin/vagas/[id]` | Edição de vaga |
| `/admin/vagas/[id]/candidaturas` | Kanban de candidaturas da vaga |
| `/admin/banco-de-talentos` | Visualização e export do talent pool |
| `/admin/configuracoes` | Configurações gerais |

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
| `JobFormEditor` | `job?: Job, onSubmit` | Criar/editar vaga |
| `KanbanBoard` | `applications: Application[], jobId` | Candidaturas |
| `KanbanColumn` | `stage, applications, onDrop` | Kanban |
| `CandidateCard` | `application: Application` | Kanban |
| `StatsCard` | `title, value, trend?, icon` | Dashboard |
| `DataTable` | `columns, data, pagination` | Várias |

---

## 6. Fluxos Críticos

### 6.1 Candidatura (público)

```
1. Candidato acessa /vagas/[slug]
2. Preenche formulário (ApplicationForm)
3. Upload de CV → Supabase Storage (bucket: resumes/)
4. POST /api/applications → valida com Zod → insere em applications
5. Retorna confirmação visual + (futuro) e-mail automático
6. Candidatura aparece no kanban do admin como "inscrito"
```

### 6.2 Gestão de vaga (admin)

```
1. Admin acessa /admin/vagas/nova
2. Preenche JobFormEditor (título, marca, descrição rich text, etapas do processo)
3. Salva como "rascunho" ou publica diretamente
4. Ao publicar: gera slug, define published_at, vaga aparece no site público
5. Pode pausar/encerrar a qualquer momento
```

### 6.3 Pipeline de candidaturas (admin)

```
1. Admin acessa /admin/vagas/[id]/candidaturas
2. KanbanBoard carrega candidaturas agrupadas por stage
3. Drag-and-drop move candidato entre colunas
4. Ao mover: PUT /api/admin/applications/[id] → atualiza stage + insere em stage_history
5. Click no card abre detalhes + notas + scorecard
```

---

## 7. Variáveis de Ambiente

```env
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_SITE_URL=https://carreiras.welcome.com.br
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# E-mail (Fase 2)
# RESEND_API_KEY=re_...
# EMAIL_FROM=carreiras@welcome.com.br
```

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
    "slugify": "^1.x"
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
