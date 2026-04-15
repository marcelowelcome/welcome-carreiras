# AGENT_INSTRUCTIONS.md — Portal de Carreiras Welcome Group

> Regras e diretrizes para o agente de IA que vai implementar o código.  
> **Leia este arquivo INTEIRO antes de escrever qualquer código.**

---

## 1. Regras de Ouro

1. **Nunca crie código sem antes consultar ARCHITECTURE.md.** Estrutura de pastas, schema do banco, rotas e componentes estão definidos lá. Siga à risca.
2. **Um arquivo por vez.** Crie, teste, valide. Só passe para o próximo quando o anterior estiver funcionando.
3. **Não invente dependências.** Use somente as listadas em ARCHITECTURE.md seção 8. Se precisar de algo novo, pergunte antes.
4. **TypeScript strict.** Sem `any`. Sem `@ts-ignore`. Sem `as unknown as`. Se o tipo está errado, corrija a causa, não o sintoma.
5. **Componentes Server por padrão.** Só use `"use client"` quando houver interatividade (state, effects, event handlers). A maioria das páginas públicas deve ser Server Component.

---

## 2. Padrões de Código

### 2.1 Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Arquivos de componente | PascalCase | `JobCard.tsx` |
| Arquivos de lib/utils | camelCase | `validators.ts` |
| Tipos/Interfaces | PascalCase com prefixo descritivo | `Job`, `Application`, `JobFilters` |
| Variáveis e funções | camelCase | `getPublishedJobs()` |
| Constantes | UPPER_SNAKE_CASE | `APPLICATION_STAGES` |
| Enums do banco | snake_case (PostgreSQL) | `welcome_weddings`, `draft` |
| CSS classes | Tailwind utilities | sem CSS custom exceto variáveis de cor |

### 2.2 Estrutura de Componente

```tsx
// 1. Imports (externos → internos → tipos)
import { Suspense } from "react";
import { JobCard } from "@/components/public/JobCard";
import type { Job } from "@/types";

// 2. Types locais (se houver)
interface JobListProps {
  jobs: Job[];
  showBrand?: boolean;
}

// 3. Componente (export default para páginas, named export para componentes)
export function JobList({ jobs, showBrand = true }: JobListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} showBrand={showBrand} />
      ))}
    </div>
  );
}
```

### 2.3 Supabase Queries

Três clientes, cada um com um papel claro:

| Cliente | Onde usar | Papel |
|---|---|---|
| `createServerClient` (SSR com cookies) | Páginas públicas que dependem da sessão do visitante | Anon + cookies, respeita RLS |
| `createBrowserClient` (anon) | Leituras/escritas públicas em Client Components (ex: formulários públicos que só leem metadados) | Anon, respeita RLS |
| `createServiceRoleClient` | **Tudo do admin**: páginas em `/admin/*` e rotas `/api/admin/*` | Bypassa RLS. Seguro porque `middleware.ts` já bloqueia acesso não-autenticado. **Nunca importar em Client Component.** |

**Padrão do admin — leitura:**
```tsx
// src/app/admin/candidaturas/page.tsx
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic"; // obrigatório em toda página admin

export default async function Page() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("applications").select("*");
  if (error) console.error("[admin/candidaturas]", error); // loga erros
  return <Table data={data ?? []} />;
}
```

**Padrão do admin — escrita (sempre via API route, nunca direto do browser):**
```tsx
// src/app/api/admin/applications/[id]/route.ts
import { createServiceRoleClient } from "@/lib/supabase/admin";
export async function PATCH(req: Request, { params }) {
  const supabase = createServiceRoleClient();
  // ... update ...
}

// No componente Client, chame via fetch:
await fetch(`/api/admin/applications/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ stage: "entrevista" }),
});
```

Por que: o anon client no browser depende de a sessão Supabase Auth traduzir no servidor para role `authenticated`. Isso falha silenciosamente em produção e os writes somem. O middleware já garante auth na borda, e o service role via API é confiável.

**Para arquivos privados do Storage:**
- Não use URL direta `/storage/v1/object/authenticated/...` — ela exige header `Authorization` que o browser não envia.
- Use a rota `/api/admin/resumes?path=...` que gera uma **signed URL** curta (60s) via service role e redireciona.

```tsx
// ❌ ERRADO — Nunca use service role key no client ou em Client Component
// ❌ ERRADO — Links diretos para /storage/v1/object/authenticated/...
```

### 2.4 Validação com Zod

Todo input de formulário (candidatura, banco de talentos, criação de vaga) deve ser validado com Zod tanto no client quanto no API route.

```tsx
// src/lib/validators.ts
import { z } from "zod";

export const applicationSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  cover_letter: z.string().max(2000).optional(),
  salary_expectation: z.string().optional(),
  referral_source: z.enum(["linkedin", "instagram", "indicacao", "site", "google", "job_board", "outro"]),
});

// No API route:
const parsed = applicationSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
}
```

### 2.5 Error Handling

```tsx
// API Routes: sempre retorne JSON estruturado
try {
  // operação
  return NextResponse.json({ data: result }, { status: 200 });
} catch (error) {
  console.error("[API] Erro:", error);
  return NextResponse.json(
    { error: "Erro interno. Tente novamente." },
    { status: 500 }
  );
}

// Client: use toast para feedback
import toast from "react-hot-toast";

try {
  await submitApplication(formData);
  toast.success("Candidatura enviada com sucesso!");
} catch {
  toast.error("Erro ao enviar candidatura. Tente novamente.");
}
```

---

## 3. Regras de Estilo (Tailwind)

### 3.1 Design Tokens

> **O design system de Welcome Trips ([DESIGN_SYSTEM_WELCOME_TRIPS.md](DESIGN_SYSTEM_WELCOME_TRIPS.md)) é a linguagem visual de TODO o portal de carreiras** (decisão de 2026-04-14). Use sempre os tokens `wt.*`, fontes `font-wt-heading`/`font-wt-body`, background `bg-wt-off-white`, CTAs `bg-wt-orange` (urgência) e variante outline (`border-wt-gray-700` → hover `bg-wt-primary`). Os tokens de marca (`weddings`, `trips`, `welconnect`, `corporativo`) ficam apenas para **badges** dentro de vagas/depoimentos. Os tokens do sistema antigo (`primary`, `accent`, `muted`, `border`, etc.) permanecem definidos por compatibilidade, mas **não devem ser usados em código novo**.

```ts
// Cores por marca
const brandColors = {
  weddings: { DEFAULT: "#C4A882", light: "#F5EDE4", dark: "#8B6E4E" },
  trips: { DEFAULT: "#0091B3", light: "#E6F5F9", dark: "#007A99" }, // teal oficial — ver DESIGN_SYSTEM_WELCOME_TRIPS.md
  welconnect: { DEFAULT: "#5B9A6B", light: "#E8F5EC", dark: "#3A6B47" },
  corporativo: { DEFAULT: "#1A1A2E", light: "#F2F2F5", dark: "#0D0D1A" },
};

// Cores do sistema (portal multi-marca / admin)
const systemColors = {
  primary: "#1A1A2E",
  accent: "#D4A574",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  muted: "#6B7280",
};

// Welcome Trips — design system completo (namespace wt.*)
// Fonte de verdade: DESIGN_SYSTEM_WELCOME_TRIPS.md
const wtColors = {
  primary: "#0091B3",
  "primary-dark": "#007A99",
  "primary-light": "#E6F5F9",
  "teal-deep": "#0D5257",
  "teal-mid": "#00968F",
  yellow: "#F6BE00",
  orange: "#EA7600",   // CTA quente / urgência
  red: "#D14124",
  "off-white": "#F8F7F4", // background padrão das páginas WT (NÃO branco puro)
  "gray-100": "#F2F0ED",
  "gray-300": "#D1CCC5",
  "gray-500": "#8A8580",
  "gray-700": "#4A4540", // texto corpo
  black: "#1A1A1A",
};
```

```ts
// tailwind.config.ts — extras para Welcome Trips
extend: {
  colors: { ...brandColors, ...systemColors, wt: wtColors },
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    "wt-heading": ["Nunito Sans", "Avenir Next", "system-ui", "sans-serif"],
    "wt-body": ["Nunito Sans", "Avenir Next", "system-ui", "sans-serif"],
  },
  borderRadius: {
    "wt-sm": "6px",
    "wt-md": "12px",
    "wt-lg": "16px",
    "wt-xl": "24px",
  },
  boxShadow: {
    "wt-sm": "0 1px 3px rgba(0, 0, 0, 0.06)",
    "wt-md": "0 4px 12px rgba(0, 0, 0, 0.08)",
    "wt-lg": "0 8px 24px rgba(0, 0, 0, 0.1)",
  },
  maxWidth: {
    "wt-container": "1280px",
  },
}
```

> **Use `wt.*` em todo lugar.** Site público (home, /vagas, /cultura, /banco-de-talentos) aplica o design system completo. Admin aplica o mesmo sistema com densidade funcional (sem hover translateY em forms/tabelas internos, mas headings em `font-wt-heading text-wt-teal-deep` e sidebar com active state em `bg-wt-primary-light`).

### 3.2 Regras de Layout

- **Container máximo:** `max-w-wt-container mx-auto px-6` (1280px)
- **Spacing entre seções:** `py-20 sm:py-24` (mínimo 64px vertical)
- **Cards:** `rounded-wt-md bg-white shadow-wt-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-wt-lg`
- **Mobile-first:** sempre comece pelo layout mobile e adicione breakpoints (`sm:`, `md:`, `lg:`)
- **Sem CSS custom:** tudo via Tailwind utilities.

### 3.3 Tipografia

- **Headings:** `font-wt-heading font-bold tracking-tight text-wt-teal-deep` (use `font-black` para hero)
- **Eyebrow / pré-título:** `font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary`
- **Body:** `font-wt-body text-wt-gray-700 leading-relaxed`
- **Labels:** `font-wt-heading text-xs font-semibold uppercase tracking-[0.08em] text-wt-gray-700`
- **Captions:** `text-xs text-wt-gray-500`
- **CTAs:** uppercase, `tracking-[0.05em]`–`tracking-[0.1em]`, peso bold

---

## 4. Regras de Segurança

### 4.1 Upload de Arquivos

```tsx
// SEMPRE valide:
// 1. Tipo do arquivo (apenas PDF para currículos)
// 2. Tamanho máximo (5MB)
// 3. Sanitize o nome do arquivo

const ALLOWED_MIME = ["application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type)) return "Apenas arquivos PDF";
  if (file.size > MAX_SIZE) return "Arquivo deve ter no máximo 5MB";
  return null;
}

// Nome do arquivo no storage: use UUID, não o nome original
const filePath = `resumes/${jobId}/${crypto.randomUUID()}.pdf`;
```

### 4.2 Middleware de Auth (Admin)

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Protege todas as rotas /admin/*
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Verifica sessão Supabase
    // Redireciona para login se não autenticado
  }
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
```

### 4.3 Sanitização

- Rich text (descrição de vaga): sanitize HTML antes de salvar no banco. Use DOMPurify ou similar.
- Inputs de texto: trim + escape antes de queries.
- Nunca interpole variáveis diretamente em SQL — use sempre o query builder do Supabase.

### 4.4 Rate Limit em endpoints públicos

Use o helper `checkRateLimit` de `src/lib/rate-limit.ts` em toda rota pública que grava dados. Fail-open (se Supabase errar, passa).

```ts
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const ip = getClientIp(request);
const rate = await checkRateLimit({
  ip,
  endpoint: "applications",
  maxRequests: 5,
  windowSeconds: 15 * 60,
});
if (!rate.ok) return NextResponse.json({ error: "..." }, { status: 429 });
```

### 4.5 Validação de upload de PDF

`File.type` mente — use magic bytes. `isPdfByMagic(file)` em `src/lib/file-validation.ts` confirma que o arquivo começa com `%PDF-`.

```ts
import { isPdfByMagic } from "@/lib/file-validation";
if (!(await isPdfByMagic(resume))) {
  return NextResponse.json({ error: "PDF inválido" }, { status: 400 });
}
```

### 4.6 E-mails transacionais

Sempre fire-and-forget para não bloquear a resposta HTTP.

```ts
import { sendEmail, RH_EMAIL } from "@/lib/email/resend";
import { applicationConfirmationEmail } from "@/lib/email/templates";

const mail = applicationConfirmationEmail({ ... });
void sendEmail({ to: candidateEmail, subject: mail.subject, html: mail.html });
```

`sendEmail` já é idempotente: se `RESEND_API_KEY` não está setado, ele loga um warn e retorna `null` sem quebrar nada.

---

## 5. SEO e Performance

### 5.1 Metadata

Cada página pública deve ter metadata dinâmica:

```tsx
// src/app/vagas/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);
  return {
    title: `${job.title} | Carreiras Welcome Group`,
    description: `Vaga de ${job.title} na ${brandLabel(job.brand)}. ${job.location} · ${contractLabel(job.contract_type)}`,
    openGraph: {
      title: `${job.title} | Welcome Group`,
      description: job.description.substring(0, 160),
      type: "website",
    },
  };
}
```

### 5.2 Schema Markup (JobPosting)

Cada página de vaga deve incluir JSON-LD:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: job.description,
      datePosted: job.published_at,
      validThrough: job.closes_at,
      employmentType: mapContractToSchema(job.contract_type),
      hiringOrganization: {
        "@type": "Organization",
        name: "Welcome Group",
        sameAs: "https://welcome.com.br",
      },
      jobLocation: {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressLocality: job.location },
      },
    }),
  }}
/>
```

### 5.3 Performance

- **Imagens:** use `next/image` com `loading="lazy"` e formatos modernos (WebP)
- **Fontes:** use `next/font` (Inter ou a fonte do grupo)
- **Paginação:** 12 vagas por página, com cursor-based pagination no Supabase
- **ISR:** considere `revalidate: 300` (5 min) para páginas de lista de vagas

---

## 6. Ordem de Implementação (Fase 1 — MVP)

Execute nesta sequência. Cada passo deve compilar e funcionar antes de avançar.

```
SETUP
  ├─ 01. Inicializar projeto Next.js 14 + TypeScript + Tailwind
  ├─ 02. Configurar Supabase (projeto, variáveis .env)
  ├─ 03. Rodar migrations SQL (schema + RLS + seed)
  ├─ 04. Criar lib/supabase/ (client.ts, server.ts, admin.ts)
  ├─ 05. Criar types/index.ts (espelhar schema)
  └─ 06. Criar lib/constants.ts + lib/validators.ts

PÁGINAS PÚBLICAS
  ├─ 07. Layout raiz (fontes, metadata, nav, footer)
  ├─ 08. Landing de carreiras (/) — Server Component
  │     ├─ HeroSection
  │     ├─ EVPBlock + NumbersGrid
  │     ├─ Vagas em destaque (JobCard)
  │     └─ TestimonialCarousel + CTA
  ├─ 09. Lista de vagas (/vagas) — Server Component + Client filters
  │     ├─ JobFilters (Client)
  │     └─ JobCard grid
  ├─ 10. Página de vaga (/vagas/[slug]) — Server Component
  │     ├─ Cabeçalho + descrição
  │     ├─ ProcessTimeline
  │     └─ ApplicationForm (Client)
  ├─ 11. API Route: POST /api/applications
  │     ├─ Validação Zod
  │     ├─ Upload CV para Supabase Storage
  │     └─ Insert em applications
  └─ 12. Página de banco de talentos (/banco-de-talentos)
        └─ TalentPoolForm + API Route

ADMIN
  ├─ 13. Middleware de auth
  ├─ 14. Layout admin (Sidebar + proteção)
  ├─ 15. Dashboard (/admin) — StatsCards com KPIs
  ├─ 16. Lista de vagas admin (/admin/vagas) — DataTable
  ├─ 17. Criar/editar vaga (/admin/vagas/nova e /admin/vagas/[id])
  │     └─ JobFormEditor (rich text simplificado)
  └─ 18. Kanban de candidaturas (/admin/vagas/[id]/candidaturas)
        ├─ KanbanBoard + KanbanColumn
        ├─ CandidateCard + drag-and-drop
        └─ API Routes de update

FINALIZAÇÃO
  ├─ 19. SEO (metadata dinâmica, JSON-LD, sitemap.xml)
  ├─ 20. Seed data (vagas fictícias para demo)
  └─ 21. Deploy Vercel + DNS
```

---

## 7. O que NÃO fazer

| ❌ Não faça | ✅ Faça em vez |
|------------|---------------|
| Instalar Prisma/Drizzle | Usar query builder Supabase direto |
| Criar auth custom | Usar Supabase Auth |
| Usar `getServerSideProps` (Pages Router) | Usar Server Components (App Router) |
| Hardcodar labels em português nos componentes | Usar `constants.ts` com mapas de labels |
| Criar CSS modules ou styled-components | Usar Tailwind utilities |
| Salvar currículo com nome original do arquivo | Usar UUID como filename |
| Fazer fetch no useEffect para dados iniciais | Usar Server Components com async/await |
| Instalar react-beautiful-dnd | Usar @dnd-kit (ativo, acessível) |
| Criar mais de 1 arquivo por sessão sem testar | Criar → testar → avançar |

---

## 8. Convenções de Commit

```
feat: add job listing page with filters
fix: resolve file upload validation on mobile
style: adjust card spacing on job detail page
refactor: extract Supabase queries to lib/queries
chore: update dependencies
docs: add API documentation for applications endpoint
```

---

## 9. Checklist Pré-PR

Antes de considerar qualquer feature "pronta":

- [ ] Compila sem erros (`npm run build`)
- [ ] Sem warnings de TypeScript
- [ ] Responsivo (testar em 375px, 768px, 1280px)
- [ ] Validação de formulário funciona (campos obrigatórios, formatos)
- [ ] Loading states para operações assíncronas
- [ ] Error states para falhas de rede/API
- [ ] Metadata/SEO presente (para páginas públicas)
- [ ] Console limpo (sem logs de debug, sem erros)
