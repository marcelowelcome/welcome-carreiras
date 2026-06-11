"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Stat } from "@/components/public/CountersStrip";

interface EstatisticasEditorProps {
  initial: Stat[];
}

export function EstatisticasEditor({ initial }: EstatisticasEditorProps) {
  const [stats, setStats] = useState<Stat[]>(initial);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function update(index: number, field: keyof Stat, value: string | number) {
    setStats((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function addStat() {
    setStats((prev) => [...prev, { target: 0, suffix: "+", label: "" }]);
  }

  function removeStat(index: number) {
    setStats((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/admin/settings/company_stats", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { stats } }),
    });
    setLoading(false);
    if (res.ok) {
      setToast({ type: "success", message: "Estatísticas salvas com sucesso." });
    } else {
      setToast({ type: "error", message: "Erro ao salvar. Tente novamente." });
    }
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_80px_80px_auto] items-end gap-3 rounded-wt-sm border border-wt-gray-300/60 bg-white p-4 shadow-wt-sm"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-wt-gray-700">
                Rótulo
              </label>
              <input
                type="text"
                value={stat.label}
                onChange={(e) => update(i, "label", e.target.value)}
                className="w-full rounded-wt-sm border border-wt-gray-300/60 px-3 py-2 text-sm focus:border-wt-primary focus:outline-none"
                placeholder="Ex: Colaboradores"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-wt-gray-700">
                Número
              </label>
              <input
                type="number"
                value={stat.target}
                onChange={(e) => update(i, "target", Number(e.target.value))}
                className="w-full rounded-wt-sm border border-wt-gray-300/60 px-3 py-2 text-sm focus:border-wt-primary focus:outline-none"
                min={0}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-wt-gray-700">
                Sufixo
              </label>
              <input
                type="text"
                value={stat.suffix ?? ""}
                onChange={(e) => update(i, "suffix", e.target.value)}
                className="w-full rounded-wt-sm border border-wt-gray-300/60 px-3 py-2 text-sm focus:border-wt-primary focus:outline-none"
                placeholder="+"
              />
            </div>
            <button
              type="button"
              onClick={() => removeStat(i)}
              disabled={stats.length <= 1}
              className="mb-0.5 rounded p-2 text-wt-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Remover estatística"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addStat}
          disabled={stats.length >= 8}
          className="inline-flex items-center gap-2 rounded-wt-sm border border-wt-gray-300/60 px-4 py-2 text-sm font-medium text-wt-gray-700 hover:bg-wt-gray-100/60 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Adicionar estatística
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-wt-sm bg-wt-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-wt-primary/90 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {toast && (
        <div
          role="alert"
          className={`rounded-wt-sm px-4 py-3 text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
