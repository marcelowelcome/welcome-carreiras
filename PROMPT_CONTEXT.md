# PROMPT_CONTEXT.md — Portal de Carreiras Welcome Group

> Contexto de negócio e domínio para o agente de IA entender o que está sendo construído e por quê.

---

## 1. Sobre o Welcome Group

O Welcome Group é uma empresa brasileira sediada em Curitiba que opera no segmento de turismo, eventos e destination weddings. O grupo possui múltiplas marcas, cada uma com público e posicionamento distintos:

| Marca | O que faz | Público principal |
|-------|-----------|-------------------|
| **Welcome Weddings** | Planejamento de destination weddings | Casais que querem casar em destinos internacionais |
| **Welcome Trips** | Agência de viagens | Viajantes premium, famílias, grupos |
| **WelConnect** | Eventos de networking profissional | Profissionais do trade de turismo e eventos |
| **Wedme** | Marca complementar (eventos) | — |
| **Weex** | Marca complementar (experiências) | — |

O grupo é liderado por Thiago (founder/director). A equipe inclui áreas de marketing, comercial, operações, criativo e tecnologia. O time de marketing, liderado por Marcelo, é responsável por employer branding, conteúdo e tecnologia.

---

## 2. Por que um Portal de Carreiras

### Contexto atual
- Vagas são divulgadas de forma descentralizada (LinkedIn, Instagram, WhatsApp, indicações).
- Não há página de carreiras no site institucional.
- Candidaturas chegam por e-mail ou DM, sem rastreabilidade.
- Não existe pipeline visual de seleção — o acompanhamento é manual.

### Objetivos do portal
1. **Centralizar:** único ponto de entrada para todas as vagas do grupo.
2. **Profissionalizar:** processo seletivo estruturado com etapas claras.
3. **Rastrear:** saber de onde vem cada candidato e em que etapa está.
4. **Comunicar:** fortalecer employer branding — mostrar cultura, valores, bastidores.
5. **Escalar:** base para contratações futuras sem depender de plataformas externas (Gupy, InHire).

### Decisão build vs buy
O briefing foi construído com a possibilidade de desenvolvimento interno (custom), aproveitando o stack que o grupo já utiliza (Next.js + Supabase + Vercel). Isso oferece controle total sobre UX, dados e integrações futuras, além de custo operacional mais previsível do que plataformas SaaS.

---

## 3. Perfis de Usuário

### 3.1 Candidato (público)
- **Quem:** profissional buscando oportunidades no Welcome Group.
- **Dispositivo primário:** mobile (estimativa 70%+).
- **Jornada típica:**
  1. Vê vaga no Instagram ou LinkedIn
  2. Clica no link → cai na página da vaga
  3. Lê descrição, requisitos, benefícios
  4. Preenche formulário e envia CV
  5. Recebe confirmação
- **Expectativas:** processo rápido (< 5 min), sem cadastro obrigatório em plataforma, feedback visual claro.

### 3.2 Candidato espontâneo
- **Quem:** profissional que gosta do grupo mas não encontrou vaga aberta compatível.
- **Jornada:** acessa /banco-de-talentos → preenche formulário curto → opta por alertas de vagas.

### 3.3 Admin / RH
- **Quem:** gestor(a) de RH ou liderança do grupo.
- **Dispositivo primário:** desktop.
- **Jornada típica:**
  1. Cria nova vaga no painel
  2. Publica no site
  3. Acompanha candidaturas em kanban
  4. Move candidatos entre etapas
  5. Adiciona notas e scorecards
  6. Encerra vaga quando preencher posição

### 3.4 Gestor de área
- **Quem:** líder de equipe que precisa preencher uma posição.
- **Acesso:** visualizar candidaturas da sua área, adicionar notas. Não cria/edita vagas.

---

## 4. Tom e Linguagem

### Público
- **Tom:** acolhedor, aspiracional, humano. Não corporativo-robótico.
- **Idioma:** português brasileiro. Sem anglicismos desnecessários.
- **Exemplos de headline:**
  - ✅ "Construa sua carreira em um lugar que transforma sonhos em destinos"
  - ✅ "Aqui, cada viagem começa com as pessoas certas"
  - ❌ "Junte-se ao nosso time de alta performance"
  - ❌ "Oportunidades de emprego disponíveis"

### Admin
- **Tom:** funcional, direto, sem floreios. Labels claros, ações óbvias.
- **Idioma:** português brasileiro no UI. Termos técnicos em inglês são aceitáveis (kanban, dashboard, slug).

---

## 5. Identidade Visual (Diretrizes)

> **Decisão (2026-04-14):** o design system documentado em [DESIGN_SYSTEM_WELCOME_TRIPS.md](DESIGN_SYSTEM_WELCOME_TRIPS.md) é a **linguagem visual de TODO o portal de carreiras** — não apenas das páginas de Welcome Trips. As páginas seguem a estrutura: home, vagas, cultura, banco de talentos + admin. Em todas elas vale a paleta `wt.*`, a tipografia Nunito Sans (com fallback Avenir), o background off-white quente `#F8F7F4` e o tom visual descrito no design system. As demais marcas (Weddings, WelConnect, Corporativo) seguem aparecendo apenas como **badge** de marca em vagas e depoimentos, mantendo suas cores próprias dentro do chrome WT.

### Paleta global (namespace `wt.*` no Tailwind)
| Função | Token | Hex | Uso |
|--------|-------|-----|-----|
| Primary | `wt-primary` | #0091B3 | Acentos, links, ícones, headlines em destaque |
| Primary dark | `wt-primary-dark` | #007A99 | Hover de links/CTAs primários |
| Primary light | `wt-primary-light` | #E6F5F9 | Backgrounds sutis, badges de avatar |
| Teal deep | `wt-teal-deep` | #0D5257 | Headings, fundo do footer e CTAs escuros |
| Teal mid | `wt-teal-mid` | #00968F | Acento secundário, "comportamentos esperados" |
| Yellow | `wt-yellow` | #F6BE00 | Destaques no footer, glows decorativos |
| Orange | `wt-orange` | #EA7600 | **CTA principal** (envio de candidatura, "Ver vagas") |
| Red | `wt-red` | #D14124 | Erros, "comportamentos não aceitos" |
| Off-white | `wt-off-white` | #F8F7F4 | Background padrão do site |
| Gray-100 | `wt-gray-100` | #F2F0ED | Seções alternadas, hover de menu |
| Gray-300 | `wt-gray-300` | #D1CCC5 | Bordas, divisores |
| Gray-500 | `wt-gray-500` | #8A8580 | Texto secundário, captions |
| Gray-700 | `wt-gray-700` | #4A4540 | Texto corpo |

### Cores de marca (apenas badges)
| Marca | Token Tailwind | Uso |
|-------|---------------|-----|
| Welcome Weddings | `weddings` (#C4A882) | Badge da vaga, tag em depoimento |
| Welcome Trips | `trips` (#0091B3) | Badge da vaga, tag em depoimento |
| WelConnect | `welconnect` (#5B9A6B) | Badge da vaga, tag em depoimento |
| Corporativo | `corporativo` (#1A1A2E) | Badge da vaga |

### Tipografia
- **Headings:** `font-wt-heading` (Nunito Sans → Avenir Next → system-ui), peso bold/black, tracking-tight.
- **Body:** `font-wt-body` (mesma stack), peso regular, leading-relaxed.
- **CTAs:** uppercase com `tracking-[0.05em]`–`tracking-[0.1em]`, peso bold/semibold.
- **Eyebrows / pré-títulos:** uppercase, `tracking-[0.2em]`, `text-wt-primary`.

### Componentes-padrão
- **CTA primário (urgência):** `bg-wt-orange` + `text-white` + `rounded-wt-sm` + hover `-translate-y-0.5` + `shadow-wt-md`.
- **CTA outline:** `border-[1.5px] border-wt-gray-700` + uppercase + hover `bg-wt-primary text-white`. Inclui seta `→` em círculo no lado direito.
- **Cards:** `rounded-wt-md bg-white shadow-wt-sm` → hover `-translate-y-1` + `shadow-wt-lg`.
- **Inputs:** `border border-wt-gray-300` + focus `border-wt-primary` + `ring-wt-primary`.
- **Seções:** padding vertical generoso (`py-20 sm:py-24`), container `max-w-wt-container` (1280px).

### Regra de aplicação por contexto
- **Site público inteiro** (home, /vagas, /vagas/[slug], /cultura, /banco-de-talentos): segue o design system WT por completo.
- **Admin:** segue o design system de forma **funcional** — usa as cores e a tipografia WT, mas mantém densidade alta, sem hover translateY em tabelas/forms internos. Headings em `font-wt-heading` + `text-wt-teal-deep`; sidebar com active state em `bg-wt-primary-light text-wt-primary`.
- **Badges de marca:** dentro de uma vaga ou depoimento, a marca de origem aparece como pílula colorida (Weddings dourado, Trips teal, etc.) — preservando diferenciação visual sem quebrar o chrome WT.

---

## 6. Glossário de Domínio

Termos usados internamente que o agente precisa conhecer:

| Termo | Significado |
|-------|-------------|
| **Assessora** | Profissional que atende os casais no planejamento do destination wedding |
| **Consultor de viagem** | Vendedor/consultor da Welcome Trips |
| **Destination wedding** | Casamento realizado em destino diferente da cidade de origem do casal |
| **WelConnect** | Eventos de networking profissional organizados pelo grupo (ex: WelConnect Mendoza, WelConnect Cartagena) |
| **Trade** | Profissionais e empresas do setor de turismo |
| **Banco de talentos** | Pool de candidatos que se cadastraram sem vaga específica |
| **Pipeline / Funil** | Etapas do processo seletivo (inscrito → triagem → entrevista → desafio → proposta) |
| **Scorecard** | Avaliação numérica (1-5) + notas por etapa de entrevista |
| **EVP** | Employee Value Proposition — proposta de valor como empregador |

---

## 7. Restrições e Considerações

### LGPD
- Candidatos devem consentir com o tratamento de dados ao submeter candidatura.
- Texto de consentimento obrigatório no formulário: "Ao enviar sua candidatura, você autoriza o Welcome Group a armazenar e utilizar seus dados pessoais exclusivamente para fins de recrutamento e seleção, conforme a Lei Geral de Proteção de Dados (LGPD)."
- Currículos devem ser armazenados em bucket privado no Supabase Storage.
- Implementar opção de exclusão de dados (Fase 2).

### Acessibilidade
- WCAG 2.1 AA mínimo.
- Alt text em todas as imagens.
- Formulários com labels associadas.
- Contraste mínimo 4.5:1.
- Navegação por teclado funcional.

### Performance
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1.
- Lighthouse score mínimo: 90+ em todas as categorias.

---

## 8. Integrações do Ecossistema (Referência)

O Welcome Group utiliza as seguintes ferramentas. Integrações diretas são Fase 2/3, mas o schema do banco deve ser projetado para acomodá-las:

| Ferramenta | Uso atual | Integração potencial |
|------------|-----------|---------------------|
| ActiveCampaign | CRM e e-mail marketing | Alertas de vagas, nutrição de candidatos |
| ClickUp | Gestão de projetos e tarefas | Task automática por nova candidatura |
| Google Calendar | Agendas do time | Agendamento de entrevistas |
| WhatsApp | Comunicação com clientes | Notificações para candidatos |
| LinkedIn | Social e employer branding | Publicação automática de vagas |
| GA4 | Analytics web | Tracking de funil de candidatura |
| Vercel | Hosting | Deploy automático |
| Supabase | Backend-as-a-Service | Banco, auth, storage |
