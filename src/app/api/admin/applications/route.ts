import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createServiceRoleClient();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("job_id");
  const stage = searchParams.get("stage");

  let query = supabase
    .from("applications")
    .select("*, jobs(title, brand)")
    .order("stage_updated_at", { ascending: false });

  if (jobId) query = query.eq("job_id", jobId);
  if (stage) query = query.eq("stage", stage);

  const { data, error } = await query;
  if (error) {
    console.error("[API] list applications:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
