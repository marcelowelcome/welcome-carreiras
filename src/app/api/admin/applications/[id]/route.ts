import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { APPLICATION_STAGES_ORDER } from "@/lib/constants";
import type { ApplicationStage } from "@/types";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = (await request.json()) as {
    stage?: ApplicationStage;
    notes?: string | null;
    score?: number | null;
  };

  const supabase = createServiceRoleClient();

  // Busca estágio atual se for mudar stage (pra registrar history)
  let previousStage: ApplicationStage | null = null;
  if (body.stage) {
    if (!APPLICATION_STAGES_ORDER.includes(body.stage)) {
      return NextResponse.json({ error: "etapa inválida" }, { status: 400 });
    }
    const { data: current } = await supabase
      .from("applications")
      .select("stage")
      .eq("id", id)
      .single();
    previousStage = (current?.stage as ApplicationStage) ?? null;
  }

  const patch: Record<string, unknown> = {};
  if (body.stage !== undefined) {
    patch.stage = body.stage;
    patch.stage_updated_at = new Date().toISOString();
  }
  if (body.notes !== undefined) patch.notes = body.notes;
  if (body.score !== undefined) patch.score = body.score;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "nenhum campo para atualizar" }, { status: 400 });
  }

  const { error } = await supabase.from("applications").update(patch).eq("id", id);
  if (error) {
    console.error("[API] update application:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log history se houve mudança de etapa
  if (body.stage && previousStage !== body.stage) {
    const { error: histError } = await supabase.from("stage_history").insert({
      application_id: id,
      from_stage: previousStage,
      to_stage: body.stage,
    });
    if (histError) console.error("[API] stage_history:", histError);
  }

  return NextResponse.json({ ok: true });
}
