import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * Resolve uma solicitação LGPD.
 * - Se `execute_deletion` === true, apaga todas as applications e talent_pool
 *   do titular (via email) e os CVs correspondentes do Storage, ANTES de
 *   marcar a solicitação como resolvida.
 * - `note` é a anotação interna sobre o atendimento.
 */
export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = (await request.json()) as {
    execute_deletion?: boolean;
    note?: string;
  };

  const supabase = createServiceRoleClient();

  // Obter o usuário autenticado para registrar resolved_by
  const authClient = await createServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const { data: req, error: fetchError } = await supabase
    .from("lgpd_requests")
    .select("id, email, request_type, status")
    .eq("id", id)
    .single();

  if (fetchError || !req) {
    return NextResponse.json(
      { error: fetchError?.message ?? "Solicitação não encontrada" },
      { status: 404 }
    );
  }

  if (req.status !== "pendente") {
    return NextResponse.json(
      { error: "Solicitação já tratada" },
      { status: 409 }
    );
  }

  const deletionDetails: { applications: number; talentPool: number; cvs: number } = {
    applications: 0,
    talentPool: 0,
    cvs: 0,
  };

  if (body.execute_deletion) {
    // 1) Buscar resume_paths das applications pra apagar do Storage antes
    const { data: apps } = await supabase
      .from("applications")
      .select("id, resume_path")
      .ilike("email", req.email);

    const resumePaths = (apps ?? [])
      .map((a) => a.resume_path as string | null)
      .filter((p): p is string => !!p);

    if (resumePaths.length > 0) {
      const { error: rmError } = await supabase.storage
        .from("resumes")
        .remove(resumePaths);
      if (rmError) {
        console.error("[lgpd] erro ao remover CVs:", rmError);
      } else {
        deletionDetails.cvs = resumePaths.length;
      }
    }

    // 2) Apagar applications (cascata apaga stage_history, evaluations, interviews)
    const { count: appsCount, error: appsError } = await supabase
      .from("applications")
      .delete({ count: "exact" })
      .ilike("email", req.email);
    if (appsError) {
      console.error("[lgpd] erro ao apagar applications:", appsError);
      return NextResponse.json(
        { error: "Falha ao apagar candidaturas" },
        { status: 500 }
      );
    }
    deletionDetails.applications = appsCount ?? 0;

    // 3) Buscar resume_paths do talent_pool para apagar do Storage
    const { data: talentEntries } = await supabase
      .from("talent_pool")
      .select("resume_path")
      .ilike("email", req.email);

    const talentResumePaths = (talentEntries ?? [])
      .map((t) => t.resume_path as string | null)
      .filter((p): p is string => !!p);

    if (talentResumePaths.length > 0) {
      const { error: talentRmError } = await supabase.storage
        .from("talent-pool")
        .remove(talentResumePaths);
      if (talentRmError) {
        console.error("[lgpd] erro ao remover CVs do talent_pool:", talentRmError);
      } else {
        deletionDetails.cvs += talentResumePaths.length;
      }
    }

    // 4) Apagar talent_pool
    const { count: talentCount, error: talentError } = await supabase
      .from("talent_pool")
      .delete({ count: "exact" })
      .ilike("email", req.email);
    if (talentError) {
      console.error("[lgpd] erro ao apagar talent_pool:", talentError);
      return NextResponse.json(
        { error: "Falha ao apagar banco de talentos" },
        { status: 500 }
      );
    }
    deletionDetails.talentPool = talentCount ?? 0;
  }

  const { error: updateError } = await supabase
    .from("lgpd_requests")
    .update({
      status: "resolvido",
      resolved_note: body.note ?? null,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id ?? null,
    })
    .eq("id", id);

  if (updateError) {
    console.error("[lgpd] erro ao marcar resolvido:", updateError);
    return NextResponse.json(
      { error: "Erro ao atualizar solicitação LGPD" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, deletion: deletionDetails });
}
