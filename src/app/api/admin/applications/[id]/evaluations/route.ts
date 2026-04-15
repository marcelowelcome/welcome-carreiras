import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { APPLICATION_STAGES_ORDER } from "@/lib/constants";
import type { ApplicationStage } from "@/types";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("stage_evaluations")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[API] list evaluations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = (await request.json()) as {
    stage: ApplicationStage;
    score?: number | null;
    notes?: string | null;
  };

  if (!body.stage || !APPLICATION_STAGES_ORDER.includes(body.stage)) {
    return NextResponse.json({ error: "etapa inválida" }, { status: 400 });
  }
  if (
    body.score !== null &&
    body.score !== undefined &&
    (body.score < 1 || body.score > 5)
  ) {
    return NextResponse.json({ error: "score inválido" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("stage_evaluations")
    .insert({
      application_id: id,
      stage: body.stage,
      score: body.score ?? null,
      notes: body.notes ?? null,
    })
    .select("*")
    .single();
  if (error) {
    console.error("[API] create evaluation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
