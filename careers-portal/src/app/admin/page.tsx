import { Briefcase, Users, UserCheck, Clock } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { createServerClient } from "@/lib/supabase/server";

async function getDashboardStats() {
  const supabase = await createServerClient();

  const [jobsResult, applicationsResult, talentResult] = await Promise.all([
    supabase.from("jobs").select("status"),
    supabase.from("applications").select("stage"),
    supabase.from("talent_pool").select("id", { count: "exact", head: true }),
  ]);

  const jobs = jobsResult.data ?? [];
  const applications = applicationsResult.data ?? [];

  return {
    totalJobs: jobs.filter((j) => j.status === "published").length,
    totalApplications: applications.length,
    pendingReview: applications.filter((a) => a.stage === "inscrito").length,
    talentPool: talentResult.count ?? 0,
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
