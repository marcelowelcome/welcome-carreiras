# Relatório de Auditoria — Welcome Carreiras

**Data:** 10 de junho de 2026
**Versão auditada:** branch `main` (commit `7a9f719`)
**Dimensões auditadas:** UX/Fluxo de candidato, UI/Design System, Segurança/Regras de Negócio

---

## 1. Resumo Executivo

O portal está funcional e a arquitetura geral é sólida, mas acumula um conjunto significativo de vulnerabilidades de segurança e falhas de regras de negócio que precisam ser resolvidas antes de qualquer campanha de divulgação ou aumento de tráfego. Os problemas mais graves incluem payloads não validados sendo inseridos diretamente no banco, uma rota de open redirect no callback de autenticação, ausência de unique constraint em candidaturas (permitindo spam no pipeline de RH), e divergência entre o enum `brand` do banco e o código TypeScript que já provoca falhas silenciosas de insert. Na camada de UX, erros de rede são silenciados em quase todos os fluxos principais — candidatos e administradores ficam sem feedback em falhas críticas. O design system tem desvios sistemáticos nos componentes admin e alguns problemas de acessibilidade com impacto legal (LGPD + WCAG).

---

## 2. Placar por Dimensão

| Dimensão | Críticos | Importantes | Melhorias | Total |
|---|---|---|---|---|
| UX | 11 | 16 | 10 | 37 |
| UI / Design System | 3 | 11 | 9 | 23 |
| Segurança | 5 | 9 | 2 | 16 |
| Regras de Negócio | 3 | 10 | 6 | 19 |
| **Total** | **22** | **46** | **27** | **95** |

---

## 3. Achados Críticos

### 3.1 Segurança

---

#### SEC-001 — Payload bruto passado diretamente para INSERT/UPDATE no banco (múltiplas rotas admin)

**Rotas afetadas:**
- `src/app/api/admin/settings/[key]/route.ts` — PATCH
- `src/app/api/admin/culture/[id]/route.ts` — PATCH
- `src/app/api/admin/testimonials/route.ts` — POST
- `src/app/api/admin/testimonials/[id]/route.ts` — PATCH

O corpo da requisição é lido como JSON bruto e espalhado diretamente na chamada `.update()` ou `.insert()` sem nenhuma validação ou allowlist de campos. Qualquer administrador autenticado pode enviar campos arbitrários (`section_key`, `sort_order`, colunas de controle) que são repassados ao banco.

**Correção:** Definir schemas Zod explícitos para cada rota e usar `result.data` — nunca o payload bruto — em todas as chamadas ao banco.

---

#### SEC-002 — Zod validado mas `result.data` descartado — payload original inserido no banco

**Rotas afetadas:**
- `src/app/api/admin/jobs/route.ts` — POST
- `src/app/api/admin/jobs/[id]/route.ts` — PATCH

O schema `jobFormSchema` é verificado via `safeParse`, mas `result.data` é descartado e o `payload` original não sanitizado é passado para `.insert(payload)` / `.update(payload)`. Um administrador pode enviar campos extras como `created_by`, `published_at`, `status` ou `slug` contornando as regras de negócio.

**Correção:** Substituir `.insert(payload)` por `.insert(result.data)` e `.update(payload)` por `.update(result.data)`. Remover do schema campos de controle que devem ser gerados server-side (`published_at`, `created_by`).

---

#### SEC-003 — Rota `/admin` exata não coberta pelo matcher do middleware

**Arquivo:** `middleware.ts`

O matcher `['/admin/:path*', '/api/admin/:path*']` exige ao menos um segmento após `/admin`. Uma requisição para exatamente `/admin` não casa com nenhuma regra, expondo o dashboard publicamente.

**Correção:** `matcher: ['/admin', '/admin/:path*', '/api/admin/:path*']`.

---

#### SEC-004 — Open redirect via parâmetro `?next=` no callback de autenticação

**Arquivo:** `src/app/auth/callback/route.ts`

O parâmetro `?next=` é usado diretamente sem validação: `NextResponse.redirect(\`${origin}${next}\`)`. Permite construir `/auth/callback?code=...&next=//evil.com` para phishing pós-login.

**Correção:** `const safePath = next.startsWith('/') && !next.startsWith('//') ? next : '/admin'`

---

#### SEC-005 — Qualquer conta Supabase autenticada acessa o admin sem verificação de papel

**Arquivos:** `middleware.ts`, `002_rls_policies.sql`

O middleware verifica apenas `user != null`. Políticas RLS usam `USING (true)`. Qualquer usuário autenticado obtém acesso total.

**Correção:** Verificar domínio no middleware (`user.email?.endsWith('@welcometrips.com.br')`) ou custom claims Supabase (`app_metadata.role = 'admin'`).

---

### 3.2 Regras de Negócio

---

#### RN-001 — Candidato pode se inscrever múltiplas vezes na mesma vaga

**Arquivo:** `src/app/api/applications/route.ts`

Não existe unique constraint em `(job_id, email)`. Candidato pode submeter dezenas de candidaturas para a mesma vaga.

**Correção:** Migration: `ALTER TABLE applications ADD CONSTRAINT uq_application_job_email UNIQUE (job_id, email)`. Tratar error code `23505` com HTTP 409.

---

#### RN-002 — Candidaturas aceitas em vagas fechadas, pausadas, inexistentes ou expiradas

**Arquivo:** `src/app/api/applications/route.ts`

A rota aceita candidaturas sem verificar o status da vaga. No caso de UUID inexistente, o CV já foi enviado ao storage antes de a FK falhar — cria CVs órfãos.

**Correção:** Consultar `jobs` verificando `status = 'published'` antes do upload. Atualizar RLS policy com `WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND status = 'published'))`.

---

#### RN-003 — Enum `brand` diverge entre banco e código TypeScript/Zod

**Arquivos:** `001_initial_schema.sql`, `src/types/index.ts`, `src/lib/validators.ts`

DB tem `welconnect` e `corporativo`. TypeScript/Zod usa `welcome_group`. Qualquer insert com `brand='welcome_group'` falha silenciosamente.

**Correção:** `ALTER TYPE brand RENAME VALUE 'welconnect' TO 'welcome_group'` e resolver `corporativo` → `welcome_group` na mesma migration.

---

### 3.3 UX Crítico

---

#### UX-001 — Erro de rede na home e em `/vagas` é silenciado

Falha de banco é indistinguível de "zero vagas" — candidato vê página vazia sem explicação.

**Correção:** Capturar `error` do Supabase e renderizar bloco de erro explícito.

#### UX-002 — Filtros de vagas desaparecem durante hidratação (`fallback={null}`)

Controles de filtro somem abruptamente em conexões lentas. **Correção:** Skeleton de filtros.

#### UX-003 — Estado de erro da candidatura não reseta e sem acessibilidade

Erro fica travado sem `role="alert"` ou foco automático. **Correção:** Reset no início de `handleSubmit`, `role="alert"` + `aria-live="assertive"`.

#### UX-004 — Sucesso na candidatura é dead-end sem link de saída

**Correção:** Adicionar "Ver outras vagas" e "Voltar para a home" no estado de sucesso.

#### UX-015 — Formulário LGPD sem try/catch — erro de rede trava UI para sempre

**Correção:** Try/catch em torno do `fetch` + mensagem de erro + `AbortController`.

#### UX-019 — Dashboard admin mostra zeros sem distinguir dado real de falha de banco

**Correção:** Banner de alerta quando queries Supabase retornam erro.

#### UX-020 — Dois botões de submit com spinner idêntico — admin não sabe qual ação está em progresso

**Correção:** Estado ternário `null | 'draft' | 'publish'` em vez de booleano.

#### UX-021 — Nenhum aviso de mudanças não salvas ao navegar para fora do editor de vaga

**Correção:** Estado `isDirty` + prompt de confirmação no `beforeunload`.

#### UX-027 — Mover candidato no Kanban fecha o drawer sem verificar sucesso

**Correção:** `await` + verificar `res.ok` antes de `onClose()`.

#### UX-028 — Notas internas salvas sem verificar `res.ok` — dados perdidos silenciosamente

**Correção:** Verificar `res.ok`; exibir erro inline se falhar.

#### UX-029 — Drag-and-drop do Kanban sem suporte a teclado

**Correção:** Adicionar `KeyboardSensor` ao `@dnd-kit`.

---

### 3.4 UI Crítico

---

#### UI-001 — Nunito Sans carregada sem pesos 800 e 900 — `font-black` não funciona

**Arquivo:** `src/app/layout.tsx`. Componentes com `font-black` recebem fallback para 700.

**Correção:** Adicionar `'800'` e `'900'` ao array `weight` do `Nunito_Sans`.

#### UI-009 — Ausência de `prefers-reduced-motion` em marquee, animações e contadores

`BenefitsCarousel` (marquee 40s contínuo), `PurposeSection` (IntersectionObserver), `useCountUp` (rAF) sem guards.

**Correção:** `motion-reduce:animate-none` no marquee; guards `matchMedia('(prefers-reduced-motion: reduce)')` nos demais.

---

## 4. Achados Importantes

### 4.1 UX

- **UX-005** — Estado vazio de vagas não distingue "zero vagas" de erro de banco
- **UX-006** — `responsibilities` e `requirements_must` renderizados incondicionalmente mesmo vazios
- **UX-007** — `JobCard` usa "Explore" em inglês — única string em inglês na interface pública
- **UX-008** — Busca opera apenas no título mas o placeholder implica busca mais ampla
- **UX-011** — Banco de talentos não diferencia email duplicado de erro genérico
- **UX-012** — Sucesso no banco de talentos sem ação de continuidade
- **UX-013** — Checkboxes de áreas de interesse sem estado visual "checked" distinto
- **UX-016** — Página LGPD sem número de protocolo e sem link para política de privacidade
- **UX-017** — Link "Meus dados (LGPD)" apenas no footer — invisível em mobile (risco de conformidade)
- **UX-022** — Publicar vaga com data de fechamento no passado é permitido sem aviso
- **UX-023** — Ação "Encerrar vaga" usa ícone de lixeira `<Trash2>` — semanticamente ambíguo
- **UX-024** — Duplicar vaga sem loading state — admin pode criar múltiplas cópias
- **UX-030** — Rollback do Kanban após erro é silencioso — admin não percebe a falha
- **UX-031** — Formulário de entrevista sem validação — entrevista vazia pode ser salva
- **UX-032** — Erro ao salvar entrevista silenciado
- **UX-033** — `CandidateDrawer` sem trap de foco, sem `role="dialog"`, Escape não fecha
- **UX-036** — Toggle de visibilidade de depoimento sem loading state nem tratamento de erro
- **UX-037** — `handleSave` e `handleAdd` de depoimentos não verificam `res.ok`
- **UX-038** — `AddTestimonialForm` reseta e fecha antes da resposta do servidor
- **UX-039** — Alteração de visibilidade no `CultureEditor` não indica estado "não salvo"
- **UX-040** — Remover item/categoria do editor de cultura sem confirmação nem undo
- **UX-041** — `CultureEditor` oculta seções sem registro no banco sem avisar o admin
- **UX-042** — Nenhum feedback de sucesso ao salvar depoimento ou seção de cultura
- **UX-043** — Logout sem confirmação próximo ao link "Configurações" — clique acidental

### 4.2 UI / Design System

- **UI-002** — Valores hex hardcoded no `globals.css`
- **UI-003** — `JobFormEditor` usa classes Tailwind genéricas em vez de tokens `wt-*`
- **UI-004** — `JOB_STATUS_COLORS`, `APPLICATION_STAGE_COLORS` usam cores genéricas
- **UI-005** — Múltiplos componentes admin com `rounded-xl`, `bg-gray-50` sem tokens `wt-*`
- **UI-006** — `VerticalsCards` mistura namespaces de cor: `wt-*`, `weddings-*` e `teal-mid`
- **UI-007** — Cards `bg-white` sem `bg-wt-off-white` explícito na section pai
- **UI-008** — Headings das páginas admin sem `font-wt-heading`
- **UI-010** — Nav mobile sem `aria-expanded` e sem indicação de rota ativa
- **UI-011** — Sidebar admin sem `aria-current` e `aria-label`
- **UI-012** — Carousel sem `aria-live` — mudança de depoimento não anunciada por screen readers

### 4.3 Segurança

- **SEC-006** — Rate limiting fail-open e IP spoofável via `X-Forwarded-For`
- **SEC-007** — Path de storage público sem restrição de prefixo na RLS policy
- **SEC-008** — URL de currículo gerada sem verificar ownership da candidatura
- **SEC-009** — Mensagens de erro internos do Supabase retornadas ao cliente
- **SEC-010** — Upload de CVs pode ser sobrescrito por path adivinhado
- **SEC-012** — `RH_EMAIL` sem fallback válido — notificações silenciosamente descartadas

### 4.4 Regras de Negócio

- **RN-004** — CVs do bucket `talent-pool` não apagados na exclusão LGPD (retenção indevida)
- **RN-005** — `resolved_by` não registrado ao resolver LGPD — trilha de auditoria incompleta
- **RN-006** — `lgpd_consent` não persistido na tabela `talent_pool`
- **RN-007** — Coluna `lgpd_consent_at` não existe em `applications` no banco
- **RN-008** — Score aceita qualquer número sem validação do range 1-5
- **RN-009** — Erros de banco em `settings/[key]` ignorados — sempre retorna 200
- **RN-010** — `sort_order` de novo depoimento sempre 0 por bug na API do Supabase
- **RN-011** — Vagas não fecham automaticamente ao atingir `closes_at`
- **RN-012** — RLS autentica qualquer usuário Supabase sem distinção de papel
- **RN-013** — RLS permite DELETE direto de vagas com candidaturas ativas
- **RN-014** — Campos de texto sem limite máximo de comprimento

---

## 5. Melhorias Recomendadas

### 5.1 UX
- UX-009 — Indicador de progresso / tempo estimado no formulário de candidatura
- UX-010 — Botão para remover arquivo selecionado no upload de CV
- UX-014 — Banco de talentos sem prazo ou frequência de contato
- UX-018 — Formulário LGPD sem tipo "correção de dados" (retificação)
- UX-025 — Editor de vaga sem preview da página pública
- UX-026 — Admin sidebar sem versão mobile (drawer)
- UX-044 — Login SSO sem mensagem contextual ao vir de rota protegida
- UX-045 — Kanban sem estado vazio diferenciado por coluna
- UX-046 — Nav pública sem highlight de rota ativa
- UX-047 — Menu mobile não fecha com Escape e sem gestão de foco
- UX-048 — "Seis princípios" hardcoded quando count é dinâmico

### 5.2 UI
- UI-013 — Divs decorativas sem `aria-hidden="true"`
- UI-014 — Links e botões sem `focus-visible` customizado
- UI-015 — Badge "Nosso Propósito" com potencial contraste insuficiente (2.5:1 vs 4.5:1 WCAG)
- UI-016 — Primeiro `<ul>` do `BenefitsCarousel` sem `aria-label`
- UI-017 — Estatísticas hardcoded na `CountersStrip` com dados placeholder
- UI-018 — Sidebar admin sem responsividade mobile
- UI-019 — Footer com "WelConnect" divergindo de `BRAND_LABELS`
- UI-021 — `opengraph-image.tsx` duplica tokens de cor como hex hardcoded
- UI-022 — `LP_LogoGroup.png` 1080×1080 renderizado a 120px — substituir por versão cortada
- UI-023 — Delays de animação misturados: escala padrão + arbitrário `delay-[400ms]`

### 5.3 Segurança
- SEC-011 — `siteUrl` e `adminUrl` interpolados sem sanitização em templates de e-mail

### 5.4 Regras de Negócio
- RN-015 — Parâmetro `status` em GET `/api/admin/jobs` sem validação de enum; sem paginação
- RN-016 — Tabela `testimonials` sem coluna `updated_at` e sem trigger
- RN-017 — Criação de buckets de storage comentada na migration — depende de passo manual
- RN-018 — Sem políticas UPDATE/DELETE para admins na tabela `talent_pool`
- RN-019 — `closes_at` aceita qualquer string sem validar que seja data futura
- RN-020 — `rate_limit_log` cresce indefinidamente sem mecanismo de limpeza

---

## 6. Próximos Passos

### Prioridade 1 — Segurança e Integridade de Dados (antes de qualquer campanha)

1. **SEC-002 + SEC-001:** Usar `result.data` nas chamadas ao banco; schemas Zod para todas as rotas admin sem validação.
2. **SEC-004:** Uma linha no `auth/callback/route.ts` — validação do parâmetro `next`.
3. **SEC-003:** Adicionar `/admin` ao array `matcher` do middleware.
4. **RN-003:** Migration de renomeação do enum `brand` (`welconnect` → `welcome_group`).
5. **RN-001 + RN-002:** Unique constraint `(job_id, email)` + validação de status da vaga.
6. **RN-007 + RN-006:** Migrations para `lgpd_consent_at` em `applications` e `talent_pool`.
7. **SEC-005 + RN-012:** Verificação de domínio no middleware (`@welcometrips.com.br`).

### Prioridade 2 — Erros silenciosos com impacto em dados (próximo deploy)

8. **RN-004:** Deletar arquivo do bucket `talent-pool` no fluxo LGPD.
9. **RN-005:** Registrar `resolved_by` na resolução de solicitações LGPD.
10. **RN-010:** Corrigir bug de `sort_order` em testimonials — `count` em vez de `data`.
11. **RN-009:** Capturar e retornar erros da rota `settings/[key]`.
12. **UX-027 + UX-028 + UX-030:** Verificação de `res.ok` em `moveToStage`, `saveNotes` e rollback do Kanban.
13. **UX-037 + UX-038:** Verificar `response.ok` em depoimentos; fechar formulário só após confirmação.

### Prioridade 3 — UX crítico para candidatos (sprint dedicado)

14. **UX-001:** Tratamento de erro nas queries da home e `/vagas`.
15. **UX-015:** Try/catch no `LgpdRequestForm.handleSubmit`.
16. **UX-003 + UX-004:** Reset de erro + links de saída no estado de sucesso da candidatura.
17. **UX-011:** Diferenciar erro de email duplicado no banco de talentos.
18. **UX-019 + UX-020:** Dashboard com indicador de falha + estados distintos nos botões.
19. **UX-021:** Aviso de mudanças não salvas no `JobFormEditor`.
20. **UX-002:** Skeleton de filtros no Suspense.

### Prioridade 4 — Design system e acessibilidade (sprint de qualidade)

21. **UI-001:** Adicionar pesos 800 e 900 ao Nunito Sans — uma linha, alto impacto.
22. **UI-009:** Guards de `prefers-reduced-motion` no marquee, `PurposeSection` e `useCountUp`.
23. **UX-029 + UX-033:** `KeyboardSensor` no `@dnd-kit` + focus trap no `CandidateDrawer`.
24. **UI-010 + UI-011:** `aria-expanded` na nav, `aria-current` no Sidebar.
25. **UX-017:** Link "Meus dados" no menu mobile.
26. **UI-004 + UI-005:** Substituir cores Tailwind genéricas por tokens `wt-*` nas constantes e componentes admin.

### Prioridade 5 — Housekeeping (backlog)

27. **RN-011:** Fechamento automático de vagas via `pg_cron` ou verificação no endpoint.
28. **RN-020:** Limpeza automática da `rate_limit_log`.
29. **RN-017:** Mover criação de buckets para migration automatizável.
30. **UI-017:** Substituir estatísticas placeholder da `CountersStrip` por dados reais.
31. **UI-019:** Corrigir "WelConnect" → "Welcome Group" no Footer.
32. **UX-022 + RN-019:** Validação de `closes_at` para rejeitar datas passadas.
