import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("job_id");
    const stage = searchParams.get("stage");

    let query = supabase
      .from("applications")
      .select("*, jobs(title, brand)")
      .order("created_at", { ascending: false });

    if (jobId) query = query.eq("job_id", jobId);
    if (stage) query = query.eq("stage", stage);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] Erro ao listar candidaturas:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
