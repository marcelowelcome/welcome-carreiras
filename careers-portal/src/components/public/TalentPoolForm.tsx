"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { talentPoolSchema } from "@/lib/validators";
import {
  BRAND_LABELS,
  DEPARTMENT_LABELS,
  LGPD_CONSENT_TEXT,
} from "@/lib/constants";
import type { Brand, Department } from "@/types";

const inputClass =
  "mt-1 w-full rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2.5 text-sm text-wt-teal-deep placeholder:text-wt-gray-500 focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary";

const labelClass =
  "block font-wt-heading text-xs font-semibold uppercase tracking-[0.08em] text-wt-gray-700";

export function TalentPoolForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (status === "success") {
    return (
      <div className="rounded-wt-md bg-wt-primary-light p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-wt-teal-mid" />
        <h3 className="mt-4 font-wt-heading text-lg font-bold text-wt-teal-deep">
          Cadastro realizado!
        </h3>
        <p className="mt-2 text-sm text-wt-gray-700">
          Você foi adicionado ao nosso banco de talentos. Enviaremos um e-mail
          quando surgir uma vaga na sua área de interesse.
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
      area_interest: formData.getAll("area_interest") as string[],
      brand_interest: formData.getAll("brand_interest") as string[],
      opt_in_alerts: formData.get("opt_in_alerts") === "on",
      lgpd_consent: formData.get("lgpd_consent") === "on",
    };

    const result = talentPoolSchema.safeParse(data);
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

    setStatus("loading");

    try {
      const response = await fetch("/api/talent-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) throw new Error("Falha ao cadastrar");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrors({ form: "Erro ao cadastrar. Tente novamente." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="rounded-wt-sm bg-wt-red/10 p-4 text-sm text-wt-red">
          {errors.form}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Nome completo <span className="text-wt-red">*</span>
          </label>
          <input id="full_name" name="full_name" type="text" required className={inputClass} />
          {errors.full_name && <p className="mt-1 text-xs text-wt-red">{errors.full_name}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            E-mail <span className="text-wt-red">*</span>
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
          {errors.email && <p className="mt-1 text-xs text-wt-red">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Telefone <span className="text-wt-red">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="(41) 99999-9999"
            className={inputClass}
          />
          {errors.phone && <p className="mt-1 text-xs text-wt-red">{errors.phone}</p>}
        </div>
      </div>

      {/* Áreas de interesse */}
      <fieldset>
        <legend className={labelClass}>
          Áreas de interesse <span className="text-wt-red">*</span>
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.entries(DEPARTMENT_LABELS) as [Department, string][]).map(
            ([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-wt-sm border border-wt-gray-300 px-3 py-2 text-sm text-wt-gray-700 transition-colors hover:border-wt-primary hover:bg-wt-primary-light"
              >
                <input
                  type="checkbox"
                  name="area_interest"
                  value={value}
                  className="h-4 w-4 rounded border-wt-gray-300 text-wt-primary focus:ring-wt-primary"
                />
                {label}
              </label>
            )
          )}
        </div>
        {errors.area_interest && (
          <p className="mt-1 text-xs text-wt-red">{errors.area_interest}</p>
        )}
      </fieldset>

      {/* Marcas de interesse */}
      <fieldset>
        <legend className={labelClass}>
          Marcas de interesse <span className="text-wt-red">*</span>
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.entries(BRAND_LABELS) as [Brand, string][]).map(
            ([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-wt-sm border border-wt-gray-300 px-3 py-2 text-sm text-wt-gray-700 transition-colors hover:border-wt-primary hover:bg-wt-primary-light"
              >
                <input
                  type="checkbox"
                  name="brand_interest"
                  value={value}
                  className="h-4 w-4 rounded border-wt-gray-300 text-wt-primary focus:ring-wt-primary"
                />
                {label}
              </label>
            )
          )}
        </div>
        {errors.brand_interest && (
          <p className="mt-1 text-xs text-wt-red">{errors.brand_interest}</p>
        )}
      </fieldset>

      {/* Alertas */}
      <div className="flex items-center gap-3">
        <input
          id="opt_in_alerts"
          name="opt_in_alerts"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-wt-gray-300 text-wt-primary focus:ring-wt-primary"
        />
        <label htmlFor="opt_in_alerts" className="text-sm text-wt-gray-700">
          Desejo receber alertas de novas vagas por e-mail
        </label>
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
            Cadastrando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Cadastrar no banco de talentos
          </>
        )}
      </button>
    </form>
  );
}
