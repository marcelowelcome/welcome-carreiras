import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/admin";

// SEC-001: schema Zod explícito para criação de depoimento
const testimonialCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  brand: z.enum(["welcome_weddings", "welcome_trips", "welcome_group", "corporativo"]),
  text: z.string().min(1, "Depoimento é obrigatório"),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const rawBody: unknown = await request.json();
  const result = testimonialCreateSchema.safeParse(rawBody);
  if (!result.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: result.error.issues },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  // RN-010: usar count da query, não data — data é null com head: true
  const { count, error: countError } = await supabase
    .from("testimonials")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("[API] count testimonials:", countError);
    return NextResponse.json({ error: "Erro ao criar depoimento" }, { status: 500 });
  }

  const { error } = await supabase.from("testimonials").insert({
    ...result.data,
    is_featured: true,
    is_visible: true,
    sort_order: (count ?? 0) + 1,
  });

  if (error) {
    console.error("[API] insert testimonial:", error);
    return NextResponse.json({ error: "Erro ao criar depoimento" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
