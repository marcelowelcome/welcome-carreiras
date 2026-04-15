import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Vertical {
  slug: string;
  brandParam: string;
  name: string;
  logo: string;
  description: string;
  accent: string; // text color class
  border: string; // hover border class
}

const VERTICALS: Vertical[] = [
  {
    slug: "trips",
    brandParam: "welcome_trips",
    name: "Welcome Trips",
    logo: "/imagens/LP_LogoTrips.png",
    description:
      "Agência de viagens premium com 20 anos curando jornadas para famílias, casais e grupos.",
    accent: "text-wt-primary",
    border: "hover:border-wt-primary",
  },
  {
    slug: "weddings",
    brandParam: "welcome_weddings",
    name: "Welcome Weddings",
    logo: "/imagens/LP_LogoWeddings.png",
    description:
      "Planejamento de destination weddings para casais que querem casar com o mundo de cenário.",
    accent: "text-weddings-dark",
    border: "hover:border-weddings",
  },
  {
    slug: "corp",
    brandParam: "corporativo",
    name: "Welcome Corp",
    logo: "/imagens/LP_LogoCorp.png",
    description:
      "Time corporativo: marketing, tecnologia, financeiro e operações que sustentam o grupo inteiro.",
    accent: "text-wt-teal-deep",
    border: "hover:border-wt-teal-deep",
  },
];

export function VerticalsCards() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-wt-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.22em] text-wt-primary">
            Nossas marcas
          </p>
          <h2 className="mt-4 font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep sm:text-4xl">
            Escolha o time que combina com você
          </h2>
          <p className="mt-4 text-base leading-relaxed text-wt-gray-700">
            Três marcas complementares, uma cultura só. Veja as oportunidades
            de cada uma.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {VERTICALS.map((v) => (
            <Link
              key={v.slug}
              href={`/vagas?marca=${v.brandParam}`}
              className={`group flex flex-col rounded-wt-md border-2 border-transparent bg-white p-8 shadow-wt-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-wt-lg ${v.border}`}
            >
              <div className="flex h-20 items-center">
                <Image
                  src={v.logo}
                  alt={v.name}
                  width={180}
                  height={90}
                  className="max-h-full w-auto object-contain"
                />
              </div>
              <p className="mt-6 flex-1 text-sm leading-relaxed text-wt-gray-700">
                {v.description}
              </p>
              <span
                className={`mt-6 inline-flex items-center gap-2 font-wt-heading text-xs font-bold uppercase tracking-[0.1em] ${v.accent}`}
              >
                Ver vagas
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
