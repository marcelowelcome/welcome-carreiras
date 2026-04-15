import Link from "next/link";
import { Plus } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminJobsTable } from "./AdminJobsTable";

export const dynamic = "force-dynamic";

export default async function AdminVagasPage() {
  const supabase = createServiceRoleClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*, applications(count)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin/vagas] supabase:", error);
  }

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
        <AdminJobsTable jobs={jobs ?? []} />
      </div>
    </div>
  );
}
