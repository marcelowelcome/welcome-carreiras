import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { JobFormEditor } from "@/components/admin/JobFormEditor";
import type { Job } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarVagaPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (!job) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-primary">
        Editar vaga
      </h1>
      <p className="mt-1 text-sm text-muted">{job.title}</p>

      <div className="mt-8">
        <JobFormEditor job={job as Job} />
      </div>
    </div>
  );
}
