import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, RH_EMAIL } from "@/lib/email/resend";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = await checkRateLimit({
      ip,
      endpoint: "lgpd-request",
      maxRequests: 3,
      windowSeconds: 30 * 60,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 30 minutos." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      email?: string;
      reason?: string;
      request_type?: "exclusao" | "acesso";
    };

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
    }

    const requestType = body.request_type === "acesso" ? "acesso" : "exclusao";
    const reason = body.reason?.trim().slice(0, 1000) || null;

    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("lgpd_requests").insert({
      email,
      request_type: requestType,
      reason,
      ip,
    });
    if (error) {
      console.error("[API] lgpd request:", error);
      return NextResponse.json({ error: "Erro ao registrar" }, { status: 500 });
    }

    // Notifica RH
    if (RH_EMAIL) {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      const typeLabel = requestType === "exclusao" ? "EXCLUSÃO" : "ACESSO";
      void sendEmail({
        to: RH_EMAIL,
        subject: `[LGPD] Solicitação de ${typeLabel} — ${email}`,
        html: `<!DOCTYPE html>
<html><body style="font-family:sans-serif;padding:24px;background:#F8F7F4;color:#4A4540;">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:28px;border-radius:12px;border:1px solid #D1CCC5;">
    <h1 style="color:#0D5257;margin:0 0 12px;">Nova solicitação LGPD</h1>
    <p><strong>Tipo:</strong> ${typeLabel}</p>
    <p><strong>E-mail do titular:</strong> ${email}</p>
    ${reason ? `<p><strong>Motivo:</strong> ${reason.replace(/</g, "&lt;")}</p>` : ""}
    <p style="margin-top:20px;">
      <a href="${siteUrl}/admin/lgpd" style="display:inline-block;background:#EA7600;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700;">
        Abrir no painel
      </a>
    </p>
  </div>
</body></html>`,
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[API] lgpd:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
