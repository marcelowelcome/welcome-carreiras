import { Heart, TrendingUp, Home, Users } from "lucide-react";
import type { ReactNode } from "react";

interface Pillar {
  icon: ReactNode;
  title: string;
  description: string;
}

const PILLARS: Pillar[] = [
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Propósito",
    description:
      "Trabalhamos com turismo, eventos e experiências que transformam a vida das pessoas. Aqui, seu trabalho tem impacto real.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Crescimento",
    description:
      "Investimos no desenvolvimento de cada pessoa. Treinamentos, famtours e mentoria fazem parte da jornada.",
  },
  {
    icon: <Home className="h-6 w-6" />,
    title: "Flexibilidade",
    description:
      "Modelo híbrido, horário flexível e dress code casual. Acreditamos que autonomia gera resultados melhores.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Pessoas",
    description:
      "Um time diverso e acolhedor que valoriza relações genuínas. Aqui você é parte, não apenas mais um.",
  },
];

export function EVPBlock() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-wt-container px-6">
        <div className="max-w-2xl">
          <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary">
            Por que aqui
          </p>
          <h2 className="mt-3 font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep sm:text-4xl">
            Por que fazer parte do Welcome Group?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-wt-gray-700">
            Mais do que um emprego, uma oportunidade de construir algo que
            importa.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-wt-md bg-white p-6 shadow-wt-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-wt-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-wt-primary-light text-wt-primary">
                {pillar.icon}
              </div>
              <h3 className="mt-5 font-wt-heading text-lg font-bold text-wt-teal-deep">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-wt-gray-700">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
