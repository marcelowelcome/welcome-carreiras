"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { CultureContent } from "@/types";

interface CultureEditorProps {
  sections: CultureContent[];
}

export function CultureEditor({ sections }: CultureEditorProps) {
  const manifesto = sections.find((s) => s.section_key === "manifesto");
  const values = sections.find((s) => s.section_key === "values");
  const benefits = sections.find((s) => s.section_key === "benefits");
  const dei = sections.find((s) => s.section_key === "dei");

  return (
    <div className="space-y-8">
      {manifesto && <ManifestoEditor section={manifesto} />}
      {values && <ValuesEditor section={values} />}
      {benefits && <BenefitsEditor section={benefits} />}
      {dei && <DeiEditor section={dei} />}
    </div>
  );
}

// ==========================================
// Hook para salvar
// ==========================================

function useSaveSection() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function save(id: string, updates: { title?: string; content?: Record<string, unknown>; is_visible?: boolean }) {
    setSaving(true);
    const supabase = createBrowserClient();
    await supabase
      .from("culture_content")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSaving(false);
    router.refresh();
  }

  return { saving, save };
}

// ==========================================
// Manifesto — titulo + texto
// ==========================================

function ManifestoEditor({ section }: { section: CultureContent }) {
  const { saving, save } = useSaveSection();
  const content = section.content as { text?: string };
  const [title, setTitle] = useState(section.title);
  const [text, setText] = useState(content.text ?? "");
  const [visible, setVisible] = useState(section.is_visible);

  function handleSave() {
    save(section.id, { title, content: { text }, is_visible: visible });
  }

  return (
    <SectionCard
      label="Manifesto"
      description="Texto principal exibido no topo da página de cultura"
      saving={saving}
      visible={visible}
      onVisibilityChange={setVisible}
      onSave={handleSave}
    >
      <Field label="Titulo" value={title} onChange={setTitle} />
      <TextArea label="Texto do manifesto" value={text} onChange={setText} rows={5} />
    </SectionCard>
  );
}

// ==========================================
// Valores — lista de cards com icone, titulo, descricao
// ==========================================

interface ValueItem {
  icon: string;
  title: string;
  description: string;
}

const ICON_OPTIONS = [
  { value: "heart", label: "Coracao" },
  { value: "users", label: "Pessoas" },
  { value: "rocket", label: "Foguete" },
  { value: "globe", label: "Globo" },
  { value: "trending-up", label: "Crescimento" },
  { value: "sparkles", label: "Estrelas" },
  { value: "target", label: "Alvo" },
  { value: "lightbulb", label: "Lampada" },
  { value: "shield", label: "Escudo" },
  { value: "zap", label: "Raio" },
];

function ValuesEditor({ section }: { section: CultureContent }) {
  const { saving, save } = useSaveSection();
  const content = section.content as { items?: ValueItem[] };
  const [title, setTitle] = useState(section.title);
  const [items, setItems] = useState<ValueItem[]>(content.items ?? []);
  const [visible, setVisible] = useState(section.is_visible);

  function addItem() {
    setItems([...items, { icon: "heart", title: "", description: "" }]);
  }

  function updateItem(index: number, field: keyof ValueItem, value: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleSave() {
    save(section.id, { title, content: { items }, is_visible: visible });
  }

  return (
    <SectionCard
      label="Valores"
      description="Valores exibidos em cards na página de cultura"
      saving={saving}
      visible={visible}
      onVisibilityChange={setVisible}
      onSave={handleSave}
    >
      <Field label="Titulo da secao" value={title} onChange={setTitle} />

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <select
                  value={item.icon}
                  onChange={(e) => updateItem(i, "icon", e.target.value)}
                  className="w-36 rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(i, "title", e.target.value)}
                  placeholder="Titulo do valor"
                  className="flex-1 rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <textarea
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                placeholder="Descricao..."
                rows={2}
                className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <button type="button" onClick={() => removeItem(i)} className="self-start text-muted hover:text-error">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted hover:border-accent hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar valor
      </button>
    </SectionCard>
  );
}

// ==========================================
// Benefícios — categorias com lista de itens
// ==========================================

interface BenefitCategory {
  icon: string;
  title: string;
  items: string[];
}

const BENEFIT_ICON_OPTIONS = [
  { value: "heart-pulse", label: "Saude" },
  { value: "graduation-cap", label: "Educacao" },
  { value: "home", label: "Casa/Flex" },
  { value: "gift", label: "Presente" },
  { value: "coffee", label: "Cafe" },
  { value: "plane", label: "Viagem" },
  { value: "smile", label: "Bem-estar" },
  { value: "dollar-sign", label: "Financeiro" },
];

function BenefitsEditor({ section }: { section: CultureContent }) {
  const { saving, save } = useSaveSection();
  const content = section.content as { categories?: BenefitCategory[] };
  const [title, setTitle] = useState(section.title);
  const [categories, setCategories] = useState<BenefitCategory[]>(content.categories ?? []);
  const [visible, setVisible] = useState(section.is_visible);

  function addCategory() {
    setCategories([...categories, { icon: "gift", title: "", items: [""] }]);
  }

  function updateCategory(index: number, field: "icon" | "title", value: string) {
    setCategories(categories.map((cat, i) => (i === index ? { ...cat, [field]: value } : cat)));
  }

  function removeCategory(index: number) {
    setCategories(categories.filter((_, i) => i !== index));
  }

  function updateItem(catIndex: number, itemIndex: number, value: string) {
    setCategories(categories.map((cat, ci) =>
      ci === catIndex
        ? { ...cat, items: cat.items.map((item, ii) => (ii === itemIndex ? value : item)) }
        : cat
    ));
  }

  function addItem(catIndex: number) {
    setCategories(categories.map((cat, ci) =>
      ci === catIndex ? { ...cat, items: [...cat.items, ""] } : cat
    ));
  }

  function removeItem(catIndex: number, itemIndex: number) {
    setCategories(categories.map((cat, ci) =>
      ci === catIndex ? { ...cat, items: cat.items.filter((_, ii) => ii !== itemIndex) } : cat
    ));
  }

  function handleSave() {
    save(section.id, { title, content: { categories }, is_visible: visible });
  }

  return (
    <SectionCard
      label="Benefícios"
      description="Categorias de benefícios com listas de itens"
      saving={saving}
      visible={visible}
      onVisibilityChange={setVisible}
      onSave={handleSave}
    >
      <Field label="Titulo da secao" value={title} onChange={setTitle} />

      <div className="space-y-4">
        {categories.map((cat, ci) => (
          <div key={ci} className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <select
                value={cat.icon}
                onChange={(e) => updateCategory(ci, "icon", e.target.value)}
                className="w-36 rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {BENEFIT_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={cat.title}
                onChange={(e) => updateCategory(ci, "title", e.target.value)}
                placeholder="Nome da categoria"
                className="flex-1 rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button type="button" onClick={() => removeCategory(ci)} className="text-muted hover:text-error">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2 pl-4">
              {cat.items.map((item, ii) => (
                <div key={ii} className="flex gap-2">
                  <span className="mt-2 text-xs text-accent">•</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateItem(ci, ii, e.target.value)}
                    placeholder="Item do beneficio"
                    className="flex-1 rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button type="button" onClick={() => removeItem(ci, ii)} className="text-muted hover:text-error">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(ci)}
                className="text-xs text-accent hover:underline"
              >
                + Adicionar item
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCategory}
        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted hover:border-accent hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar categoria
      </button>
    </SectionCard>
  );
}

// ==========================================
// DEI — titulo + texto
// ==========================================

function DeiEditor({ section }: { section: CultureContent }) {
  const { saving, save } = useSaveSection();
  const content = section.content as { text?: string };
  const [title, setTitle] = useState(section.title);
  const [text, setText] = useState(content.text ?? "");
  const [visible, setVisible] = useState(section.is_visible);

  function handleSave() {
    save(section.id, { title, content: { text }, is_visible: visible });
  }

  return (
    <SectionCard
      label="Diversidade e Inclusao"
      description="Texto sobre DEI exibido no final da página de cultura"
      saving={saving}
      visible={visible}
      onVisibilityChange={setVisible}
      onSave={handleSave}
    >
      <Field label="Titulo" value={title} onChange={setTitle} />
      <TextArea label="Texto" value={text} onChange={setText} rows={4} />
    </SectionCard>
  );
}

// ==========================================
// Componentes base
// ==========================================

function SectionCard({
  label,
  description,
  saving,
  visible,
  onVisibilityChange,
  onSave,
  children,
}: {
  label: string;
  description: string;
  saving: boolean;
  visible: boolean;
  onVisibilityChange: (v: boolean) => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">{label}</h2>
          <p className="text-xs text-muted">{description}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => onVisibilityChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
          />
          Visivel no site
        </label>
      </div>

      <div className="mt-5 space-y-4">{children}</div>

      <div className="mt-5 border-t border-border pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar alteracoes
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
