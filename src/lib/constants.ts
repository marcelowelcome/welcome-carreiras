import type {
  Brand,
  Department,
  JobStatus,
  ContractType,
  WorkModel,
  ApplicationStage,
  ReferralSource,
  InterviewType,
  InterviewVote,
  CulturePillar,
} from "@/types";

// ==========================================
// Labels em português para os enums
// ==========================================

export const BRAND_LABELS: Record<Brand, string> = {
  welcome_weddings: "Welcome Weddings",
  welcome_trips: "Welcome Trips",
  welconnect: "WelConnect",
  corporativo: "Corporativo",
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  marketing: "Marketing",
  comercial: "Comercial",
  operacoes: "Operações",
  tech: "Tecnologia",
  criativo: "Criativo",
  administrativo: "Administrativo",
  rh: "Recursos Humanos",
  financeiro: "Financeiro",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Rascunho",
  published: "Publicada",
  paused: "Pausada",
  closed: "Encerrada",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  clt: "CLT",
  pj: "PJ",
  estagio: "Estágio",
  temporario: "Temporário",
};

export const WORK_MODEL_LABELS: Record<WorkModel, string> = {
  presencial: "Presencial",
  hibrido: "Híbrido",
  remoto: "Remoto",
};

export const APPLICATION_STAGE_LABELS: Record<ApplicationStage, string> = {
  inscrito: "Inscrito",
  triagem: "Triagem",
  entrevista: "Entrevista",
  desafio: "Desafio",
  proposta: "Proposta",
  contratado: "Contratado",
  reprovado: "Reprovado",
};

export const REFERRAL_SOURCE_LABELS: Record<ReferralSource, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  indicacao: "Indicação",
  site: "Site",
  google: "Google",
  job_board: "Portal de vagas",
  outro: "Outro",
};

// ==========================================
// Cores por marca (classes Tailwind)
// ==========================================

export const BRAND_COLORS: Record<Brand, { bg: string; text: string; badge: string }> = {
  welcome_weddings: {
    bg: "bg-weddings",
    text: "text-weddings-dark",
    badge: "bg-weddings-light text-weddings-dark",
  },
  welcome_trips: {
    bg: "bg-trips",
    text: "text-trips-dark",
    badge: "bg-trips-light text-trips-dark",
  },
  welconnect: {
    bg: "bg-welconnect",
    text: "text-welconnect-dark",
    badge: "bg-welconnect-light text-welconnect-dark",
  },
  corporativo: {
    bg: "bg-corporativo",
    text: "text-corporativo",
    badge: "bg-corporativo-light text-corporativo",
  },
};

// ==========================================
// Ícones Lucide por marca
// ==========================================

export const BRAND_ICONS: Record<Brand, string> = {
  welcome_weddings: "heart",
  welcome_trips: "plane",
  welconnect: "users",
  corporativo: "building-2",
};

// ==========================================
// Cores de status (classes Tailwind para badges)
// ==========================================

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  closed: "bg-red-100 text-red-700",
};

export const APPLICATION_STAGE_COLORS: Record<ApplicationStage, string> = {
  inscrito: "bg-blue-100 text-blue-700",
  triagem: "bg-purple-100 text-purple-700",
  entrevista: "bg-indigo-100 text-indigo-700",
  desafio: "bg-orange-100 text-orange-700",
  proposta: "bg-emerald-100 text-emerald-700",
  contratado: "bg-green-100 text-green-700",
  reprovado: "bg-red-100 text-red-700",
};

// ==========================================
// Ordem das etapas do pipeline (para kanban)
// ==========================================

export const APPLICATION_STAGES_ORDER: ApplicationStage[] = [
  "inscrito",
  "triagem",
  "entrevista",
  "desafio",
  "proposta",
  "contratado",
  "reprovado",
];

// ==========================================
// Constantes gerais
// ==========================================

export const JOBS_PER_PAGE = 12;
export const FEATURED_JOBS_LIMIT = 6;
export const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_RESUME_TYPES = ["application/pdf"];

export const LGPD_CONSENT_TEXT =
  "Ao enviar sua candidatura, você autoriza o Welcome Group a armazenar e utilizar seus dados pessoais exclusivamente para fins de recrutamento e seleção, conforme a Lei Geral de Proteção de Dados (LGPD).";

// ==========================================
// Entrevistas — tipos, votos e pilares BeWelcome
// ==========================================

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  bar_raiser: "Bar Raiser",
  par_1: "1º Par",
  par_2: "2º Par",
  par_3: "3º Par",
  painel_decisao: "Painel de Decisão",
};

export const INTERVIEW_TYPES_ORDER: InterviewType[] = [
  "bar_raiser",
  "par_1",
  "par_2",
  "par_3",
  "painel_decisao",
];

export const INTERVIEW_VOTE_LABELS: Record<InterviewVote, string> = {
  muito_inclinado: "Muito inclinado a contratar",
  inclinado: "Inclinado a contratar",
  pouco_inclinado: "Pouco inclinado a contratar",
  nao_inclinado: "Não inclinado a contratar",
};

export const INTERVIEW_VOTE_COLORS: Record<InterviewVote, string> = {
  muito_inclinado: "bg-emerald-100 text-emerald-700",
  inclinado: "bg-teal-100 text-teal-700",
  pouco_inclinado: "bg-amber-100 text-amber-700",
  nao_inclinado: "bg-red-100 text-red-700",
};

export const CULTURE_PILLAR_LABELS: Record<CulturePillar, string> = {
  apaixonados_jornada_cliente: "Apaixonados pela jornada do cliente",
  seja_bem_vindo: "Seja Bem-Vindo",
  protagonize_se: "Protagonize-se",
  invente: "Invente",
  conforto_desconforto: "Conforto no desconforto",
  data_driven: "Data Driven",
};

export const CULTURE_PILLARS_ORDER: CulturePillar[] = [
  "apaixonados_jornada_cliente",
  "seja_bem_vindo",
  "protagonize_se",
  "invente",
  "conforto_desconforto",
  "data_driven",
];
