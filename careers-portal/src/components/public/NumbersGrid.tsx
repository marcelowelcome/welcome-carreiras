interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: "50+", label: "Colaboradores" },
  { value: "30+", label: "Destinos" },
  { value: "10+", label: "Anos de mercado" },
  { value: "200+", label: "Eventos realizados" },
];

export function NumbersGrid() {
  return (
    <section className="bg-wt-gray-100/60 py-20 sm:py-24">
      <div className="mx-auto max-w-wt-container px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-wt-heading text-4xl font-black tracking-tight text-wt-primary sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 font-wt-heading text-xs font-semibold uppercase tracking-[0.12em] text-wt-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
