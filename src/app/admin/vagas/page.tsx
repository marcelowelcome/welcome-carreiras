import Link from "next/link";
import { Plus } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminJobsTable } from "./AdminJobsTable";
import type { Job } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminVagasPage() {
  const supabase = createServiceRoleClient();

  // Duas queries separadas — o embed applications(count) do PostgREST
  // dropava linhas silenciosamente (mesmo bug de /admin/candidaturas).
  const [jobsResult, countsResult] = await Promise.all([
    supabase.from("jobs").select("*").order("created_at", { ascending: false }),
    supabase.from("applications").select("job_id"),
  ]);

  if (jobsResult.error) console.error("[admin/vagas] jobs:", jobsResult.error);
  if (countsResult.error) console.error("[admin/vagas] counts:", countsResult.error);

  const rawJobs = (jobsResult.data ?? []) as Job[];
  const applications = countsResult.data ?? [];

  // Conta candidaturas por job_id
  const countByJob = new Map<string, number>();
  for (const app of applications) {
    const jid = app.job_id as string;
    countByJob.set(jid, (countByJob.get(jid) ?? 0) + 1);
  }

  const jobs = rawJobs.map((job) => ({
    ...job,
    applications_count: countByJob.get(job.id) ?? 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
            Vagas
          </h1>
          <p className="mt-1 text-sm text-wt-gray-500">
            Gerencie as vagas do portal de carreiras
          </p>
        </div>
        <Link
          href="/admin/vagas/nova"
          className="inline-flex items-center gap-2 rounded-wt-sm bg-wt-orange px-5 py-2.5 font-wt-heading text-xs font-bold uppercase tracking-[0.05em] text-white shadow-wt-sm transition-all hover:-translate-y-0.5 hover:bg-wt-orange/90 hover:shadow-wt-md"
        >
          <Plus className="h-4 w-4" />
          Nova vaga
        </Link>
      </div>

      <div className="mt-8">
        <AdminJobsTable jobs={jobs} />
      </div>
    </div>
  );
}
