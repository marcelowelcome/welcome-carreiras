import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  const bucket = url.searchParams.get("bucket") ?? "resumes";

  if (!path) {
    return NextResponse.json({ error: "path é obrigatório" }, { status: 400 });
  }
  if (bucket !== "resumes" && bucket !== "talent-pool") {
    return NextResponse.json({ error: "bucket inválido" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // SEC-008: verificar ownership — o path deve corresponder a um registro real
  // antes de gerar a URL assinada
  if (bucket === "resumes") {
    const { data: appRecord, error: appError } = await supabase
      .from("applications")
      .select("id")
      .eq("resume_path", path)
      .maybeSingle();

    if (appError) {
      console.error("[API] resumes ownership check:", appError);
      return NextResponse.json({ error: "Erro ao verificar arquivo" }, { status: 500 });
    }

    if (!appRecord) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 403 });
    }
  } else {
    // bucket === "talent-pool"
    const { data: tpRecord, error: tpError } = await supabase
      .from("talent_pool")
      .select("id")
      .eq("resume_path", path)
      .maybeSingle();

    if (tpError) {
      console.error("[API] talent-pool ownership check:", tpError);
      return NextResponse.json({ error: "Erro ao verificar arquivo" }, { status: 500 });
    }

    if (!tpRecord) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 403 });
    }
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60);

  if (error || !data?.signedUrl) {
    console.error("[API] createSignedUrl:", error);
    return NextResponse.json(
      { error: "Erro ao gerar URL" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
