import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { jobFormSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const payload: unknown = await request.json();

  const result = jobFormSchema.partial().safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: result.error.issues },
      { status: 400 }
    );
  }

  // SEC-002: usar result.data — nunca o payload bruto; remover campos gerados server-side
  const { title, ...rest } = result.data;

  const updatePayload: Record<string, unknown> = { ...rest };

  if (title !== undefined) {
    updatePayload.title = title;
    // Re-gerar slug quando o título muda
    updatePayload.slug = slugify(title);
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("jobs").update(updatePayload).eq("id", id);
  if (error) {
    console.error("[API] update job:", error);
    return NextResponse.json({ error: "Erro ao atualizar vaga" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();
  if (error) {
    console.error("[API] get job:", error);
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 500 });
  }
  return NextResponse.json({ data });
}
