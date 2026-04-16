"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Copy, Trash2, Eye, Users } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import {
  BRAND_LABELS,
  BRAND_COLORS,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
} from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

interface JobRow {
  id: string;
  title: string;
  brand: string;
  status: string;
  created_at: string;
  published_at: string | null;
  applications_count: number;
}

interface AdminJobsTableProps {
  jobs: JobRow[];
}

export function AdminJobsTable({ jobs }: AdminJobsTableProps) {
  const router = useRouter();

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Deseja encerrar a vaga "${title}"?`)) return;

    await fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" }),
    });
    router.refresh();
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/admin/jobs/${id}`);
    if (!res.ok) return;
    const { data: job } = (await res.json()) as { data: Record<string, unknown> };
    if (!job) return;

    await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: job.title,
        brand: job.brand,
        department: job.department,
        location: job.location,
        work_model: job.work_model,
        contract_type: job.contract_type,
        salary_range: job.salary_range,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements_must: job.requirements_must,
        requirements_nice: job.requirements_nice,
        benefits: job.benefits,
        process_steps: job.process_steps,
        closes_at: job.closes_at,
        slug: `${job.slug}-copia-${Date.now()}`,
        status: "draft",
        is_featured: false,
        published_at: null,
      }),
    });

    router.refresh();
  }

  const columns: Column<JobRow>[] = [
    {
      key: "title",
      header: "Título",
      render: (job) => (
        <Link
          href={`/admin/vagas/${job.id}`}
          className="font-medium text-primary hover:text-accent"
        >
          {job.title}
        </Link>
      ),
    },
    {
      key: "brand",
      header: "Marca",
      render: (job) => {
        const brand = job.brand as keyof typeof BRAND_LABELS;
        return (
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
              BRAND_COLORS[brand]?.badge
            )}
          >
            {BRAND_LABELS[brand]}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (job) => {
        const status = job.status as keyof typeof JOB_STATUS_LABELS;
        return (
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
              JOB_STATUS_COLORS[status]
            )}
          >
            {JOB_STATUS_LABELS[status]}
          </span>
        );
      },
    },
    {
      key: "applications",
      header: "Candidaturas",
      render: (job) => (
        <Link
          href={`/admin/vagas/${job.id}/candidaturas`}
          className="inline-flex items-center gap-1 text-muted hover:text-primary"
        >
          <Users className="h-4 w-4" />
          {job.applications_count}
        </Link>
      ),
    },
    {
      key: "created_at",
      header: "Criada em",
      render: (job) => (
        <span className="text-muted">{formatDate(job.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (job) => (
        <div className="flex items-center gap-1">
          {job.status === "published" && (
            <Link
              href={`/vagas/${job.id}`}
              target="_blank"
              className="rounded p-1.5 text-muted hover:bg-gray-100 hover:text-primary"
              title="Ver no site"
            >
              <Eye className="h-4 w-4" />
            </Link>
          )}
          <Link
            href={`/admin/vagas/${job.id}`}
            className="rounded p-1.5 text-muted hover:bg-gray-100 hover:text-primary"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => handleDuplicate(job.id)}
            className="rounded p-1.5 text-muted hover:bg-gray-100 hover:text-primary"
            title="Duplicar"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(job.id, job.title)}
            className="rounded p-1.5 text-muted hover:bg-gray-100 hover:text-error"
            title="Encerrar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={jobs} emptyMessage="Nenhuma vaga criada ainda" />
  );
}
