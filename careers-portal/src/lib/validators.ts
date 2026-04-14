import { z } from "zod";

// ==========================================
// Schema: Candidatura
// ==========================================

export const applicationSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  linkedin_url: z.string().url("URL inválida").optional().or(z.literal("")),
  portfolio_url: z.string().url("URL inválida").optional().or(z.literal("")),
  cover_letter: z.string().max(2000, "Máximo de 2000 caracteres").optional().or(z.literal("")),
  salary_expectation: z.string().optional().or(z.literal("")),
  referral_source: z.enum(
    ["linkedin", "instagram", "indicacao", "site", "google", "job_board", "outro"],
    { message: "Selecione como ficou sabendo da vaga" }
  ),
  lgpd_consent: z.literal(true, {
    message: "Você precisa aceitar os termos para continuar",
  }),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

// ==========================================
// Schema: Banco de Talentos
// ==========================================

export const talentPoolSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  area_interest: z
    .array(
      z.enum([
        "marketing",
        "comercial",
        "operacoes",
        "tech",
        "criativo",
        "administrativo",
        "rh",
        "financeiro",
      ])
    )
    .min(1, "Selecione pelo menos uma área de interesse"),
  brand_interest: z
    .array(z.enum(["welcome_weddings", "welcome_trips", "welconnect", "corporativo"]))
    .min(1, "Selecione pelo menos uma marca de interesse"),
  opt_in_alerts: z.boolean().default(true),
  lgpd_consent: z.literal(true, {
    message: "Você precisa aceitar os termos para continuar",
  }),
});

export type TalentPoolFormData = z.infer<typeof talentPoolSchema>;

// ==========================================
// Schema: Formulário de Vaga (Admin)
// ==========================================

export const jobFormSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  brand: z.enum(["welcome_weddings", "welcome_trips", "welconnect", "corporativo"], {
    message: "Selecione uma marca",
  }),
  department: z.enum(
    ["marketing", "comercial", "operacoes", "tech", "criativo", "administrativo", "rh", "financeiro"],
    { message: "Selecione um departamento" }
  ),
  location: z.string().min(3, "Localização é obrigatória"),
  work_model: z.enum(["presencial", "hibrido", "remoto"], {
    message: "Selecione o modelo de trabalho",
  }),
  contract_type: z.enum(["clt", "pj", "estagio", "temporario"], {
    message: "Selecione o tipo de contrato",
  }),
  salary_range: z.string().optional().or(z.literal("")),
  description: z.string().min(50, "Descrição deve ter pelo menos 50 caracteres"),
  responsibilities: z.string().min(50, "Responsabilidades deve ter pelo menos 50 caracteres"),
  requirements_must: z.string().min(50, "Requisitos obrigatórios deve ter pelo menos 50 caracteres"),
  requirements_nice: z.string().optional().or(z.literal("")),
  benefits: z.string().optional().or(z.literal("")),
  process_steps: z
    .array(
      z.object({
        order: z.number(),
        title: z.string().min(1, "Título da etapa é obrigatório"),
        description: z.string().min(1, "Descrição da etapa é obrigatória"),
      })
    )
    .min(1, "Adicione pelo menos uma etapa do processo"),
  is_featured: z.boolean().default(false),
  closes_at: z.string().optional().or(z.literal("")),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
