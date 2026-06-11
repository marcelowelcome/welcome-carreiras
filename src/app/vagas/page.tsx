import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JobCard } from "@/components/public/JobCard";
import { JobFilters } from "@/components/public/JobFilters";
import { createServerClient } from "@/lib/supabase/server";
import type { Job, Brand, Department, WorkModel } from "@/types";

function FiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-3" aria-hidden="true">
      <div className="h-10 w-32 animate-pulse rounded-wt-sm bg-wt-gray-300/60" />
      <div className="h-10 w-40 animate-pulse rounded-wt-sm bg-wt-gray-300/60" />
      <div className="h-10 w-36 animate-pulse rounded-wt-sm bg-wt-gray-300/60" />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Vagas Abertas",
  description:
    "Confira as vagas abertas no Welcome Group. Oportunidades em turismo, eventos, marketing e mais.",
};

interface VagasPageProps {
  searchParams: Promise<{
    q?: string;
    marca?: Brand;
    departamento?: Department;
    modelo?: WorkModel;
  }>;
}

export default async function VagasPage({ searchParams }: VagasPageProps) {
  const params = await searchParams;
  const supabase = await createServerClient();

  let query = supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .or("closes_at.is.null,closes_at.gt.now()")
    .order("published_at", { ascending: false });

  if (params.marca) {
    query = query.eq("brand", params.marca);
  }
  if (params.departamento) {
    query = query.eq("department", params.departamento);
  }
  if (params.modelo) {
    query = query.eq("work_model", params.modelo);
  }
  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  const { data, error } = await query;
  const jobs = (data ?? []) as Job[];

  const hasActiveFilters = !!(params.q || params.marca || params.departamento || params.modelo);

  return (
    <div className="mx-auto max-w-wt-container px-6 py-16 sm:py-20">
      {error && (
        <div
          role="alert"
          className="mb-8 rounded-wt-sm bg-wt-red/10 p-4 text-sm text-wt-red"
        >
          Não foi possível carregar as vagas no momento. Tente novamente em instantes.
        </div>
      )}

      <div className="mb-10">
        <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary">
          Carreiras
        </p>
        <h1 className="mt-3 font-wt-heading text-4xl font-bold tracking-tight text-wt-teal-deep sm:text-5xl">
          Vagas abertas
        </h1>
        {!error && (
          <p className="mt-3 text-sm text-wt-gray-500">
            {jobs.length}{" "}
            {jobs.length === 1 ? "vaga encontrada" : "vagas encontradas"}
          </p>
        )}
      </div>

      <Suspense fallback={<FiltersSkeleton />}>
        <JobFilters />
      </Suspense>

      {jobs.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : !error ? (
        hasActiveFilters ? (
          <div className="mt-16 rounded-wt-md border border-wt-gray-300/60 bg-wt-gray-100/60 p-12 text-center shadow-wt-sm">
            <p className="font-wt-heading text-2xl font-bold text-wt-teal-deep">
              Nenhuma vaga com esses filtros
            </p>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-wt-gray-700">
              Tente ajustar ou limpar os filtros para ver mais oportunidades.
            </p>
          </div>
        ) : (
          <div className="mt-16 rounded-wt-md bg-wt-teal-deep p-12 text-center shadow-wt-sm">
            <p className="font-wt-heading text-2xl font-bold text-white">
              Nenhuma vaga encontrada
            </p>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/75">
              Não encontrou o que procurava agora? Cadastre-se no banco de talentos
              e seja o primeiro a saber quando surgir uma oportunidade na sua área.
            </p>
            <Link
              href="/banco-de-talentos"
              className="mt-8 inline-flex items-center gap-3 rounded-wt-sm bg-wt-orange px-8 py-3.5 font-wt-heading text-sm font-bold uppercase tracking-[0.05em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-wt-orange/90 hover:shadow-wt-md"
            >
              Entrar para o banco de talentos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )
      ) : null}
    </div>
  );
}
