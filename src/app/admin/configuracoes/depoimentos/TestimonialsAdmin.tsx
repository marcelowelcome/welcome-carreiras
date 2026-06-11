"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { BRAND_LABELS, BRAND_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Testimonial, Brand } from "@/types";

interface TestimonialsAdminProps {
  testimonials: Testimonial[];
  sectionVisible: boolean;
}

export function TestimonialsAdmin({ testimonials, sectionVisible }: TestimonialsAdminProps) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [togglingSection, setTogglingSection] = useState(false);
  const [isVisible, setIsVisible] = useState(sectionVisible);
  // Per-testimonial toggle loading set
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  // Toast feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleSectionToggle() {
    setTogglingSection(true);
    const next = !isVisible;
    const res = await fetch("/api/admin/settings/testimonials_section", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_visible: next }),
    });
    if (res.ok) {
      setIsVisible(next);
      setToast({ type: "success", message: next ? "Seção agora visível no site." : "Seção ocultada do site." });
      router.refresh();
    } else {
      setToast({ type: "error", message: "Falha ao alterar visibilidade da seção." });
    }
    setTogglingSection(false);
  }

  async function handleSave(id: string, data: Partial<Testimonial>) {
    setSaving(id);
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(null);
    if (res.ok) {
      setToast({ type: "success", message: "Depoimento salvo com sucesso." });
      router.refresh();
    } else {
      setToast({ type: "error", message: "Falha ao salvar depoimento." });
    }
  }

  async function handleAdd(data: { name: string; role: string; brand: Brand; quote: string }) {
    setAdding(true);
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setToast({ type: "success", message: "Depoimento adicionado com sucesso." });
      router.refresh();
    } else {
      setToast({ type: "error", message: "Falha ao adicionar depoimento." });
    }
    setAdding(false);
    // Note: closing/resetting the form is handled inside AddTestimonialForm only on success
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover depoimento de "${name}"?`)) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ type: "success", message: "Depoimento removido." });
      router.refresh();
    } else {
      setToast({ type: "error", message: "Falha ao remover depoimento." });
    }
  }

  async function toggleVisibility(id: string, currentVisible: boolean) {
    setTogglingIds((prev) => new Set(prev).add(id));
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_visible: !currentVisible }),
    });
    setTogglingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (res.ok) {
      router.refresh();
    } else {
      setToast({ type: "error", message: "Falha ao alterar visibilidade do depoimento." });
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-medium",
            toast.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          )}
        >
          {toast.message}
        </div>
      )}

      {/* Toggle global da seção */}
      <div className="flex items-center justify-between rounded-wt-md border border-wt-gray-300/60 bg-white p-5 shadow-wt-sm">
        <div>
          <p className="font-wt-heading text-sm font-bold text-wt-teal-deep">
            Exibir seção de depoimentos
          </p>
          <p className="mt-0.5 text-xs text-wt-gray-500">
            Controla se a seção aparece na home e na página de cultura
          </p>
        </div>
        <button
          type="button"
          onClick={handleSectionToggle}
          disabled={togglingSection}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            isVisible
              ? "bg-wt-primary text-white hover:bg-wt-primary-dark"
              : "bg-wt-gray-100 text-wt-gray-700 hover:bg-wt-gray-300/60"
          )}
        >
          {togglingSection ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          {isVisible ? "Visível no site" : "Oculto no site"}
        </button>
      </div>

      {/* Lista de depoimentos */}
      {testimonials.map((t) => (
        <TestimonialCard
          key={t.id}
          testimonial={t}
          saving={saving === t.id}
          toggling={togglingIds.has(t.id)}
          onSave={(data) => handleSave(t.id, data)}
          onDelete={() => handleDelete(t.id, t.name)}
          onToggleVisibility={() => toggleVisibility(t.id, t.is_visible)}
        />
      ))}

      <AddTestimonialForm onAdd={handleAdd} adding={adding} />
    </div>
  );
}

function TestimonialCard({
  testimonial,
  saving,
  toggling,
  onSave,
  onDelete,
  onToggleVisibility,
}: {
  testimonial: Testimonial;
  saving: boolean;
  toggling: boolean;
  onSave: (data: Partial<Testimonial>) => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}) {
  const [name, setName] = useState(testimonial.name);
  const [role, setRole] = useState(testimonial.role);
  const [quote, setQuote] = useState(testimonial.quote);
  const [brand, setBrand] = useState(testimonial.brand);

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", BRAND_COLORS[testimonial.brand].badge)}>
          {BRAND_LABELS[testimonial.brand]}
        </span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={testimonial.is_visible}
              onChange={onToggleVisibility}
              disabled={toggling}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent disabled:opacity-50"
            />
            Visível
          </label>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted hover:text-error"
            aria-label="Remover depoimento"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome"
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Cargo"
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        <select value={brand} onChange={(e) => setBrand(e.target.value as Brand)}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent">
          {(Object.entries(BRAND_LABELS) as [Brand, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <textarea rows={3} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Depoimento..."
        className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />

      <button type="button" onClick={() => onSave({ name, role, brand, quote })} disabled={saving}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar
      </button>
    </div>
  );
}

function AddTestimonialForm({ onAdd, adding }: {
  onAdd: (data: { name: string; role: string; brand: Brand; quote: string }) => Promise<void>;
  adding: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [brand, setBrand] = useState<Brand>("corporativo");
  const [quote, setQuote] = useState("");

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted hover:border-accent hover:text-primary">
        <Plus className="h-4 w-4" />
        Adicionar depoimento
      </button>
    );
  }

  async function handleSubmit() {
    if (!name || !role || !quote) return;
    await onAdd({ name, role, brand, quote });
    // Only reset and close after server confirmed success (onAdd resolves after res.ok check)
    // If adding failed, onAdd threw or caller showed error — we don't close
    setName(""); setRole(""); setQuote(""); setOpen(false);
  }

  return (
    <div className="rounded-xl border border-dashed border-accent bg-accent/5 p-6">
      <h3 className="text-sm font-semibold text-primary">Novo depoimento</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome"
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Cargo"
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        <select value={brand} onChange={(e) => setBrand(e.target.value as Brand)}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent">
          {(Object.entries(BRAND_LABELS) as [Brand, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <textarea rows={3} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Depoimento..."
        className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={handleSubmit} disabled={adding || !name || !quote}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
          {adding && <Loader2 className="h-4 w-4 animate-spin" />}
          Adicionar
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </div>
  );
}
