"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface Stat {
  target: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

// TODO: substituir por números reais (RH) na Sprint 3
const STATS: Stat[] = [
  { target: 50, suffix: "+", label: "Colaboradores" },
  { target: 20, suffix: "+", label: "Anos de história" },
  { target: 30, suffix: "+", label: "Destinos" },
  { target: 200, suffix: "+", label: "Eventos realizados" },
];

export function CountersStrip() {
  return (
    <section className="bg-wt-gray-100/60 py-20 sm:py-24">
      <div className="mx-auto max-w-wt-container px-6">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Counter key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ stat }: { stat: Stat }) {
  const { ref, value } = useCountUp({
    target: stat.target,
    suffix: stat.suffix,
    prefix: stat.prefix,
    durationMs: 1800,
  });

  return (
    <div ref={ref} className="text-center">
      <p className="font-wt-heading text-4xl font-black tracking-tight text-wt-primary sm:text-5xl lg:text-6xl">
        {value}
      </p>
      <p className="mt-3 font-wt-heading text-xs font-semibold uppercase tracking-[0.14em] text-wt-gray-500">
        {stat.label}
      </p>
    </div>
  );
}
