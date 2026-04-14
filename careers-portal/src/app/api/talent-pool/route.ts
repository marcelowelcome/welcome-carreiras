import { NextResponse } from "next/server";
import { talentPoolSchema } from "@/lib/validators";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = talentPoolSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.issues },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("talent_pool").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      area_interest: parsed.data.area_interest,
      brand_interest: parsed.data.brand_interest,
      opt_in_alerts: parsed.data.opt_in_alerts,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado no banco de talentos" },
          { status: 409 }
        );
      }
      console.error("[API] Erro ao cadastrar:", error);
      return NextResponse.json(
        { error: "Erro ao cadastrar" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Cadastro realizado com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Erro ao cadastrar no banco de talentos:", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
