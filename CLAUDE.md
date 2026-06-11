# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build (also type-checks)
npm run lint       # ESLint
npx tsc --noEmit   # Type-check without building
```

There are no automated tests. Validate changes by running the dev server and exercising the affected pages.

---

## Stack

- **Next.js 14** — App Router, Server Components by default. Use `"use client"` only when state/effects/event handlers are needed.
- **TypeScript strict** — no `any`. Path alias `@/*` → `src/*`.
- **Supabase** — PostgreSQL + Auth + Storage. Three client modes (see below).
- **Tailwind CSS** — utilities only, no custom CSS files.
- **Zod** — validation on every form (client-side pre-submit + API route).
- **Resend** — transactional email via `src/lib/email/`.
- **Vercel** — deploy target; ISR (`revalidate = 300`) on public pages.

---

## Supabase Client Rules

Three clients live in `src/lib/supabase/`:

| File | Key | When to use |
|---|---|---|
| `client.ts` | anon | Client components on public pages |
| `server.ts` | anon + cookies | Server Components reading public data |
| `admin.ts` | service role | **All admin API routes and any write that needs to bypass RLS** |

**Critical**: `createBrowserClient()` runs as `anon`. RLS on `culture_content` only allows SELECT where `is_visible = true` for anon. Use `createServiceRoleClient()` when you need to read rows regardless of their visibility (e.g., admin pages, settings toggles read from public pages). Never expose the service role key to the client.

---

## Authentication

Auth is **Azure AD SSO via Supabase OAuth** (Microsoft Entra ID). No email/password.

- Login page: `src/app/(admin-auth)/admin/login/page.tsx` — calls `supabase.auth.signInWithOAuth({ provider: "azure" })`
- Callback: `src/app/auth/callback/route.ts` — exchanges code for session, sets cookies
- **Middleware** (`middleware.ts`) protects `/admin/*` and `/api/admin/*`. Unauthenticated requests are redirected to `/admin/login` (pages) or receive 401 JSON (API routes).
- Admin API routes rely entirely on middleware for auth. They use service role for all DB ops and do **not** call `getUser()` again internally.

---

## API Route Conventions

**Public routes** (`src/app/api/` — not under `admin/`):
- Rate-limited via `checkRateLimit()` (sliding window in Supabase `rate_limit_log`)
- PDF upload validated by magic bytes (`isPdfByMagic`) in `src/lib/file-validation.ts`
- Use service role for writes

**Admin routes** (`src/app/api/admin/`):
- Middleware already verified auth — no need to call `getUser()` again
- Always use `createServiceRoleClient()`
- Return `NextResponse.json({ error: error.message }, { status: 500 })` on DB failure
- All admin pages/routes export `export const dynamic = "force-dynamic"` and the middleware sets `Cache-Control: no-store`

**Settings/toggles stored in `culture_content`** using `section_key` as a namespace (e.g. `testimonials_section`). Use `/api/admin/settings/[key]` (GET/PATCH) to read/write them. Public pages must read these with `createServiceRoleClient()` to bypass the RLS `is_visible = true` filter.

---

## Design System

All public UI uses the Welcome Trips design tokens (prefix `wt-`). Key tokens:

- **Colors**: `wt-primary` (#0091B3), `wt-teal-deep` (#0D5257), `wt-yellow` (#F6BE00), `wt-orange` (#EA7600), `wt-off-white` (#F8F7F4)
- **Radii**: `rounded-wt-sm` / `wt-md` / `wt-lg`
- **Shadows**: `shadow-wt-sm` / `wt-md` / `wt-lg`
- **Typography**: `font-wt-heading` (Nunito Sans), `font-wt-body`
- **Container**: `max-w-wt-container` (1280px)
- **CTA buttons**: always `bg-wt-orange text-white`
- **Brand accent per brand**: `BRAND_COLORS[brand].text/badge/bg` from `src/lib/constants.ts`

Never hardcode brand colors. Use `BRAND_LABELS`, `BRAND_COLORS`, `BRAND_ICONS` from constants.

---

## Domain Model

**Brands**: `welcome_trips | welcome_weddings | corporativo | welcome_group`
*(Note: `welcome_group` exists in code/validators but the DB enum still has `corporativo`. A migration is pending to rename it.)*

**Application flow**: `inscrito → triagem → entrevista → desafio → proposta → contratado` (or `reprovado`). Stage changes insert into `stage_history`.

**Interviews** are separate from applications. After moving to `entrevista`, create `interviews` rows: `bar_raiser`, `par_1–3`, `painel_decisao`. Each has a `vote` + per-pillar JSONB scores.

**Culture content** is stored dynamically in the `culture_content` table (keyed by `section_key`). Special keys like `testimonials_section` store visibility toggles rather than rendered content.

**Talent pool** and **applications** are entirely separate tables — talent pool entries don't auto-surface as candidates for jobs.

---

## Form Validation Pattern

All forms use Zod schemas from `src/lib/validators.ts` on both client (pre-submit) and server (API route). The three schemas are `applicationSchema`, `talentPoolSchema`, `jobFormSchema`. Always run `safeParse` and return field-level errors.

---

## Key Migrations

| File | Contents |
|---|---|
| `001_initial_schema.sql` | Enums + all tables |
| `002_rls_policies.sql` | RLS — anon can read published jobs and insert applications; authenticated (= admin) gets full access |
| `003_seed_data.sql` | Demo testimonials, culture content, 4 sample jobs |
| `004_interviews.sql` | `interviews` table + `rate_limit_log` |
| `005_lgpd.sql` | `lgpd_requests` table |

Pending (not yet applied): rename DB enum value `corporativo` → `welcome_group`.

---

## Email

Templates in `src/lib/email/templates.ts`. Sent via `src/lib/email/resend.ts`. Two transactional flows:
- `POST /api/applications` → sends confirmation to candidate + notification to HR (`RESEND_RH_EMAIL`)
- `POST /api/talent-pool` → sends welcome email to candidate + notification to HR
