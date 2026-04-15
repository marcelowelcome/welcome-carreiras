# SESSION_STARTER.md — Portal de Carreiras Welcome Group

> Cole este prompt no início de cada sessão de vibecoding com Claude no VS Code.

---

## Status atual (Abril 2026)

**Sprint 1 concluída** — portal público (home, /vagas, /vagas/[slug], /cultura, /banco-de-talentos) e admin completo (dashboard, vagas CRUD, Kanban por vaga, lista global de candidaturas, banco de talentos, configurações de cultura/depoimentos). Estética Welcome Trips aplicada como linguagem visual global. Reads do admin via service role; writes via `/api/admin/*`. CVs abertos via signed URL do Supabase Storage.

**Sprint 2 concluída** — entrevistas estruturadas (Bar Raiser + 3 Pares + Painel de Decisão com voto e pilares BeWelcome), e-mails transacionais via Resend (candidato + RH + talent pool), rate limit por IP via tabela `rate_limit_log` no Supabase, validação de upload por magic bytes (`%PDF-`).

**Pendente na Sprint 2:** LGPD Fase 2 — página `/meus-dados` para o candidato visualizar e solicitar exclusão.

**Onde começar na Sprint 3:** ver seção "Sprints em aberto" ao final deste arquivo.

---

## Prompt de Abertura de Sessão

```
Você é um desenvolvedor sênior full-stack trabalhando no Portal de Carreiras do Welcome Group.

ANTES DE QUALQUER CÓDIGO, leia os arquivos de documentação do projeto na raiz do repositório:

1. ARCHITECTURE.md → Estrutura de pastas, schema do banco, rotas, componentes, dependências
2. AGENT_INSTRUCTIONS.md → Regras de código, padrões, ordem de implementação, checklist
3. PROMPT_CONTEXT.md → Contexto de negócio, personas, tom, glossário, restrições
4. DESIGN_SYSTEM_WELCOME_TRIPS.md → Design system oficial da marca Welcome Trips (cores, tipografia, componentes, tom visual). Obrigatório em qualquer UI específica da marca.

Stack do projeto:
- Next.js 14 (App Router, Server Components por padrão)
- TypeScript (strict, sem any)
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS (utilities only, sem CSS custom)
- Vercel (deploy)

Regras fundamentais:
- Um arquivo por vez. Crie, teste, valide. Só avance quando funcionar.
- Siga a estrutura de diretórios definida em ARCHITECTURE.md.
- Use apenas as dependências listadas. Não instale nada novo sem confirmação.
- Server Components por padrão. "use client" somente com state/effects/handlers.
- Validação com Zod em todo formulário (client + API).
- Sempre trate loading e error states.

Minha sessão de hoje é sobre: [DESCREVA A TAREFA AQUI]
```

---

## Prompts por Tarefa (Fase 1)

### Setup Inicial

```
Tarefa: Inicializar o projeto careers-portal.

1. Crie o projeto Next.js 14 com TypeScript e Tailwind (use create-next-app)
2. Instale as dependências listadas em ARCHITECTURE.md seção 8
3. Configure tailwind.config.ts com os design tokens de PROMPT_CONTEXT.md seção 5
4. Crie a estrutura de pastas conforme ARCHITECTURE.md seção 2 (pastas vazias com .gitkeep)
5. Crie o .env.example com as variáveis de ARCHITECTURE.md seção 7
6. Configure src/lib/supabase/ (client.ts, server.ts, admin.ts) seguindo o padrão @supabase/ssr

Não crie componentes ou páginas ainda. Apenas a fundação.
```

### Migrations SQL

```
Tarefa: Criar as migrations SQL do Supabase.

Use o schema completo de ARCHITECTURE.md seção 3. Crie 3 arquivos em supabase/migrations/:

001_initial_schema.sql → Enums + tabelas (jobs, applications, talent_pool, stage_evaluations, stage_history, culture_content, testimonials)
002_rls_policies.sql → Row Level Security policies para cada tabela
003_seed_data.sql → Dados iniciais:
  - 3 depoimentos fictícios (1 por marca: weddings, trips, welconnect)
  - Conteúdo da página de cultura (valores, manifesto)
  - 4 vagas de exemplo (1 por marca, mix de status: 3 published + 1 draft)

Use dados realistas para o contexto do Welcome Group (nomes brasileiros, cargos do setor de turismo/eventos).
```

### Types e Constants

```
Tarefa: Criar os tipos TypeScript e constantes do projeto.

1. src/types/index.ts → Tipos que espelham as tabelas do banco (Job, Application, TalentPoolEntry, Testimonial, CultureContent, StageEvaluation, StageHistory). Use os enums do banco como union types.
2. src/lib/constants.ts → Maps de labels em português para todos os enums (brand, department, job_status, contract_type, work_model, application_stage, referral_source). Inclua cores por marca e ícones (Lucide icon names).
3. src/lib/validators.ts → Schemas Zod para: applicationSchema, talentPoolSchema, jobFormSchema.

Siga os padrões de AGENT_INSTRUCTIONS.md seção 2.
```

### Landing de Carreiras

```
Tarefa: Construir a landing page de carreiras (/).

Página principal do portal. Server Component que busca dados do Supabase.

Seções (nesta ordem):
1. HeroSection — headline "Construa sua carreira em um lugar que transforma sonhos em destinos" + CTA "Ver vagas abertas" + imagem placeholder
2. EVPBlock — 4 pilares: Propósito, Crescimento, Flexibilidade, Pessoas (ícone + título + texto curto)
3. NumbersGrid — 4 métricas: colaboradores, destinos, anos, eventos realizados (dados estáticos por agora)
4. Vagas em destaque — Grid de JobCards (buscar jobs com is_featured=true do Supabase, max 6)
5. TestimonialCarousel — Buscar testimonials do Supabase
6. CTA final — "Não encontrou sua vaga?" + link para /banco-de-talentos

Componentes a criar: HeroSection, EVPBlock, NumbersGrid, JobCard, TestimonialCarousel.
Layout raiz: nav com links (Vagas, Cultura, Banco de Talentos) + footer com info do grupo.

Lembre: mobile-first, responsive, metadata SEO.
```

### Lista de Vagas

```
Tarefa: Construir a página de lista de vagas (/vagas).

Server Component que busca vagas publicadas + Client Component para filtros interativos.

Elementos:
1. Heading + contagem de vagas ("X vagas abertas")
2. JobFilters (Client Component):
   - Busca por texto (título/descrição)
   - Filtro por marca (multi-select ou tabs)
   - Filtro por departamento
   - Filtro por modelo de trabalho
   - Filtro por localização
   - Botão limpar filtros
3. Grid de JobCards (2 colunas desktop, 1 mobile)
4. Estado vazio: "Nenhuma vaga encontrada com esses filtros"
5. Paginação (cursor-based, 12 por página)

Os filtros devem atualizar via URL search params (useSearchParams) para que sejam compartilháveis.
```

### Página de Vaga Individual

```
Tarefa: Construir a página de vaga individual (/vagas/[slug]).

Server Component com generateMetadata e JSON-LD (schema.org/JobPosting).

Seções:
1. Cabeçalho: título, badge de marca (com cor), localização, modelo, contrato, salário (se houver), data de publicação
2. Descrição da vaga (rich text renderizado)
3. Responsabilidades (rich text)
4. Requisitos obrigatórios + desejáveis (separados visualmente)
5. Benefícios
6. ProcessTimeline — etapas do processo seletivo (dados de job.process_steps)
7. ApplicationForm (Client Component) — formulário de candidatura
8. Botões de compartilhamento (LinkedIn, WhatsApp, copiar link)

O ApplicationForm deve:
- Validar com Zod no client antes de enviar
- Upload de CV para Supabase Storage
- POST para /api/applications
- Mostrar loading state durante envio
- Mostrar confirmação visual após sucesso
- Incluir checkbox de consentimento LGPD
```

### Admin — CRUD de Vagas

```
Tarefa: Construir o CRUD de vagas no painel admin.

1. /admin/vagas (lista):
   - DataTable com colunas: título, marca, status (badge colorido), candidaturas (count), criada em, ações
   - Filtro por status (todas, publicadas, rascunho, pausadas, encerradas)
   - Botão "Nova vaga"
   - Ações por linha: editar, duplicar, alterar status, excluir (com confirmação)

2. /admin/vagas/nova e /admin/vagas/[id] (formulário):
   - JobFormEditor com campos para todos os atributos da vaga
   - Editor de rich text simplificado (toolbar: bold, italic, lista, link)
   - Seção de etapas do processo (drag-and-drop para reordenar, add/remove)
   - Preview da vaga (como ficará no site público)
   - Botões: "Salvar rascunho" e "Publicar"
   - Ao publicar: gera slug automático, define published_at

3. API Routes:
   - GET /api/admin/jobs → lista com filtros e paginação
   - POST /api/admin/jobs → criar vaga (validação Zod)
   - PUT /api/admin/jobs/[id] → atualizar vaga
   - DELETE /api/admin/jobs/[id] → soft delete (status → closed)

Todas as rotas admin devem verificar autenticação no middleware.
```

### Admin — Kanban de Candidaturas

```
Tarefa: Construir o kanban de candidaturas no admin.

Rota: /admin/vagas/[id]/candidaturas

1. KanbanBoard:
   - Busca candidaturas da vaga agrupadas por stage
   - Colunas: inscrito, triagem, entrevista, desafio, proposta, contratado (reprovado fica em coluna colapsável)
   - Header de cada coluna com contagem
   - @dnd-kit para drag-and-drop entre colunas

2. CandidateCard:
   - Nome, e-mail, data da candidatura
   - Badge com score (se houver)
   - Click abre modal/drawer com:
     - Dados completos do candidato
     - Link para download do CV
     - Campo de notas (textarea com auto-save)
     - Score (1-5 estrelas)
     - Botão de mover para etapa específica
     - Histórico de movimentações (stage_history)

3. Ao mover candidato (drag-and-drop ou botão):
   - PUT /api/admin/applications/[id] com novo stage
   - Insert em stage_history
   - Atualizar stage_updated_at
   - Toast de confirmação

Use @dnd-kit/core e @dnd-kit/sortable. Siga AGENT_INSTRUCTIONS.md para padrões.
```

---

## Dicas para Sessões Produtivas

1. **Comece sempre relendo os 3 docs.** O agente esquece entre sessões.
2. **Uma tarefa por sessão.** Não misture "criar página de vagas" com "configurar admin". Foque.
3. **Teste antes de avançar.** Peça ao agente para rodar `npm run build` e verificar se compila.
4. **Peça revisão.** Ao final de cada tarefa, peça: "Revise o código que acabamos de criar. Há inconsistências com ARCHITECTURE.md ou AGENT_INSTRUCTIONS.md?"
5. **Commite ao final.** Peça ao agente para sugerir o commit message seguindo a convenção de AGENT_INSTRUCTIONS.md seção 8.

---

## Sprints em aberto

### Sprint 3 — Conteúdo real, marca e LGPD

Objetivo: transformar o portal genérico em algo que represente visualmente o Welcome Group e atender a LGPD Fase 2.

1. Substituir seed por **vagas reais**, **depoimentos reais** (com fotos) e **números reais** (home `NumbersGrid`).
2. Trocar o textual "Welcome Carreiras" pelo **logo oficial** do grupo em `Nav` e `Footer`.
3. **Marca-d'água do mapa-múndi** (§7 do DESIGN_SYSTEM_WELCOME_TRIPS) em backgrounds-chave (hero home, CTA final).
4. **OG images dinâmicas por vaga** (`/vagas/[slug]/opengraph-image.tsx`) + metadados sociais completos.
5. **Foto da equipe** na home em composição circular (§6 do design system).
6. **LGPD Fase 2:** página `/meus-dados` onde o candidato consulta dados próprios via e-mail + token e solicita exclusão. Endpoint `POST /api/lgpd/delete-request` registra pedido; admin trata em `/admin/lgpd`.

### Sprint 4 — Analytics e integrações externas

1. GA4 (`NEXT_PUBLIC_GA_ID`) + eventos do funil (ver vaga → iniciar form → submeter).
2. ActiveCampaign: candidato do banco de talentos entra em lista de nutrição.
3. WhatsApp: notificar candidato em mudanças de etapa críticas (entrevista agendada, oferta, reprovação).
4. ClickUp: criar task automática por nova candidatura.
5. Slack webhook: canal `#carreiras` recebe ping por nova candidatura.
6. **Documente decisões.** Se algo mudar em relação ao planejado, atualize ARCHITECTURE.md imediatamente.
