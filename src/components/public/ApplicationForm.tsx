"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, Upload } from "lucide-react";
import { applicationSchema } from "@/lib/validators";
import { REFERRAL_SOURCE_LABELS, LGPD_CONSENT_TEXT, MAX_RESUME_SIZE, ALLOWED_RESUME_TYPES } from "@/lib/constants";
import type { ReferralSource } from "@/types";

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
}

const inputClass =
  "mt-1 w-full rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2.5 text-sm text-wt-teal-deep placeholder:text-wt-gray-500 focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary";

const labelClass =
  "block font-wt-heading text-xs font-semibold uppercase tracking-[0.08em] text-wt-gray-700";

export function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");

  if (status === "success") {
    return (
      <div className="rounded-wt-md bg-wt-primary-light p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-wt-teal-mid" />
        <h3 className="mt-4 font-wt-heading text-lg font-bold text-wt-teal-deep">
          Candidatura enviada!
        </h3>
        <p className="mt-2 text-sm text-wt-gray-700">
          Recebemos sua candidatura para {jobTitle}. Acompanhe seu e-mail para
          atualizações sobre o processo seletivo.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      linkedin_url: (formData.get("linkedin_url") as string) ?? "",
      portfolio_url: (formData.get("portfolio_url") as string) ?? "",
      cover_letter: (formData.get("cover_letter") as string) ?? "",
      salary_expectation: (formData.get("salary_expectation") as string) ?? "",
      referral_source: formData.get("referral_source") as string,
      lgpd_consent: formData.get("lgpd_consent") === "on",
    };

    const result = applicationSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    const resume = formData.get("resume") as File;
    if (!resume || resume.size === 0) {
      setErrors({ resume: "Currículo é obrigatório" });
      return;
    }
    if (!ALLOWED_RESUME_TYPES.includes(resume.type)) {
      setErrors({ resume: "Apenas arquivos PDF" });
      return;
    }
    if (resume.size > MAX_RESUME_SIZE) {
      setErrors({ resume: "Arquivo deve ter no máximo 5MB" });
      return;
    }

    setStatus("loading");

    try {
      const submitData = new FormData();
      submitData.append("job_id", jobId);
      submitData.append("resume", resume);
      Object.entries(result.data).forEach(([key, value]) => {
        if (key !== "lgpd_consent" && value !== undefined && value !== "") {
          submitData.append(key, String(value));
        }
      });

      const response = await fetch("/api/applications", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar candidatura");
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrors({ form: "Erro ao enviar candidatura. Tente novamente." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-wt-heading text-2xl font-bold text-wt-teal-deep">
        Candidatar-se
      </h2>

      {errors.form && (
        <div className="rounded-wt-sm bg-wt-red/10 p-4 text-sm text-wt-red">
          {errors.form}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome completo" name="full_name" required error={errors.full_name} />
        <Field label="E-mail" name="email" type="email" required error={errors.email} />
        <Field
          label="Telefone"
          name="phone"
          type="tel"
          required
          error={errors.phone}
          placeholder="(41) 99999-9999"
        />
        <div>
          <label htmlFor="referral_source" className={labelClass}>
            Como ficou sabendo da vaga? <span className="text-wt-red">*</span>
          </label>
          <select
            id="referral_source"
            name="referral_source"
            required
            className={inputClass}
          >
            <option value="">Selecione...</option>
            {(
              Object.entries(REFERRAL_SOURCE_LABELS) as [ReferralSource, string][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.referral_source && (
            <p className="mt-1 text-xs text-wt-red">{errors.referral_source}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="LinkedIn"
          name="linkedin_url"
          placeholder="https://linkedin.com/in/..."
          error={errors.linkedin_url}
        />
        <Field
          label="Portfolio"
          name="portfolio_url"
          placeholder="https://..."
          error={errors.portfolio_url}
        />
      </div>

      <Field
        label="Pretensão salarial"
        name="salary_expectation"
        placeholder="Ex: R$ 5.000 - R$ 7.000"
        error={errors.salary_expectation}
      />

      {/* Upload CV */}
      <div>
        <label htmlFor="resume" className={labelClass}>
          Currículo (PDF, máx 5MB) <span className="text-wt-red">*</span>
        </label>
        <label
          htmlFor="resume"
          className="mt-1 flex cursor-pointer items-center gap-2 rounded-wt-sm border border-dashed border-wt-gray-300 bg-white px-4 py-3 text-sm text-wt-gray-500 transition-colors hover:border-wt-primary hover:bg-wt-primary-light"
        >
          <Upload className="h-5 w-5" />
          {fileName || "Clique para selecionar arquivo"}
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
        {errors.resume && (
          <p className="mt-1 text-xs text-wt-red">{errors.resume}</p>
        )}
      </div>

      {/* Carta de apresentação */}
      <div>
        <label htmlFor="cover_letter" className={labelClass}>
          Carta de apresentação
        </label>
        <textarea
          id="cover_letter"
          name="cover_letter"
          rows={4}
          maxLength={2000}
          placeholder="Conte um pouco sobre você e por que se interessa por esta vaga..."
          className={inputClass}
        />
        {errors.cover_letter && (
          <p className="mt-1 text-xs text-wt-red">{errors.cover_letter}</p>
        )}
      </div>

      {/* LGPD */}
      <div className="flex items-start gap-3">
        <input
          id="lgpd_consent"
          name="lgpd_consent"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-wt-gray-300 text-wt-primary focus:ring-wt-primary"
        />
        <label htmlFor="lgpd_consent" className="text-xs leading-relaxed text-wt-gray-500">
          {LGPD_CONSENT_TEXT}
        </label>
      </div>
      {errors.lgpd_consent && (
        <p className="text-xs text-wt-red">{errors.lgpd_consent}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-3 rounded-wt-sm bg-wt-orange px-8 py-3.5 font-wt-heading text-sm font-bold uppercase tracking-[0.05em] text-white shadow-wt-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-wt-orange/90 hover:shadow-wt-md disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar candidatura
          </>
        )}
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label} {required && <span className="text-wt-red">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
      {error && <p className="mt-1 text-xs text-wt-red">{error}</p>}
    </div>
  );
}
