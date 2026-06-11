import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { jobFormSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

interface Ctx {
  params: Promise<{ id: string }>;
}

// Aceita os campos do formulário + transição de status.
// published_at continua sendo gerado server-side (SEC-002).
const jobPatchSchema = jobFormSchema.partial().extend({
  status: z.enum(["draft", "published", "paused", "closed"]).optional(),
});

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const payload: unknown = await request.json();

  const result = jobPatchSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: result.error.issues },
      { status: 400 }
    );
  }

  // SEC-002: usar result.data — nunca o payload bruto; remover campos gerados server-side
  const { title, status, ...rest } = result.data;

  const updatePayload: Record<string, unknown> = { ...rest };

  if (title !== undefined) {
    updatePayload.title = title;
    // Re-gerar slug quando o título muda
    updatePayload.slug = slugify(title);
  }

  const supabase = createServiceRoleClient();

  if (status !== undefined) {
    updatePayload.status = status;

    // published_at é definido server-side na primeira publicação
    if (status === "published") {
      const { data: current } = await supabase
        .from("jobs")
        .select("published_at")
        .eq("id", id)
        .single();
      if (!current?.published_at) {
        updatePayload.published_at = new Date().toISOString();
      }
    }
  }

  const { error } = await supabase.from("jobs").update(updatePayload).eq("id", id);
  if (error) {
    console.error("[API] update job:", error);
    return NextResponse.json({ error: "Erro ao atualizar vaga" }, { status: 500 });
  }

  // Home exibe vagas em destaque via ISR
  revalidatePath("/");

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
