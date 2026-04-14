import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/public/HeroSection";
import { EVPBlock } from "@/components/public/EVPBlock";
import { NumbersGrid } from "@/components/public/NumbersGrid";
import { JobCard } from "@/components/public/JobCard";
import { TestimonialCarousel } from "@/components/public/TestimonialCarousel";
import { createServerClient } from "@/lib/supabase/server";
import { FEATURED_JOBS_LIMIT } from "@/lib/constants";
import type { Job, Testimonial } from "@/types";

export const revalidate = 300; // ISR: 5 min

export default async function Home() {
  const supabase = await createServerClient();

  const [jobsResult, testimonialsResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(FEATURED_JOBS_LIMIT),
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_visible", true)
      .eq("is_featured", true)
      .order("sort_order"),
  ]);

  const featuredJobs = (jobsResult.data ?? []) as Job[];
  const testimonials = (testimonialsResult.data ?? []) as Testimonial[];

  return (
    <>
      <HeroSection />
      <EVPBlock />
      <NumbersGrid />

      {/* Vagas em destaque */}
      {featuredJobs.length > 0 && (
        <section className="bg-wt-gray-100/60 py-20 sm:py-24">
          <div className="mx-auto max-w-wt-container px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary">
                  Vagas em destaque
                </p>
                <h2 className="mt-3 font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep sm:text-4xl">
                  Oportunidades abertas
                </h2>
              </div>
              <Link
                href="/vagas"
                className="group hidden items-center gap-2 font-wt-heading text-xs font-bold uppercase tracking-[0.1em] text-wt-gray-700 transition-colors hover:text-wt-primary sm:inline-flex"
              >
                Ver todas
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <div className="mt-10 text-center sm:hidden">
              <Link
                href="/vagas"
                className="inline-flex items-center gap-2 font-wt-heading text-xs font-bold uppercase tracking-[0.1em] text-wt-primary"
              >
                Ver todas as vagas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <TestimonialCarousel testimonials={testimonials} />
      )}

      {/* CTA final */}
      <section className="bg-wt-teal-deep py-20 text-white sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-wt-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Não encontrou sua vaga?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80">
            Cadastre-se no nosso banco de talentos e seja avisado quando surgir
            uma oportunidade na sua área.
          </p>
          <Link
            href="/banco-de-talentos"
            className="mt-10 inline-flex items-center gap-3 rounded-wt-sm bg-wt-orange px-8 py-3.5 font-wt-heading text-sm font-bold uppercase tracking-[0.05em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-wt-orange/90 hover:shadow-wt-md"
          >
            Cadastrar no banco de talentos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
