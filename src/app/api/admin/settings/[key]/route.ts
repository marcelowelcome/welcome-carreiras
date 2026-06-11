import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/admin";

interface Ctx {
  params: Promise<{ key: string }>;
}

// SEC-001: schema Zod explícito — apenas campos permitidos chegam ao banco
const settingsPatchSchema = z.object({
  is_visible: z.boolean().optional(),
  content: z.unknown().optional(),
});

export async function GET(_req: Request, { params }: Ctx) {
  const { key } = await params;
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("culture_content")
    .select("id, is_visible, content")
    .eq("section_key", key)
    .maybeSingle();

  if (error) {
    console.error("[API] get setting:", error);
    return NextResponse.json({ error: "Erro ao buscar configuração" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { key } = await params;

  // SEC-001: validar payload antes de qualquer acesso ao banco
  const rawBody: unknown = await request.json();
  const result = settingsPatchSchema.safeParse(rawBody);
  if (!result.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: result.error.issues },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  const { data: existing, error: lookupError } = await supabase
    .from("culture_content")
    .select("id")
    .eq("section_key", key)
    .maybeSingle();

  if (lookupError) {
    console.error("[API] lookup setting:", lookupError);
    return NextResponse.json({ error: "Erro ao buscar configuração" }, { status: 500 });
  }

  // RN-009: capturar erros do banco — não retornar sempre 200
  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("culture_content")
      .update({ ...result.data, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (updateError) {
      console.error("[API] update setting:", updateError);
      return NextResponse.json({ error: "Erro ao salvar configuração" }, { status: 500 });
    }
  } else {
    const { error: insertError } = await supabase.from("culture_content").insert({
      section_key: key,
      title: key,
      content: result.data.content ?? {},
      is_visible: result.data.is_visible ?? true,
      sort_order: 99,
    });

    if (insertError) {
      console.error("[API] insert setting:", insertError);
      return NextResponse.json({ error: "Erro ao criar configuração" }, { status: 500 });
    }
  }

  // Invalida o ISR das páginas públicas que leem settings de culture_content
  revalidatePath("/");
  revalidatePath("/cultura");

  return NextResponse.json({ ok: true });
}
