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

  // Duas queries independentes — evita qualquer particularidade do JOIN
  // embutido do PostgREST que estava dropando linhas silenciosamente.
  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.etapa) {
    query = query.eq("stage", params.etapa);
  }

  const [appsResult, jobsResult] = await Promise.all([
    query,
    supabase.from("jobs").select("id, title, brand").order("title"),
  ]);

  if (appsResult.error) {
    console.error("[admin/candidaturas] applications:", appsResult.error);
  }
  if (jobsResult.error) {
    console.error("[admin/candidaturas] jobs:", jobsResult.error);
  }

  const rawApps = (appsResult.data ?? []) as Application[];
  const jobsById = new Map(
    (jobsResult.data ?? []).map((j) => [
      j.id as string,
      { id: j.id as string, title: j.title as string, brand: j.brand as Brand },
    ])
  );

  let applications: ApplicationWithJob[] = rawApps.map((a) => ({
    ...a,
    jobs: jobsById.get(a.job_id) ?? null,
  }));

  // Filtros aplicados depois do merge
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

  const jobsForFilter = Array.from(jobsById.values()).map(({ id, title }) => ({
    id,
    title,
  }));

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
          jobs={jobsForFilter}
        />
      </div>
    </div>
  );
}
