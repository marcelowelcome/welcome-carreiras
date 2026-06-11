import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/admin";

interface Ctx {
  params: Promise<{ id: string }>;
}

// SEC-001: schema Zod explícito — apenas campos permitidos chegam ao banco
const culturePatchSchema = z.object({
  title: z.string().optional(),
  content: z.unknown().optional(),
  is_visible: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;

  const rawBody: unknown = await request.json();
  const result = culturePatchSchema.safeParse(rawBody);
  if (!result.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: result.error.issues },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("culture_content")
    .update({ ...result.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[API] update culture_content:", error);
    return NextResponse.json({ error: "Erro ao atualizar conteúdo" }, { status: 500 });
  }

  // Invalida o ISR das páginas públicas que exibem culture_content
  revalidatePath("/");
  revalidatePath("/cultura");

  return NextResponse.json({ ok: true });
}
