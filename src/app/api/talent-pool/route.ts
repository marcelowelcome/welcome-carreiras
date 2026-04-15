import { NextResponse } from "next/server";
import { talentPoolSchema } from "@/lib/validators";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/resend";
import { talentPoolConfirmationEmail } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    // Rate limit: 3 cadastros por IP a cada 10 min
    const ip = getClientIp(request);
    const rate = await checkRateLimit({
      ip,
      endpoint: "talent-pool",
      maxRequests: 3,
      windowSeconds: 10 * 60,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
        { status: 429 }
      );
    }

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

    // Email de confirmação (fire-and-forget)
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const mail = talentPoolConfirmationEmail({
      candidateName: parsed.data.full_name,
      siteUrl,
    });
    void sendEmail({
      to: parsed.data.email,
      subject: mail.subject,
      html: mail.html,
    });

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
