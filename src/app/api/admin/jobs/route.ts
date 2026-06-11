import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { jobFormSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createServiceRoleClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("jobs")
    .select("*, applications(count)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[API] list jobs:", error);
    return NextResponse.json({ error: "Erro ao listar vagas" }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload: unknown = await request.json();

  const result = jobFormSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: result.error.issues },
      { status: 400 }
    );
  }

  // SEC-002: usar result.data; gerar slug e published_at server-side — nunca aceitar do cliente
  const { title, ...rest } = result.data;

  const supabase = createServiceRoleClient();

  // Slug único: em colisão (ex.: vaga duplicada), acrescenta sufixo numérico
  const baseSlug = slugify(title);
  let slug = baseSlug;
  const { data: existing } = await supabase
    .from("jobs")
    .select("slug")
    .like("slug", `${baseSlug}%`);
  if (existing?.some((j) => j.slug === baseSlug)) {
    const taken = new Set(existing.map((j) => j.slug));
    let n = 2;
    while (taken.has(`${baseSlug}-${n}`)) n++;
    slug = `${baseSlug}-${n}`;
  }

  const insertPayload = {
    ...rest,
    title,
    status: "draft" as const,
    slug,
    published_at: null,
  };
  const { data, error } = await supabase
    .from("jobs")
    .insert(insertPayload)
    .select("id")
    .single();
  if (error) {
    console.error("[API] create job:", error);
    return NextResponse.json({ error: "Erro ao criar vaga" }, { status: 500 });
  }

  // Home exibe vagas em destaque via ISR
  revalidatePath("/");

  return NextResponse.json({ data });
}
