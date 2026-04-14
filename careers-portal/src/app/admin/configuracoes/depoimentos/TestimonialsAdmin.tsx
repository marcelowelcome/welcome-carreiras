"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { BRAND_LABELS, BRAND_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Testimonial, Brand } from "@/types";

interface TestimonialsAdminProps {
  testimonials: Testimonial[];
}

export function TestimonialsAdmin({ testimonials }: TestimonialsAdminProps) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function handleSave(id: string, data: Partial<Testimonial>) {
    setSaving(id);
    const supabase = createBrowserClient();
    await supabase.from("testimonials").update(data).eq("id", id);
    setSaving(null);
    router.refresh();
  }

  async function handleAdd(data: {
    name: string;
    role: string;
    brand: Brand;
    quote: string;
  }) {
    setAdding(true);
    const supabase = createBrowserClient();
    await supabase.from("testimonials").insert({
      ...data,
      is_featured: true,
      is_visible: true,
      sort_order: testimonials.length + 1,
    });
    setAdding(false);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover depoimento de "${name}"?`)) return;
    const supabase = createBrowserClient();
    await supabase.from("testimonials").delete().eq("id", id);
    router.refresh();
  }

  async function toggleVisibility(id: string, currentVisible: boolean) {
    const supabase = createBrowserClient();
    await supabase
      .from("testimonials")
      .update({ is_visible: !currentVisible })
      .eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {testimonials.map((t) => (
        <TestimonialCard
          key={t.id}
          testimonial={t}
          saving={saving === t.id}
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
  onSave,
  onDelete,
  onToggleVisibility,
}: {
  testimonial: Testimonial;
  saving: boolean;
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
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
            BRAND_COLORS[testimonial.brand].badge
          )}
        >
          {BRAND_LABELS[testimonial.brand]}
        </span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={testimonial.is_visible}
              onChange={onToggleVisibility}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            Visivel
          </label>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted hover:text-error"
            title="Remover"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Cargo"
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value as Brand)}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {(Object.entries(BRAND_LABELS) as [Brand, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
      </div>

      <textarea
        rows={3}
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
        placeholder="Depoimento..."
        className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />

      <button
        type="button"
        onClick={() => onSave({ name, role, brand, quote })}
        disabled={saving}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Salvar
      </button>
    </div>
  );
}

function AddTestimonialForm({
  onAdd,
  adding,
}: {
  onAdd: (data: { name: string; role: string; brand: Brand; quote: string }) => void;
  adding: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [brand, setBrand] = useState<Brand>("corporativo");
  const [quote, setQuote] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted hover:border-accent hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Adicionar depoimento
      </button>
    );
  }

  function handleSubmit() {
    if (!name || !role || !quote) return;
    onAdd({ name, role, brand, quote });
    setName("");
    setRole("");
    setQuote("");
    setOpen(false);
  }

  return (
    <div className="rounded-xl border border-dashed border-accent bg-accent/5 p-6">
      <h3 className="text-sm font-semibold text-primary">Novo depoimento</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Cargo"
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value as Brand)}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {(Object.entries(BRAND_LABELS) as [Brand, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
      </div>
      <textarea
        rows={3}
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
        placeholder="Depoimento..."
        className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={adding || !name || !quote}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {adding && <Loader2 className="h-4 w-4 animate-spin" />}
          Adicionar
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
