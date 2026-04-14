import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-wt-off-white py-20 sm:py-28 lg:py-32">
      {/* Glows decorativos */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-wt-primary-light blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-wt-yellow/10 blur-3xl" />

      <div className="relative mx-auto max-w-wt-container px-6">
        <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary">
          Welcome Group · Carreiras
        </p>
        <h1 className="mt-6 max-w-3xl font-wt-heading text-4xl font-black leading-[1.05] tracking-tight text-wt-teal-deep sm:text-5xl lg:text-6xl">
          Construa sua carreira em um lugar que transforma{" "}
          <span className="text-wt-primary">sonhos em destinos</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-wt-gray-700">
          Faça parte do Welcome Group e ajude a criar experiências que
          conectam pessoas, destinos e sonhos ao redor do mundo.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/vagas"
            className="inline-flex items-center gap-3 rounded-wt-sm bg-wt-orange px-8 py-3.5 font-wt-heading text-sm font-bold uppercase tracking-[0.05em] text-white shadow-wt-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-wt-orange/90 hover:shadow-wt-md"
          >
            Ver vagas abertas
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/cultura"
            className="group inline-flex items-center gap-3 rounded-wt-sm border-[1.5px] border-wt-gray-700 px-8 py-3.5 font-wt-heading text-sm font-semibold uppercase tracking-[0.1em] text-wt-gray-700 transition-all duration-300 hover:border-wt-primary hover:bg-wt-primary hover:text-white"
          >
            Conhecer a cultura
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-current">
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
