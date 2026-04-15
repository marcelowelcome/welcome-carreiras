"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, X, ExternalLink, FileText } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import { CandidateDrawer } from "@/components/admin/CandidateDrawer";
import {
  BRAND_LABELS,
  BRAND_COLORS,
  APPLICATION_STAGE_LABELS,
  APPLICATION_STAGE_COLORS,
  APPLICATION_STAGES_ORDER,
} from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type {
  Application,
  ApplicationStage,
  Brand,
} from "@/types";

type ApplicationWithJob = Application & {
  jobs: {
    id: string;
    title: string;
    brand: Brand;
  } | null;
};

interface Props {
  applications: ApplicationWithJob[];
  jobs: { id: string; title: string }[];
}

export function AdminApplicationsTable({ applications, jobs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<ApplicationWithJob | null>(null);

  const q = searchParams.get("q") ?? "";
  const vaga = searchParams.get("vaga") ?? "";
  const marca = searchParams.get("marca") ?? "";
  const etapa = searchParams.get("etapa") ?? "";

  const hasFilters = q || vaga || marca || etapa;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/admin/candidaturas?${params.toString()}`);
    },
    [router, searchParams]
  );

  const inputClass =
    "rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2 text-sm text-wt-teal-deep focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary";

  const columns: Column<ApplicationWithJob>[] = [
    {
      key: "candidate",
      header: "Candidato",
      render: (a) => (
        <button
          type="button"
          onClick={() => setSelected(a)}
          className="text-left"
        >
          <p className="font-medium text-wt-teal-deep hover:text-wt-primary">
            {a.full_name}
          </p>
          <p className="text-xs text-wt-gray-500">{a.email}</p>
        </button>
      ),
    },
    {
      key: "job",
      header: "Vaga",
      render: (a) =>
        a.jobs ? (
          <Link
            href={`/admin/vagas/${a.jobs.id}/candidaturas`}
            className="inline-flex items-center gap-1 text-wt-primary hover:underline"
          >
            {a.jobs.title}
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-wt-gray-500">—</span>
        ),
    },
    {
      key: "brand",
      header: "Marca",
      render: (a) =>
        a.jobs ? (
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]",
              BRAND_COLORS[a.jobs.brand]?.badge
            )}
          >
            {BRAND_LABELS[a.jobs.brand]}
          </span>
        ) : null,
    },
    {
      key: "stage",
      header: "Etapa",
      render: (a) => (
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]",
            APPLICATION_STAGE_COLORS[a.stage]
          )}
        >
          {APPLICATION_STAGE_LABELS[a.stage]}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Recebida em",
      render: (a) => (
        <span className="text-wt-gray-500">{formatDate(a.created_at)}</span>
      ),
    },
    {
      key: "resume",
      header: "",
      render: (a) =>
        a.resume_path ? (
          <a
            href={`/api/admin/resumes?path=${encodeURIComponent(a.resume_path)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-wt-primary hover:underline"
            title="Baixar currículo"
          >
            <FileText className="h-4 w-4" />
            CV
          </a>
        ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wt-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          defaultValue={q}
          onChange={(e) => updateParam("q", e.target.value)}
          className={`${inputClass} w-full py-2.5 pl-9 pr-4`}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={vaga}
          onChange={(e) => updateParam("vaga", e.target.value)}
          className={inputClass}
          aria-label="Filtrar por vaga"
        >
          <option value="">Todas as vagas</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>

        <select
          value={marca}
          onChange={(e) => updateParam("marca", e.target.value)}
          className={inputClass}
          aria-label="Filtrar por marca"
        >
          <option value="">Todas as marcas</option>
          {(Object.entries(BRAND_LABELS) as [Brand, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>

        <select
          value={etapa}
          onChange={(e) => updateParam("etapa", e.target.value)}
          className={inputClass}
          aria-label="Filtrar por etapa"
        >
          <option value="">Todas as etapas</option>
          {APPLICATION_STAGES_ORDER.map((stage) => (
            <option key={stage} value={stage}>
              {APPLICATION_STAGE_LABELS[stage as ApplicationStage]}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push("/admin/candidaturas")}
            className="inline-flex items-center gap-1.5 rounded-wt-sm border border-wt-gray-300 px-3 py-2 font-wt-heading text-xs font-semibold uppercase tracking-[0.08em] text-wt-gray-700 transition-colors hover:border-wt-primary hover:text-wt-primary"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={applications}
        emptyMessage="Nenhuma candidatura encontrada"
      />

      {selected && (
        <CandidateDrawer
          application={selected}
          open={true}
          onClose={() => setSelected(null)}
          onUpdate={() => {
            setSelected(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
