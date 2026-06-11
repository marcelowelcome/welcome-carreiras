import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validators";
import { MAX_RESUME_SIZE, ALLOWED_RESUME_TYPES } from "@/lib/constants";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isPdfByMagic } from "@/lib/file-validation";
import { sendEmail, RH_EMAIL } from "@/lib/email/resend";
import {
  applicationConfirmationEmail,
  rhNewApplicationEmail,
} from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    // Rate limit: 5 envios por IP a cada 15 min
    const ip = getClientIp(request);
    const rate = await checkRateLimit({
      ip,
      endpoint: "applications",
      maxRequests: 5,
      windowSeconds: 15 * 60,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const data = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      linkedin_url: (formData.get("linkedin_url") as string) ?? "",
      portfolio_url: (formData.get("portfolio_url") as string) ?? "",
      cover_letter: (formData.get("cover_letter") as string) ?? "",
      salary_expectation: (formData.get("salary_expectation") as string) ?? "",
      referral_source: formData.get("referral_source") as string,
      lgpd_consent: formData.get("lgpd_consent") === "true",
    };

    const jobId = formData.get("job_id") as string;
    if (!jobId) {
      return NextResponse.json(
        { error: "ID da vaga é obrigatório" },
        { status: 400 }
      );
    }

    const parsed = applicationSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.issues },
        { status: 400 }
      );
    }

    const resume = formData.get("resume") as File | null;
    if (!resume || resume.size === 0) {
      return NextResponse.json(
        { error: "Currículo é obrigatório" },
        { status: 400 }
      );
    }
    if (!ALLOWED_RESUME_TYPES.includes(resume.type)) {
      return NextResponse.json(
        { error: "Apenas arquivos PDF" },
        { status: 400 }
      );
    }
    if (resume.size > MAX_RESUME_SIZE) {
      return NextResponse.json(
        { error: "Arquivo deve ter no máximo 5MB" },
        { status: 400 }
      );
    }
    if (!(await isPdfByMagic(resume))) {
      return NextResponse.json(
        { error: "Arquivo não parece ser um PDF válido" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Verificar se a vaga existe e está publicada antes de qualquer upload
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("id", jobId)
      .single();

    if (jobError || !job || job.status !== "published") {
      return NextResponse.json(
        { error: "Vaga não encontrada ou não está disponível." },
        { status: 400 }
      );
    }

    // Upload CV
    const filePath = `${jobId}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, resume, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("[API] Erro no upload:", uploadError);
      return NextResponse.json(
        { error: "Erro ao enviar currículo" },
        { status: 500 }
      );
    }

    // Insert candidatura
    const { error: insertError } = await supabase
      .from("applications")
      .insert({
        job_id: jobId,
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        referral_source: parsed.data.referral_source,
        linkedin_url: parsed.data.linkedin_url || null,
        portfolio_url: parsed.data.portfolio_url || null,
        cover_letter: parsed.data.cover_letter || null,
        salary_expectation: parsed.data.salary_expectation || null,
        resume_path: filePath,
        lgpd_consent_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("[API] Erro ao inserir candidatura:", insertError);
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Você já se candidatou a esta vaga." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Erro ao registrar candidatura" },
        { status: 500 }
      );
    }

    // Emails transacionais (fire-and-forget; nunca quebram a resposta)
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const [jobResult, notifSettingsResult] = await Promise.all([
      supabase.from("jobs").select("title, id").eq("id", jobId).single(),
      supabase
        .from("culture_content")
        .select("content")
        .eq("section_key", "notification_settings")
        .maybeSingle(),
    ]);

    const jobTitle = jobResult.data?.title ?? "a vaga";
    const notifSettings = (notifSettingsResult.data?.content ?? {}) as {
      rh_email?: string;
      notify_candidate_on_apply?: boolean;
      notify_rh_on_apply?: boolean;
    };

    const notifyCandidate = notifSettings.notify_candidate_on_apply ?? true;
    const notifyRh = notifSettings.notify_rh_on_apply ?? true;
    const rhEmailAddress = notifSettings.rh_email || RH_EMAIL;

    if (notifyCandidate) {
      const confirmation = applicationConfirmationEmail({
        candidateName: parsed.data.full_name,
        jobTitle,
        siteUrl,
      });
      void sendEmail({
        to: parsed.data.email,
        subject: confirmation.subject,
        html: confirmation.html,
      });
    }

    if (notifyRh && rhEmailAddress) {
      const rhMail = rhNewApplicationEmail({
        candidateName: parsed.data.full_name,
        candidateEmail: parsed.data.email,
        jobTitle,
        adminUrl: `${siteUrl}/admin/vagas/${jobId}/candidaturas`,
      });
      void sendEmail({
        to: rhEmailAddress,
        subject: rhMail.subject,
        html: rhMail.html,
        replyTo: parsed.data.email,
      });
    }

    return NextResponse.json(
      { message: "Candidatura recebida com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Erro ao processar candidatura:", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
