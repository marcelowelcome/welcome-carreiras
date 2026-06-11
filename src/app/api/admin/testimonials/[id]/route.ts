import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/admin";

interface Ctx {
  params: Promise<{ id: string }>;
}

// SEC-001: schema Zod explícito para atualização de depoimento
const testimonialUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  brand: z
    .enum(["welcome_weddings", "welcome_trips", "welcome_group", "corporativo"])
    .optional(),
  text: z.string().min(1).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  is_visible: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;

  const rawBody: unknown = await request.json();
  const result = testimonialUpdateSchema.safeParse(rawBody);
  if (!result.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: result.error.issues },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("testimonials")
    .update(result.data)
    .eq("id", id);

  if (error) {
    console.error("[API] update testimonial:", error);
    return NextResponse.json({ error: "Erro ao atualizar depoimento" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) {
    console.error("[API] delete testimonial:", error);
    return NextResponse.json({ error: "Erro ao excluir depoimento" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
