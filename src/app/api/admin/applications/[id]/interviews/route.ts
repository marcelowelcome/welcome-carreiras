import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  INTERVIEW_TYPES_ORDER,
  INTERVIEW_VOTE_LABELS,
  CULTURE_PILLARS_ORDER,
} from "@/lib/constants";
import type { InterviewType, InterviewVote, PillarScores } from "@/types";

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

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[API] list interviews:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = (await request.json()) as {
    type: InterviewType;
    interviewer_name?: string | null;
    vote?: InterviewVote | null;
    pillar_scores?: PillarScores;
    notes?: string | null;
  };

  if (!body.type || !INTERVIEW_TYPES_ORDER.includes(body.type)) {
    return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
  }
  if (body.vote && !VALID_VOTES.includes(body.vote)) {
    return NextResponse.json({ error: "voto inválido" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("interviews")
    .insert({
      application_id: id,
      type: body.type,
      interviewer_name: body.interviewer_name ?? null,
      vote: body.vote ?? null,
      pillar_scores: sanitizePillars(body.pillar_scores),
      notes: body.notes ?? null,
    })
    .select("*")
    .single();
  if (error) {
    console.error("[API] create interview:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
