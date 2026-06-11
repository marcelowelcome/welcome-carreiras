"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { jobFormSchema } from "@/lib/validators";
import {
  BRAND_LABELS,
  DEPARTMENT_LABELS,
  WORK_MODEL_LABELS,
  CONTRACT_TYPE_LABELS,
} from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { SimpleEditor } from "@/components/ui/SimpleEditor";
import type { Job, ProcessStep } from "@/types";

type LoadingState = null | "draft" | "publish";

interface JobFormEditorProps {
  job?: Job;
}

export function JobFormEditor({ job }: JobFormEditorProps) {
  const router = useRouter();
  const isEditing = !!job;

  const [loading, setLoading] = useState<LoadingState>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [steps, setSteps] = useState<ProcessStep[]>(
    job?.process_steps ?? [{ order: 1, title: "", description: "" }]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // UX-021: warn on unload when dirty
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { order: prev.length + 1, title: "", description: "" },
    ]);
  }

  function removeStep(index: number) {
    setSteps((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))
    );
  }

  function updateStep(index: number, field: "title" | "description", value: string) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSteps((prev) => {
      const oldIndex = prev.findIndex((s) => s.order === active.id);
      const newIndex = prev.findIndex((s) => s.order === over.id);
      return arrayMove(prev, oldIndex, newIndex).map((s, i) => ({
        ...s,
        order: i + 1,
      }));
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      brand: form.get("brand") as string,
      department: form.get("department") as string,
      location: form.get("location") as string,
      work_model: form.get("work_model") as string,
      contract_type: (form.get("contract_type") as string) || undefined,
      salary_range: form.get("salary_range") as string,
      description: form.get("description") as string,
      responsibilities: form.get("responsibilities") as string,
      requirements_must: form.get("requirements_must") as string,
      requirements_nice: form.get("requirements_nice") as string,
      benefits: form.get("benefits") as string,
      process_steps: steps,
      is_featured: form.get("is_featured") === "on",
      closes_at: form.get("closes_at") as string,
    };

    const result = jobFormSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const action = (e.nativeEvent as SubmitEvent).submitter?.getAttribute(
      "data-action"
    );
    const shouldPublish = action === "publish";

    setLoading(shouldPublish ? "publish" : "draft");

    try {
      const payload = {
        ...result.data,
        salary_range: result.data.salary_range || null,
        requirements_nice: result.data.requirements_nice || null,
        benefits: result.data.benefits || null,
        closes_at: result.data.closes_at || null,
        status: shouldPublish ? "published" : "draft",
        published_at: shouldPublish ? new Date().toISOString() : job?.published_at ?? null,
        slug: isEditing ? job.slug : slugify(result.data.title),
      };

      const url = isEditing ? `/api/admin/jobs/${job.id}` : "/api/admin/jobs";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "erro" }));
        throw new Error(error);
      }

      setIsDirty(false);
      router.push("/admin/vagas");
      router.refresh();
    } catch (err) {
      console.error("Erro ao salvar vaga:", err);
      setErrors({ form: "Erro ao salvar. Tente novamente." });
      setLoading(null);
    }
  }

  // UX-022: today's date as min for closes_at
  const todayString = new Date().toISOString().split("T")[0];

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => setIsDirty(true)}
      className="space-y-8"
    >
      {errors.form && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-error">
          {errors.form}
        </div>
      )}

      {/* Info basica */}
      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Informações básicas</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Título da vaga" name="title" required defaultValue={job?.title} error={errors.title} />
          </div>

          <FormSelect
            label="Marca" name="brand" required defaultValue={job?.brand}
            options={BRAND_LABELS as Record<string, string>} error={errors.brand}
          />
          <FormSelect
            label="Departamento" name="department" required defaultValue={job?.department}
            options={DEPARTMENT_LABELS as Record<string, string>} error={errors.department}
          />
          <FormField label="Localização" name="location" required defaultValue={job?.location ?? "Curitiba, PR"} error={errors.location} />
          <FormSelect
            label="Modelo de trabalho" name="work_model" required defaultValue={job?.work_model}
            options={WORK_MODEL_LABELS as Record<string, string>} error={errors.work_model}
          />
          <FormSelect
            label="Tipo de contrato" name="contract_type" defaultValue={job?.contract_type ?? ""}
            options={CONTRACT_TYPE_LABELS as Record<string, string>} error={errors.contract_type}
          />
          <FormField label="Faixa salarial" name="salary_range" defaultValue={job?.salary_range ?? ""} placeholder="Ex: R$ 4.000 - R$ 6.000" error={errors.salary_range} />
          <FormField
            label="Data limite"
            name="closes_at"
            type="date"
            defaultValue={job?.closes_at?.split("T")[0] ?? ""}
            error={errors.closes_at}
            min={todayString}
          />

          <div className="flex items-center gap-3 sm:col-span-2">
            <input
              id="is_featured"
              name="is_featured"
              type="checkbox"
              defaultChecked={job?.is_featured ?? false}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <label htmlFor="is_featured" className="text-sm text-primary">
              Destacar na página inicial
            </label>
          </div>
        </div>
      </section>

      {/* Descrição */}
      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Descrição da vaga</h2>

        <div className="mt-4 space-y-4">
          <SimpleEditor label="Descrição" name="description" required defaultValue={job?.description} error={errors.description} />
          <SimpleEditor label="Responsabilidades" name="responsibilities" required defaultValue={job?.responsibilities} error={errors.responsibilities} />
          <SimpleEditor label="Requisitos obrigatórios" name="requirements_must" required defaultValue={job?.requirements_must} error={errors.requirements_must} />
          <SimpleEditor label="Diferenciais" name="requirements_nice" defaultValue={job?.requirements_nice ?? ""} error={errors.requirements_nice} />
          <SimpleEditor label="Benefícios" name="benefits" defaultValue={job?.benefits ?? ""} error={errors.benefits} />
        </div>
      </section>

      {/* Etapas do processo */}
      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Etapas do processo</h2>
            <p className="mt-0.5 text-xs text-muted">Arraste para reordenar</p>
          </div>
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-gray-50 hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </div>
        {errors.process_steps && (
          <p className="mt-2 text-xs text-error">{errors.process_steps}</p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((s) => s.order)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mt-4 space-y-3">
              {steps.map((step, i) => (
                <SortableStep
                  key={step.order}
                  step={step}
                  index={i}
                  onUpdate={updateStep}
                  onRemove={removeStep}
                  canRemove={steps.length > 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          data-action="draft"
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "draft" && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading === "draft" ? "Salvando..." : "Salvar rascunho"}
        </button>
        <button
          type="submit"
          data-action="publish"
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading === "publish" && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading === "publish"
            ? "Publicando..."
            : isEditing && job.status === "published"
            ? "Atualizar"
            : "Publicar"}
        </button>
      </div>
    </form>
  );
}

// --- Sortable step item ---

function SortableStep({
  step,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  step: ProcessStep;
  index: number;
  onUpdate: (index: number, field: "title" | "description", value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.order });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-lg border border-border bg-white p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-2 cursor-grab touch-none text-muted hover:text-primary active:cursor-grabbing"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="mt-2 text-sm font-bold text-accent">{step.order}</span>
      <div className="flex-1 space-y-2">
        <input
          type="text"
          placeholder="Título da etapa"
          value={step.title}
          onChange={(e) => onUpdate(index, "title", e.target.value)}
          className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <input
          type="text"
          placeholder="Descrição"
          value={step.description}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
          className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="mt-2 text-muted hover:text-error"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// --- Helper components ---

function FormField({
  label, name, type = "text", required, defaultValue, placeholder, error, min,
}: {
  label: string; name: string; type?: string; required?: boolean;
  defaultValue?: string; placeholder?: string; error?: string; min?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        id={name} name={name} type={type} required={required}
        defaultValue={defaultValue} placeholder={placeholder} min={min}
        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function FormSelect({
  label, name, required, defaultValue, options, error,
}: {
  label: string; name: string; required?: boolean;
  defaultValue?: string; options: Record<string, string>; error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <select
        id={name} name={name} required={required} defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <option value="">Selecione...</option>
        {Object.entries(options).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
