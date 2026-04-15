"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield, Check, X } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import { cn, formatDate } from "@/lib/utils";
import type { LgpdRequest } from "@/types";

interface Props {
  requests: LgpdRequest[];
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700",
  resolvido: "bg-green-100 text-green-700",
  cancelado: "bg-gray-100 text-gray-700",
};

const TYPE_LABELS: Record<string, string> = {
  exclusao: "Exclusão",
  acesso: "Acesso",
};

export function LgpdRequestsTable({ requests }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<LgpdRequest | null>(null);
  const [note, setNote] = useState("");
  const [executeDeletion, setExecuteDeletion] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<
    { applications: number; talentPool: number; cvs: number } | null
  >(null);

  function openModal(r: LgpdRequest) {
    setModal(r);
    setNote("");
    setExecuteDeletion(r.request_type === "exclusao");
    setError("");
    setSummary(null);
  }

  async function resolve() {
    if (!modal) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/lgpd/requests/${modal.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        execute_deletion: modal.request_type === "exclusao" && executeDeletion,
        note: note.trim() || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao resolver");
      return;
    }
    const body = (await res.json()) as {
      deletion?: { applications: number; talentPool: number; cvs: number };
    };
    setSummary(body.deletion ?? null);
    router.refresh();
    // Fecha após 2s para dar tempo de mostrar o resumo
    setTimeout(() => {
      setModal(null);
    }, 2000);
  }

  const columns: Column<LgpdRequest>[] = [
    {
      key: "email",
      header: "E-mail",
      render: (r) => (
        <p className="font-medium text-wt-teal-deep">{r.email}</p>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      render: (r) => (
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]",
            r.request_type === "exclusao"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          )}
        >
          {TYPE_LABELS[r.request_type]}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]",
            STATUS_COLORS[r.status]
          )}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Recebida em",
      render: (r) => (
        <span className="text-wt-gray-500">{formatDate(r.created_at)}</span>
      ),
    },
    {
      key: "reason",
      header: "Motivo",
      render: (r) =>
        r.reason ? (
          <span className="line-clamp-2 text-sm text-wt-gray-700" title={r.reason}>
            {r.reason}
          </span>
        ) : (
          <span className="text-wt-gray-500">—</span>
        ),
    },
    {
      key: "action",
      header: "",
      render: (r) =>
        r.status === "pendente" ? (
          <button
            type="button"
            onClick={() => openModal(r)}
            className="inline-flex items-center gap-1 rounded-wt-sm border border-wt-primary bg-white px-3 py-1.5 font-wt-heading text-[11px] font-semibold uppercase tracking-[0.08em] text-wt-primary transition-colors hover:bg-wt-primary hover:text-white"
          >
            <Shield className="h-3.5 w-3.5" />
            Resolver
          </button>
        ) : (
          <span className="text-xs text-wt-gray-500">
            {r.resolved_at ? formatDate(r.resolved_at) : ""}
          </span>
        ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={requests}
        emptyMessage="Nenhuma solicitação LGPD até o momento"
      />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !saving && setModal(null)}
          />
          <div className="relative w-full max-w-lg rounded-wt-md bg-wt-off-white p-6 shadow-wt-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.15em] text-wt-primary">
                  Resolver solicitação LGPD
                </p>
                <h3 className="mt-1 font-wt-heading text-xl font-bold text-wt-teal-deep">
                  {TYPE_LABELS[modal.request_type]} — {modal.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !saving && setModal(null)}
                className="text-wt-gray-500 hover:text-wt-teal-deep"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {summary ? (
              <div className="mt-6 rounded-wt-sm bg-white p-4 shadow-wt-sm">
                <p className="flex items-center gap-2 font-wt-heading text-sm font-bold text-wt-teal-mid">
                  <Check className="h-4 w-4" />
                  Resolvido
                </p>
                <ul className="mt-3 space-y-1 text-sm text-wt-gray-700">
                  <li>Candidaturas apagadas: {summary.applications}</li>
                  <li>Cadastros no banco de talentos apagados: {summary.talentPool}</li>
                  <li>CVs removidos do storage: {summary.cvs}</li>
                </ul>
              </div>
            ) : (
              <>
                {modal.reason && (
                  <div className="mt-4 rounded-wt-sm bg-white p-3 text-sm">
                    <p className="font-semibold text-wt-teal-deep">Motivo informado</p>
                    <p className="mt-1 whitespace-pre-line text-wt-gray-700">
                      {modal.reason}
                    </p>
                  </div>
                )}

                {modal.request_type === "exclusao" && (
                  <label className="mt-4 flex items-start gap-3 rounded-wt-sm bg-white p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={executeDeletion}
                      onChange={(e) => setExecuteDeletion(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-wt-gray-300 text-wt-primary focus:ring-wt-primary"
                    />
                    <span>
                      <span className="block font-semibold text-wt-teal-deep">
                        Executar exclusão agora
                      </span>
                      <span className="block text-xs text-wt-gray-500">
                        Apaga candidaturas, CVs e cadastro do banco de talentos
                        relacionados a <strong>{modal.email}</strong>. Ação
                        irreversível.
                      </span>
                    </span>
                  </label>
                )}

                <div className="mt-4">
                  <label className="text-sm font-medium text-wt-gray-700">
                    Anotação interna (opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ex: confirmei identidade por e-mail em 15/04"
                    className="mt-1 w-full rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2 text-sm text-wt-teal-deep focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary"
                  />
                </div>

                {error && (
                  <p className="mt-3 rounded-wt-sm bg-red-50 p-2 text-xs text-wt-red">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    disabled={saving}
                    className="rounded-wt-sm border border-wt-gray-300 bg-white px-4 py-2 font-wt-heading text-xs font-semibold uppercase tracking-[0.08em] text-wt-gray-700 transition-colors hover:border-wt-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={resolve}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-wt-sm bg-wt-primary px-4 py-2 font-wt-heading text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-wt-primary-dark disabled:opacity-50"
                  >
                    {saving ? "Processando..." : "Marcar como resolvida"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
