import {
  Heart,
  Globe2,
  HeartHandshake,
  TrendingUp,
  Home,
  Sparkles,
  HeartPulse,
  Users,
  Rocket,
  GraduationCap,
} from "lucide-react";
import type { ReactNode } from "react";

interface Benefit {
  icon: ReactNode;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Propósito",
    description: "Trabalho que transforma a vida das pessoas.",
  },
  {
    icon: <Globe2 className="h-6 w-6" />,
    title: "Viagens como experiência",
    description: "FAM tours e eventos pelo mundo.",
  },
  {
    icon: <HeartHandshake className="h-6 w-6" />,
    title: "Ambiente colaborativo",
    description: "Portas abertas, feedback franco.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Crescimento acelerado",
    description: "Carreira que acompanha o seu ritmo.",
  },
  {
    icon: <Home className="h-6 w-6" />,
    title: "Flexibilidade",
    description: "Modelo híbrido, horário flexível.",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Cultura viva",
    description: "Rituais de celebração e reconhecimento.",
  },
  {
    icon: <HeartPulse className="h-6 w-6" />,
    title: "Cuidado com bem-estar",
    description: "Plano de saúde e apoio psicológico.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Pessoas de verdade",
    description: "Time diverso, acolhedor e sem egos.",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "Autonomia real",
    description: "Decisões descentralizadas, espaço pra propor.",
  },
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: "Aprendizado contínuo",
    description: "Treinamentos, mentoria e biblioteca aberta.",
  },
];

export function BenefitsCarousel() {
  // Duplica para criar loop infinito sem saltos
  const track = [...BENEFITS, ...BENEFITS];

  return (
    <section className="overflow-hidden bg-wt-teal-deep py-20 sm:py-24">
      <div className="mx-auto max-w-wt-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.22em] text-wt-yellow">
            O que oferecemos
          </p>
          <h2 className="mt-4 font-wt-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Mais do que benefícios, um jeito de trabalhar
          </h2>
        </div>
      </div>

      <div
        className="group relative mt-14 flex overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
        }}
      >
        <ul className="flex shrink-0 animate-marquee gap-5 pr-5 group-hover:[animation-play-state:paused]">
          {track.map((b, i) => (
            <BenefitCard key={`a-${i}`} benefit={b} />
          ))}
        </ul>
        <ul
          aria-hidden="true"
          className="flex shrink-0 animate-marquee gap-5 pr-5 group-hover:[animation-play-state:paused]"
        >
          {track.map((b, i) => (
            <BenefitCard key={`b-${i}`} benefit={b} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <li className="w-[260px] shrink-0 rounded-wt-md bg-white/5 p-6 backdrop-blur-sm ring-1 ring-white/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-wt-primary-light text-wt-primary">
        {benefit.icon}
      </div>
      <h3 className="mt-4 font-wt-heading text-base font-bold text-white">
        {benefit.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-white/75">
        {benefit.description}
      </p>
    </li>
  );
}
