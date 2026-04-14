import { Suspense } from "react";
import type { Metadata } from "next";
import { JobCard } from "@/components/public/JobCard";
import { JobFilters } from "@/components/public/JobFilters";
import { createServerClient } from "@/lib/supabase/server";
import type { Job, Brand, Department, WorkModel } from "@/types";

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

  const { data } = await query;
  const jobs = (data ?? []) as Job[];

  return (
    <div className="mx-auto max-w-wt-container px-6 py-16 sm:py-20">
      <div className="mb-10">
        <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary">
          Carreiras
        </p>
        <h1 className="mt-3 font-wt-heading text-4xl font-bold tracking-tight text-wt-teal-deep sm:text-5xl">
          Vagas abertas
        </h1>
        <p className="mt-3 text-sm text-wt-gray-500">
          {jobs.length}{" "}
          {jobs.length === 1 ? "vaga encontrada" : "vagas encontradas"}
        </p>
      </div>

      <Suspense fallback={null}>
        <JobFilters />
      </Suspense>

      {jobs.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-wt-md bg-white p-12 text-center shadow-wt-sm">
          <p className="font-wt-heading text-lg font-bold text-wt-teal-deep">
            Nenhuma vaga encontrada
          </p>
          <p className="mt-2 text-sm text-wt-gray-700">
            Tente ajustar os filtros ou confira novamente em breve.
          </p>
        </div>
      )}
    </div>
  );
}
