// ==========================================
// Enums (espelham os tipos do PostgreSQL)
// ==========================================

export type Brand = "welcome_weddings" | "welcome_trips" | "welconnect" | "corporativo";

export type Department =
  | "marketing"
  | "comercial"
  | "operacoes"
  | "tech"
  | "criativo"
  | "administrativo"
  | "rh"
  | "financeiro";

export type JobStatus = "draft" | "published" | "paused" | "closed";

export type ContractType = "clt" | "pj" | "estagio" | "temporario";

export type WorkModel = "presencial" | "hibrido" | "remoto";

export type ApplicationStage =
  | "inscrito"
  | "triagem"
  | "entrevista"
  | "desafio"
  | "proposta"
  | "contratado"
  | "reprovado";

export type ReferralSource =
  | "linkedin"
  | "instagram"
  | "indicacao"
  | "site"
  | "google"
  | "job_board"
  | "outro";

// ==========================================
// Tabelas
// ==========================================

export interface ProcessStep {
  order: number;
  title: string;
  description: string;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  brand: Brand;
  department: Department;
  location: string;
  work_model: WorkModel;
  contract_type: ContractType;
  salary_range: string | null;
  description: string;
  responsibilities: string;
  requirements_must: string;
  requirements_nice: string | null;
  benefits: string | null;
  process_steps: ProcessStep[];
  status: JobStatus;
  is_featured: boolean;
  published_at: string | null;
  closes_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_path: string;
  cover_letter: string | null;
  salary_expectation: string | null;
  referral_source: ReferralSource;
  stage: ApplicationStage;
  stage_updated_at: string;
  notes: string | null;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface TalentPoolEntry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_path: string | null;
  area_interest: Department[];
  brand_interest: Brand[];
  opt_in_alerts: boolean;
  created_at: string;
}

export interface StageEvaluation {
  id: string;
  application_id: string;
  stage: ApplicationStage;
  evaluator_id: string | null;
  score: number | null;
  notes: string | null;
  created_at: string;
}

export interface StageHistory {
  id: string;
  application_id: string;
  from_stage: ApplicationStage | null;
  to_stage: ApplicationStage;
  moved_by: string | null;
  created_at: string;
}

export type InterviewType =
  | "bar_raiser"
  | "par_1"
  | "par_2"
  | "par_3"
  | "painel_decisao";

export type InterviewVote =
  | "muito_inclinado"
  | "inclinado"
  | "pouco_inclinado"
  | "nao_inclinado";

export type CulturePillar =
  | "apaixonados_jornada_cliente"
  | "seja_bem_vindo"
  | "protagonize_se"
  | "invente"
  | "conforto_desconforto"
  | "data_driven";

export type PillarScores = Partial<Record<CulturePillar, number>>;

export interface Interview {
  id: string;
  application_id: string;
  type: InterviewType;
  interviewer_name: string | null;
  vote: InterviewVote | null;
  pillar_scores: PillarScores;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type LgpdRequestType = "exclusao" | "acesso";
export type LgpdRequestStatus = "pendente" | "resolvido" | "cancelado";

export interface LgpdRequest {
  id: string;
  email: string;
  request_type: LgpdRequestType;
  reason: string | null;
  status: LgpdRequestStatus;
  ip: string | null;
  resolved_by: string | null;
  resolved_note: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface CultureContent {
  id: string;
  section_key: string;
  title: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  brand: Brand;
  quote: string;
  photo_path: string | null;
  is_featured: boolean;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

// ==========================================
// Tipos auxiliares
// ==========================================

export interface JobFilters {
  search?: string;
  brand?: Brand[];
  department?: Department[];
  work_model?: WorkModel[];
  location?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
