"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, X, Bell, BellOff } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import {
  BRAND_LABELS,
  BRAND_COLORS,
  DEPARTMENT_LABELS,
} from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { TalentPoolEntry, Brand, Department } from "@/types";

interface Props {
  entries: TalentPoolEntry[];
}

export function TalentPoolTable({ entries }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const area = searchParams.get("area") ?? "";
  const marca = searchParams.get("marca") ?? "";

  const hasFilters = q || area || marca;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/admin/banco-de-talentos?${params.toString()}`);
    },
    [router, searchParams]
  );

  const inputClass =
    "rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2 text-sm text-wt-teal-deep focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary";

  const columns: Column<TalentPoolEntry>[] = [
    {
      key: "person",
      header: "Pessoa",
      render: (e) => (
        <div>
          <p className="font-medium text-wt-teal-deep">{e.full_name}</p>
          <p className="text-xs text-wt-gray-500">{e.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Telefone",
      render: (e) => (
        <span className="text-wt-gray-700">{e.phone}</span>
      ),
    },
    {
      key: "areas",
      header: "Áreas",
      render: (e) => (
        <div className="flex flex-wrap gap-1">
          {(e.area_interest ?? []).map((d) => (
            <span
              key={d}
              className="inline-block rounded-full bg-wt-gray-100 px-2 py-0.5 text-[11px] font-medium text-wt-gray-700"
            >
              {DEPARTMENT_LABELS[d]}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "brands",
      header: "Marcas",
      render: (e) => (
        <div className="flex flex-wrap gap-1">
          {(e.brand_interest ?? []).map((b) => (
            <span
              key={b}
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                BRAND_COLORS[b]?.badge
              )}
            >
              {BRAND_LABELS[b]}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "alerts",
      header: "Alertas",
      render: (e) =>
        e.opt_in_alerts ? (
          <span className="inline-flex items-center gap-1 text-xs text-wt-teal-mid">
            <Bell className="h-3.5 w-3.5" /> Sim
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-wt-gray-500">
            <BellOff className="h-3.5 w-3.5" /> Não
          </span>
        ),
    },
    {
      key: "created_at",
      header: "Cadastro",
      render: (e) => (
        <span className="text-wt-gray-500">{formatDate(e.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
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

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={area}
          onChange={(e) => updateParam("area", e.target.value)}
          className={inputClass}
          aria-label="Filtrar por área"
        >
          <option value="">Todas as áreas</option>
          {(Object.entries(DEPARTMENT_LABELS) as [Department, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
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

        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push("/admin/banco-de-talentos")}
            className="inline-flex items-center gap-1.5 rounded-wt-sm border border-wt-gray-300 px-3 py-2 font-wt-heading text-xs font-semibold uppercase tracking-[0.08em] text-wt-gray-700 transition-colors hover:border-wt-primary hover:text-wt-primary"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={entries}
        emptyMessage="Nenhuma pessoa cadastrada no banco de talentos ainda"
      />
    </div>
  );
}
