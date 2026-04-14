"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import {
  BRAND_LABELS,
  DEPARTMENT_LABELS,
  WORK_MODEL_LABELS,
} from "@/lib/constants";
import type { Brand, Department, WorkModel } from "@/types";

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("q") ?? "";
  const brand = searchParams.get("marca") ?? "";
  const department = searchParams.get("departamento") ?? "";
  const workModel = searchParams.get("modelo") ?? "";

  const hasFilters = search || brand || department || workModel;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/vagas?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearFilters() {
    router.push("/vagas");
  }

  const inputClass =
    "w-full rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2.5 text-sm text-wt-teal-deep placeholder:text-wt-gray-500 focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary";

  return (
    <div className="space-y-4">
      {/* Busca por texto */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-wt-gray-500" />
        <input
          type="text"
          placeholder="Buscar por título ou palavra-chave..."
          value={search}
          onChange={(e) => updateParam("q", e.target.value)}
          className={`${inputClass} py-3 pl-10 pr-4`}
        />
      </div>

      {/* Filtros em linha */}
      <div className="flex flex-wrap gap-3">
        <select
          value={brand}
          onChange={(e) => updateParam("marca", e.target.value)}
          className={inputClass + " w-auto"}
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
          value={department}
          onChange={(e) => updateParam("departamento", e.target.value)}
          className={inputClass + " w-auto"}
          aria-label="Filtrar por departamento"
        >
          <option value="">Todos os departamentos</option>
          {(Object.entries(DEPARTMENT_LABELS) as [Department, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>

        <select
          value={workModel}
          onChange={(e) => updateParam("modelo", e.target.value)}
          className={inputClass + " w-auto"}
          aria-label="Filtrar por modelo de trabalho"
        >
          <option value="">Todos os modelos</option>
          {(Object.entries(WORK_MODEL_LABELS) as [WorkModel, string][]).map(
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
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-wt-sm border border-wt-gray-300 px-3 py-2 font-wt-heading text-xs font-semibold uppercase tracking-[0.08em] text-wt-gray-700 transition-colors hover:border-wt-primary hover:text-wt-primary"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
