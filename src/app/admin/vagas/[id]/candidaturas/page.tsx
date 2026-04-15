import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { KanbanBoard } from "@/components/admin/KanbanBoard";
import type { Application } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidaturasPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!job) notFound();

  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", id)
    .order("stage_updated_at", { ascending: false });
  if (error) {
    console.error("[admin/vagas/[id]/candidaturas] supabase:", error);
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/vagas"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para vagas
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary">
          Candidaturas
        </h1>
        <p className="mt-1 text-sm text-muted">{job.title}</p>
      </div>

      <KanbanBoard
        initialApplications={(applications ?? []) as Application[]}
        jobId={id}
      />
    </div>
  );
}
