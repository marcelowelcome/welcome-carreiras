import { Briefcase, Users, UserCheck, Clock, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const supabase = createServiceRoleClient();

  const [jobsResult, applicationsResult, talentResult] = await Promise.all([
    supabase.from("jobs").select("status"),
    supabase.from("applications").select("stage"),
    supabase.from("talent_pool").select("id", { count: "exact", head: true }),
  ]);

  const errors: string[] = [];

  if (jobsResult.error) {
    console.error("[admin/dashboard] jobs:", jobsResult.error);
    errors.push("vagas");
  }
  if (applicationsResult.error) {
    console.error("[admin/dashboard] applications:", applicationsResult.error);
    errors.push("candidaturas");
  }
  if (talentResult.error) {
    console.error("[admin/dashboard] talent:", talentResult.error);
    errors.push("banco de talentos");
  }

  const jobs = jobsResult.data ?? [];
  const applications = applicationsResult.data ?? [];

  return {
    totalJobs: jobs.filter((j) => j.status === "published").length,
    totalApplications: applications.length,
    pendingReview: applications.filter((a) => a.stage === "inscrito").length,
    talentPool: talentResult.count ?? 0,
    queryErrors: errors,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-wt-gray-500">
        Visão geral do portal de carreiras
      </p>

      {stats.queryErrors.length > 0 && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Falha ao carregar dados de{" "}
            <strong>{stats.queryErrors.join(", ")}</strong>. Os números abaixo
            podem estar incompletos.
          </span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Vagas publicadas"
          value={stats.totalJobs}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatsCard
          title="Candidaturas"
          value={stats.totalApplications}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Aguardando triagem"
          value={stats.pendingReview}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatsCard
          title="Banco de talentos"
          value={stats.talentPool}
          icon={<UserCheck className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
