# Portal de Carreiras — Welcome Group

Aplicação Next.js que centraliza as vagas, cultura e banco de talentos das marcas do Welcome Group (Weddings, Trips, WelConnect, Corporativo). Inclui um backoffice completo para RH operar o processo seletivo com Kanban, avaliações por etapa, entrevistas estruturadas (Bar Raiser + Pares + Painel) e pontuação em pilares de cultura BeWelcome.

## Stack

- **Next.js 14** (App Router, Server Components por padrão)
- **TypeScript** estrito
- **Supabase** (PostgreSQL + Auth + Storage)
- **Tailwind CSS** com tokens do design system **Welcome Trips** (ver `DESIGN_SYSTEM_WELCOME_TRIPS.md`)
- **Resend** para e-mails transacionais
- **Vercel** para deploy

## Estrutura do repositório

```
.
├── src/                             # Código da aplicação Next.js
│   ├── app/                          # App Router (público + /admin + /api)
│   ├── components/{public,admin,ui}  # Componentes
│   ├── lib/{supabase,email,...}      # Clientes, helpers, rate limit
│   └── types/                        # Tipos TS espelhando o schema
├── supabase/migrations/              # SQL versionado
├── public/
├── AGENT_INSTRUCTIONS.md             # Regras de código para agentes
├── ARCHITECTURE.md                   # Arquitetura detalhada
├── DESIGN_SYSTEM_WELCOME_TRIPS.md    # Design system oficial
├── PROMPT_CONTEXT.md                 # Contexto de negócio
└── SESSION_STARTER.md                # Prompt para abrir sessão com agente
```

## Como rodar

```bash
cp .env.example .env.local   # preencher as variáveis
npm install
npm run dev                  # http://localhost:3000
```

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (cliente público) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server-side admin) |
| `NEXT_PUBLIC_SITE_URL` | URL canônica (ex: `https://carreiras.welcomegroup.com.br`) |
| `RESEND_API_KEY` | API key do Resend (opcional — se ausente, e-mails viram no-op) |
| `RESEND_FROM_EMAIL` | Remetente dos e-mails transacionais |
| `RESEND_RH_EMAIL` | Destino da notificação de nova candidatura |

## Setup do Supabase

1. Criar projeto no Supabase.
2. No SQL Editor, rodar em ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_data.sql`
   - `supabase/migrations/004_interviews.sql`
3. Em Storage, criar os buckets: `resumes` (private), `talent-pool` (private), `testimonials` (public), `culture` (public).

## Deploy

Configurado para Vercel (veja `vercel.json`). Push em `main` dispara deploy automático. As mesmas envs acima precisam estar configuradas em Project Settings → Environment Variables para Production + Preview + Development.
