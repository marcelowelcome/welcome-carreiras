import type { Metadata } from "next";
import {
  Heart,
  Users,
  Rocket,
  Globe,
  TrendingUp,
  Sparkles,
  HeartPulse,
  GraduationCap,
  Home,
  Gift,
  HandHeart,
  Compass,
  Lightbulb,
  Mountain,
  BarChart3,
  Target,
  Shield,
  Zap,
} from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { CultureContent, Testimonial } from "@/types";
import { BRAND_LABELS, BRAND_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cultura",
  description:
    "Os Princípios BeWelcome são a essência do Welcome Group: como pensamos, decidimos e cuidamos de pessoas e clientes.",
};

const ICON_MAP: Record<string, ReactNode> = {
  heart: <Heart className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  rocket: <Rocket className="h-6 w-6" />,
  globe: <Globe className="h-6 w-6" />,
  "trending-up": <TrendingUp className="h-6 w-6" />,
  sparkles: <Sparkles className="h-6 w-6" />,
  "heart-pulse": <HeartPulse className="h-6 w-6" />,
  "graduation-cap": <GraduationCap className="h-6 w-6" />,
  home: <Home className="h-6 w-6" />,
  gift: <Gift className="h-6 w-6" />,
  "hand-heart": <HandHeart className="h-6 w-6" />,
  compass: <Compass className="h-6 w-6" />,
  lightbulb: <Lightbulb className="h-6 w-6" />,
  mountain: <Mountain className="h-6 w-6" />,
  "bar-chart-3": <BarChart3 className="h-6 w-6" />,
  target: <Target className="h-6 w-6" />,
  shield: <Shield className="h-6 w-6" />,
  zap: <Zap className="h-6 w-6" />,
};

interface Principle {
  title: string;
  icon: ReactNode;
  essence: string;
}

const DEFAULT_PRINCIPLES: Principle[] = [
  {
    title: "Apaixonados pela Jornada",
    icon: <HandHeart className="h-7 w-7" />,
    essence:
      "Cuide do sonho do cliente como se fosse seu. Encante, seja transparente, alinhe expectativas e traga as melhores soluções. O cliente é a razão de estarmos aqui.",
  },
  {
    title: "Bem vindo, sempre!",
    icon: <Users className="h-7 w-7" />,
    essence:
      "Sinta-se e faça com que todos se sintam bem-vindos, sempre e em todo lugar. Com interesse genuíno pelas pessoas, empatia e respeito. Bata o sino e comemore cada vitória.",
  },
  {
    title: "Protagonize-se",
    icon: <Compass className="h-7 w-7" />,
    essence:
      "Seja dono da sua jornada, com autonomia e proatividade. Busque soluções e não culpados. Faça o que precisa ser feito com zelo — este é o seu legado.",
  },
  {
    title: "Invente Moda",
    icon: <Lightbulb className="h-7 w-7" />,
    essence:
      "Sonhe grande, crie, inove, execute suas ideias e construa o futuro. Não tenha medo de errar — trate o erro como aprendizado, erre rápido e corrija ainda mais rápido.",
  },
  {
    title: "Conforto no Desconforto",
    icon: <Mountain className="h-7 w-7" />,
    essence:
      "Tenha humildade e nunca pare de aprender. Aprenda, desaprenda, reaprenda e ensine. Seja protagonista do autodesenvolvimento — seu e do time inteiro.",
  },
  {
    title: "Data Driven",
    icon: <BarChart3 className="h-7 w-7" />,
    essence:
      "Estabeleça objetivos claros e entregue resultados pelo caminho correto. Crie indicadores, analise dados e tome decisões informadas. Insista nos mais altos padrões.",
  },
];

export default async function CulturaPage() {
  const supabase = createServiceRoleClient();

  const [cultureResult, testimonialsResult] = await Promise.all([
    supabase.from("culture_content").select("*").order("sort_order"),
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order"),
  ]);

  const sections = (cultureResult.data ?? []) as CultureContent[];
  const testimonials = (testimonialsResult.data ?? []) as Testimonial[];

  const manifesto = sections.find((s) => s.section_key === "manifesto" && s.is_visible);
  const values = sections.find((s) => s.section_key === "values" && s.is_visible);
  const benefits = sections.find((s) => s.section_key === "benefits" && s.is_visible);
  const dei = sections.find((s) => s.section_key === "dei" && s.is_visible);
  const showTestimonials =
    sections.find((s) => s.section_key === "testimonials_section")?.is_visible ?? true;

  const manifestoText = (manifesto?.content as { text?: string })?.text ?? "";

  const dbValues = (
    values?.content as { items?: { icon: string; title: string; description: string }[] }
  )?.items ?? [];

  const principles: Principle[] =
    dbValues.length > 0
      ? dbValues.map((v) => ({
          title: v.title,
          icon: ICON_MAP[v.icon] ?? <Heart className="h-7 w-7" />,
          essence: v.description,
        }))
      : DEFAULT_PRINCIPLES;

  const benefitsCategories =
    (benefits?.content as {
      categories?: { icon: string; title: string; items: string[] }[];
    })?.categories ?? [];
  const deiText = (dei?.content as { text?: string })?.text ?? "";

  return (
    <div>
      {/* Hero Manifesto BeWelcome */}
      <section className="relative overflow-hidden bg-wt-off-white py-20 sm:py-28">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-wt-primary-light blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-wt-yellow/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-wt-heading text-5xl font-black leading-[1.05] tracking-tight text-wt-primary sm:text-6xl lg:text-7xl">
            #BeWelcome
          </h1>
          <p className="mt-6 font-wt-heading text-xl font-bold tracking-tight text-wt-teal-deep sm:text-2xl">
            {manifesto?.title ?? (
              <>
                Nossos princípios não são palavras —{" "}
                <span className="text-wt-primary">são ações</span>.
              </>
            )}
          </p>
          {manifestoText ? (
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-wt-gray-700">
              {manifestoText}
            </p>
          ) : (
            <>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-wt-gray-700">
                Chamamos nossos princípios de{" "}
                <strong className="text-wt-teal-deep">BeWelcome</strong> — como um verbo, um
                sentimento de pertencimento, uma atitude ativa e constante de viver o nosso
                propósito: criar experiências e transformar pessoas.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-wt-gray-700">
                Seja ao planejar projetos inovadores, tomar decisões estratégicas ou enfrentar
                desafios, os Princípios BeWelcome estão no centro de tudo o que fazemos. É isso
                que nos torna únicos. É isso que nos faz ser{" "}
                <strong className="text-wt-teal-deep">Welcome</strong>.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Princípios BeWelcome */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-wt-container px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary">
              Os {principles.length} princípios
            </p>
            <h2 className="mt-3 font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep sm:text-4xl">
              {values?.title ?? "Como vivemos a cultura BeWelcome"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-wt-gray-700">
              Seis princípios que orientam decisões, projetos e a forma como cuidamos das pessoas
              dentro e fora do grupo.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="rounded-wt-md bg-white p-8 shadow-wt-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-wt-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wt-primary-light text-wt-primary">
                  {principle.icon}
                </div>
                <h3 className="mt-5 font-wt-heading text-2xl font-bold leading-tight text-wt-teal-deep">
                  {principle.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-wt-gray-700">
                  {principle.essence}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios (dinâmico) */}
      {benefitsCategories.length > 0 && (
        <section className="bg-wt-gray-100/60 py-20 sm:py-24">
          <div className="mx-auto max-w-wt-container px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary">
                Benefícios
              </p>
              <h2 className="mt-3 font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep sm:text-4xl">
                {benefits?.title ?? "O que oferecemos"}
              </h2>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefitsCategories.map((category) => (
                <div
                  key={category.title}
                  className="rounded-wt-md bg-white p-6 shadow-wt-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-wt-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-wt-primary-light text-wt-primary">
                    {ICON_MAP[category.icon] ?? <Heart className="h-6 w-6" />}
                  </div>
                  <h3 className="mt-5 font-wt-heading text-base font-bold text-wt-teal-deep">
                    {category.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {category.items.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-wt-gray-700 before:mr-2 before:text-wt-primary before:content-['•']"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Depoimentos */}
      {showTestimonials && testimonials.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-wt-container px-6">
            <div className="text-center">
              <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary">
                Depoimentos
              </p>
              <h2 className="mt-3 font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep sm:text-4xl">
                Quem faz parte, conta
              </h2>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-wt-md bg-white p-6 shadow-wt-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-wt-md"
                >
                  <p className="font-wt-body text-sm leading-relaxed italic text-wt-gray-700">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wt-primary-light font-wt-heading text-sm font-bold text-wt-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-wt-heading text-sm font-bold text-wt-teal-deep">
                        {t.name}
                      </p>
                      <p className="text-xs text-wt-gray-500">
                        {t.role} &middot;{" "}
                        <span className={cn("font-medium", BRAND_COLORS[t.brand].text)}>
                          {BRAND_LABELS[t.brand]}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DEI / Manifesto de fechamento */}
      <section className="bg-wt-teal-deep py-20 text-white sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-wt-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {dei?.title ?? "Um legado que atravessa duas décadas"}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/85 sm:text-lg">
            {deiText ||
              "Com paixão, atenção impecável aos detalhes, atendimento excepcional e busca constante por inovação, construímos um legado de duas décadas. Aqui, reunimos expertise, criatividade e uma compreensão genuína das necessidades de cada cliente para transformar sonhos em realidade."}
          </p>
        </div>
      </section>
    </div>
  );
}
