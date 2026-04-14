import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Briefcase, Building2, Calendar } from "lucide-react";
import { ProcessTimeline } from "@/components/public/ProcessTimeline";
import { ApplicationForm } from "@/components/public/ApplicationForm";
import { createServerClient } from "@/lib/supabase/server";
import {
  BRAND_LABELS,
  BRAND_COLORS,
  CONTRACT_TYPE_LABELS,
  WORK_MODEL_LABELS,
} from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { Job } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getJob(slug: string): Promise<Job | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as Job | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Vaga não encontrada" };

  return {
    title: `${job.title} | ${BRAND_LABELS[job.brand]}`,
    description: `Vaga de ${job.title} na ${BRAND_LABELS[job.brand]}. ${job.location} - ${CONTRACT_TYPE_LABELS[job.contract_type]}`,
    openGraph: {
      title: `${job.title} | Welcome Group`,
      description: `Vaga de ${job.title} na ${BRAND_LABELS[job.brand]}`,
      type: "website",
    },
  };
}

export default async function VagaPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    notFound();
  }

  const brandColor = BRAND_COLORS[job.brand];

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.description.replace(/<[^>]*>/g, ""),
            datePosted: job.published_at,
            validThrough: job.closes_at,
            employmentType: job.contract_type === "clt" ? "FULL_TIME" : "CONTRACTOR",
            hiringOrganization: {
              "@type": "Organization",
              name: "Welcome Group",
            },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: job.location,
              },
            },
          }),
        }}
      />

      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        {/* Cabeçalho */}
        <header className="border-b border-wt-gray-300/60 pb-10">
          <span
            className={cn(
              "inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
              brandColor.badge
            )}
          >
            {BRAND_LABELS[job.brand]}
          </span>

          <h1 className="mt-5 font-wt-heading text-4xl font-bold tracking-tight text-wt-teal-deep sm:text-5xl">
            {job.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-wt-gray-700">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-wt-primary" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-wt-primary" />{" "}
              {CONTRACT_TYPE_LABELS[job.contract_type]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-wt-primary" />{" "}
              {WORK_MODEL_LABELS[job.work_model]}
            </span>
            {job.published_at && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-wt-primary" /> Publicada em{" "}
                {formatDate(job.published_at)}
              </span>
            )}
          </div>

          {job.salary_range && (
            <p className="mt-5 font-wt-heading text-lg font-bold text-wt-teal-deep">
              {job.salary_range}
            </p>
          )}
        </header>

        {/* Conteúdo */}
        <div className="mt-10 space-y-10">
          <Section title="Sobre a vaga" html={job.description} />
          <Section title="Responsabilidades" html={job.responsibilities} />
          <Section title="Requisitos obrigatórios" html={job.requirements_must} />
          {job.requirements_nice && (
            <Section title="Diferenciais" html={job.requirements_nice} />
          )}
          {job.benefits && <Section title="Benefícios" html={job.benefits} />}

          <ProcessTimeline steps={job.process_steps} />

          {/* Formulário */}
          <div className="rounded-wt-md bg-white p-8 shadow-wt-sm sm:p-10">
            <ApplicationForm jobId={job.id} jobTitle={job.title} />
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, html }: { title: string; html: string }) {
  return (
    <div>
      <h2 className="font-wt-heading text-xl font-bold text-wt-teal-deep sm:text-2xl">
        {title}
      </h2>
      <div
        className="prose prose-sm mt-4 max-w-none text-wt-gray-700 prose-headings:font-wt-heading prose-headings:text-wt-teal-deep prose-strong:text-wt-teal-deep prose-li:marker:text-wt-primary"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
