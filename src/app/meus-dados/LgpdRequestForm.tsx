"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

type RequestType = "exclusao" | "acesso";

export function LgpdRequestForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const payload = {
      email: formData.get("email") as string,
      request_type: formData.get("request_type") as RequestType,
      reason: (formData.get("reason") as string) || undefined,
    };

    const res = await fetch("/api/lgpd/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error ?? "Erro ao enviar. Tente novamente.");
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-wt-teal-mid" />
        <h2 className="mt-4 font-wt-heading text-xl font-bold text-wt-teal-deep">
          Solicitação recebida
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-wt-gray-700">
          Entraremos em contato pelo e-mail informado em até 15 dias úteis
          para confirmar sua identidade e atender o pedido.
        </p>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2.5 text-sm text-wt-teal-deep focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-wt-gray-700"
        >
          E-mail cadastrado <span className="text-wt-red">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="o mesmo que você usou na candidatura"
          className={inputClass}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-wt-gray-700">
          Tipo de solicitação <span className="text-wt-red">*</span>
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-wt-sm border border-wt-gray-300 bg-white px-4 py-3 text-sm hover:border-wt-primary">
            <input
              type="radio"
              name="request_type"
              value="exclusao"
              defaultChecked
              className="mt-0.5 h-4 w-4 border-wt-gray-300 text-wt-primary focus:ring-wt-primary"
            />
            <span>
              <span className="block font-semibold text-wt-teal-deep">
                Exclusão dos meus dados
              </span>
              <span className="block text-xs text-wt-gray-500">
                Remove candidaturas, CVs e cadastro no banco de talentos.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-wt-sm border border-wt-gray-300 bg-white px-4 py-3 text-sm hover:border-wt-primary">
            <input
              type="radio"
              name="request_type"
              value="acesso"
              className="mt-0.5 h-4 w-4 border-wt-gray-300 text-wt-primary focus:ring-wt-primary"
            />
            <span>
              <span className="block font-semibold text-wt-teal-deep">
                Acesso aos meus dados
              </span>
              <span className="block text-xs text-wt-gray-500">
                Relatório do que temos armazenado sobre você.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-wt-gray-700"
        >
          Motivo (opcional)
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={1000}
          placeholder="Se quiser, conte o motivo da sua solicitação."
          className={inputClass}
        />
      </div>

      {errorMsg && (
        <p className="rounded-wt-sm bg-red-50 p-3 text-sm text-wt-red">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-wt-sm bg-wt-orange px-6 py-3 font-wt-heading text-sm font-bold uppercase tracking-[0.05em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-wt-orange/90 disabled:opacity-50 sm:w-auto"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar solicitação
          </>
        )}
      </button>
    </form>
  );
}
