import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validators";
import { MAX_RESUME_SIZE, ALLOWED_RESUME_TYPES } from "@/lib/constants";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
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
      lgpd_consent: true,
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

    const supabase = createServiceRoleClient();

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
      });

    if (insertError) {
      console.error("[API] Erro ao inserir candidatura:", insertError);
      return NextResponse.json(
        { error: "Erro ao registrar candidatura" },
        { status: 500 }
      );
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
