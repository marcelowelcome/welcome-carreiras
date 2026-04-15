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
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? "Erro ao gerar URL" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
