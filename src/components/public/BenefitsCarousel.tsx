import {
  Sparkles,
  BookOpen,
  Heart,
  Users,
  MessageCircle,
  Lightbulb,
  Clock,
  Plane,
  Gift,
  HeartPulse,
  GraduationCap,
  Home,
  Compass,
  Mountain,
  BarChart3,
  Target,
  Shield,
  Zap,
  Rocket,
  Globe,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

interface Benefit {
  icon: ReactNode;
  title: string;
  description: string;
}

const ICON_MAP: Record<string, ReactNode> = {
  sparkles: <Sparkles className="h-6 w-6" />,
  "book-open": <BookOpen className="h-6 w-6" />,
  heart: <Heart className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  "message-circle": <MessageCircle className="h-6 w-6" />,
  lightbulb: <Lightbulb className="h-6 w-6" />,
  clock: <Clock className="h-6 w-6" />,
  plane: <Plane className="h-6 w-6" />,
  gift: <Gift className="h-6 w-6" />,
  "heart-pulse": <HeartPulse className="h-6 w-6" />,
  "graduation-cap": <GraduationCap className="h-6 w-6" />,
  home: <Home className="h-6 w-6" />,
  compass: <Compass className="h-6 w-6" />,
  mountain: <Mountain className="h-6 w-6" />,
  "bar-chart-3": <BarChart3 className="h-6 w-6" />,
  target: <Target className="h-6 w-6" />,
  shield: <Shield className="h-6 w-6" />,
  zap: <Zap className="h-6 w-6" />,
  rocket: <Rocket className="h-6 w-6" />,
  globe: <Globe className="h-6 w-6" />,
  "trending-up": <TrendingUp className="h-6 w-6" />,
};

const DEFAULT_BENEFITS: Benefit[] = [
  { icon: <Sparkles className="h-6 w-6" />, title: "Cultura viva", description: "Ritos de celebração e reconhecimento." },
  { icon: <BookOpen className="h-6 w-6" />, title: "Aprendizado contínuo", description: "Treinamentos frequentes, internos e externos." },
  { icon: <Heart className="h-6 w-6" />, title: "Cuidado", description: "Ações pensadas e voltadas para bem-estar." },
  { icon: <Users className="h-6 w-6" />, title: "Pessoas de verdade", description: "São o verdadeiro centro da Welcome." },
  { icon: <MessageCircle className="h-6 w-6" />, title: "Ambiente colaborativo", description: "Portas abertas, feedbacks constantes." },
  { icon: <Lightbulb className="h-6 w-6" />, title: "Autonomia real", description: "Espaço para criar e propor." },
  { icon: <Clock className="h-6 w-6" />, title: "Flexibilidade", description: "Horário e ambiente flexível." },
  { icon: <Plane className="h-6 w-6" />, title: "Viver próprias experiências", description: "Famtours e desconto em viagens." },
  { icon: <Gift className="h-6 w-6" />, title: "Programa de pontos", description: "Para trocar por experiências ou produtos." },
];

interface BenefitItem {
  icon: string;
  title: string;
  items: string[];
}

interface BenefitsCarouselProps {
  benefitCategories?: BenefitItem[];
}

export function BenefitsCarousel({ benefitCategories }: BenefitsCarouselProps) {
  let benefits: Benefit[];

  if (benefitCategories && benefitCategories.length > 0) {
    benefits = benefitCategories.flatMap((cat) =>
      cat.items.map((item) => ({
        icon: ICON_MAP[cat.icon] ?? <Gift className="h-6 w-6" />,
        title: item,
        description: cat.title,
      }))
    );
    if (benefits.length === 0) benefits = DEFAULT_BENEFITS;
  } else {
    benefits = DEFAULT_BENEFITS;
  }

  const track = [...benefits, ...benefits];

  return (
    <section className="overflow-hidden bg-wt-teal-deep py-20 sm:py-24">
      <div className="mx-auto max-w-wt-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.22em] text-wt-yellow">
            Na Welcome você encontra
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
        <ul
          aria-label="Benefícios do Welcome Group"
          className="flex shrink-0 animate-marquee gap-5 pr-5 motion-reduce:animate-none group-hover:[animation-play-state:paused]"
        >
          {track.map((b, i) => (
            <BenefitCard key={`a-${i}`} benefit={b} />
          ))}
        </ul>
        <ul
          aria-hidden="true"
          className="flex shrink-0 animate-marquee gap-5 pr-5 motion-reduce:animate-none group-hover:[animation-play-state:paused]"
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
      <h3 className="mt-4 font-wt-heading text-base font-bold text-white">{benefit.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/75">{benefit.description}</p>
    </li>
  );
}
