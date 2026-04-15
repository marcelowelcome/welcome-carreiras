import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { INTERVIEW_VOTE_LABELS, CULTURE_PILLARS_ORDER } from "@/lib/constants";
import type { InterviewVote, PillarScores } from "@/types";

interface Ctx {
  params: Promise<{ id: string }>;
}

const VALID_VOTES = Object.keys(INTERVIEW_VOTE_LABELS) as InterviewVote[];

function sanitizePillars(scores: unknown): PillarScores {
  if (!scores || typeof scores !== "object") return {};
  const out: PillarScores = {};
  for (const pillar of CULTURE_PILLARS_ORDER) {
    const v = (scores as Record<string, unknown>)[pillar];
    if (typeof v === "number" && v >= 1 && v <= 5) {
      out[pillar] = v;
    }
  }
  return out;
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = (await request.json()) as {
    interviewer_name?: string | null;
    vote?: InterviewVote | null;
    pillar_scores?: PillarScores;
    notes?: string | null;
  };

  const patch: Record<string, unknown> = {};
  if (body.interviewer_name !== undefined) {
    patch.interviewer_name = body.interviewer_name ?? null;
  }
  if (body.vote !== undefined) {
    if (body.vote !== null && !VALID_VOTES.includes(body.vote)) {
      return NextResponse.json({ error: "voto inválido" }, { status: 400 });
    }
    patch.vote = body.vote;
  }
  if (body.pillar_scores !== undefined) {
    patch.pillar_scores = sanitizePillars(body.pillar_scores);
  }
  if (body.notes !== undefined) patch.notes = body.notes;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "nenhum campo" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("interviews").update(patch).eq("id", id);
  if (error) {
    console.error("[API] update interview:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("interviews").delete().eq("id", id);
  if (error) {
    console.error("[API] delete interview:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
