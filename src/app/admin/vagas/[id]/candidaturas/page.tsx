import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/admin/KanbanBoard";
import type { Application } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidaturasPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!job) notFound();

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", id)
    .order("stage_updated_at", { ascending: false });

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
