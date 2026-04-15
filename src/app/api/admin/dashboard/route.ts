import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    const [jobsResult, applicationsResult, talentResult] = await Promise.all([
      supabase.from("jobs").select("status"),
      supabase.from("applications").select("stage, created_at"),
      supabase.from("talent_pool").select("id", { count: "exact", head: true }),
    ]);

    const jobs = jobsResult.data ?? [];
    const applications = applicationsResult.data ?? [];

    return NextResponse.json({
      data: {
        totalJobs: jobs.filter((j) => j.status === "published").length,
        draftJobs: jobs.filter((j) => j.status === "draft").length,
        totalApplications: applications.length,
        pendingReview: applications.filter((a) => a.stage === "inscrito").length,
        talentPool: talentResult.count ?? 0,
      },
    });
  } catch (error) {
    console.error("[API] Erro ao buscar dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
