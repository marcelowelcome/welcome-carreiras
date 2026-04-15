import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminApplicationsTable } from "./AdminApplicationsTable";
import type { Application, ApplicationStage, Brand } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    vaga?: string;
    marca?: Brand;
    etapa?: ApplicationStage;
  }>;
}

type ApplicationWithJob = Application & {
  jobs: {
    id: string;
    title: string;
    brand: Brand;
  } | null;
};

export default async function AdminCandidaturasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // Middleware já protege /admin. Usamos service role para evitar RLS no read.
  const supabase = createServiceRoleClient();

  let query = supabase
    .from("applications")
    .select(
      "*, jobs(id, title, brand)"
    )
    .order("created_at", { ascending: false });

  if (params.etapa) {
    query = query.eq("stage", params.etapa);
  }

  const { data } = await query;
  let applications = (data ?? []) as ApplicationWithJob[];

  // Filtros client-side (sobre campos aninhados / full-text simples)
  if (params.vaga) {
    applications = applications.filter((a) => a.jobs?.id === params.vaga);
  }
  if (params.marca) {
    applications = applications.filter((a) => a.jobs?.brand === params.marca);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    applications = applications.filter(
      (a) =>
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  }

  // Lista de vagas para o filtro (só as que têm candidaturas)
  const { data: jobsForFilter } = await supabase
    .from("jobs")
    .select("id, title")
    .order("title");

  return (
    <div>
      <div>
        <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
          Candidaturas
        </h1>
        <p className="mt-1 text-sm text-wt-gray-500">
          {applications.length}{" "}
          {applications.length === 1
            ? "candidatura encontrada"
            : "candidaturas encontradas"}
        </p>
      </div>

      <div className="mt-8">
        <AdminApplicationsTable
          applications={applications}
          jobs={jobsForFilter ?? []}
        />
      </div>
    </div>
  );
}
