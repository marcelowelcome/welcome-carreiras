"use client";

import { useEffect, useRef, useState } from "react";

export function PurposeSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip animation entirely for users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-wt-teal-deep py-24 sm:py-32"
    >
      {/* Glow sutil no canto */}
      <div className="pointer-events-none absolute -right-48 -top-48 h-[36rem] w-[36rem] rounded-full bg-wt-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-wt-yellow/10 blur-[80px]" />

      <div className="relative mx-auto max-w-wt-container px-6 text-center">
        {/* Label */}
        <div
          className={`transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <span className="inline-block rounded-full border border-wt-primary/40 px-4 py-1.5 font-wt-heading text-[10px] font-bold uppercase tracking-[0.3em] text-wt-primary">
            Nosso Propósito
          </span>
        </div>

        {/* Propósito — texto principal */}
        <h2
          className={`mx-auto mt-8 max-w-4xl font-wt-heading text-4xl font-black leading-[1.05] tracking-tight text-white transition-all delay-150 duration-700 sm:text-5xl lg:text-6xl xl:text-7xl ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          Criar{" "}
          <span className="text-wt-yellow">experiências</span>{" "}
          e transformar{" "}
          <span className="text-wt-yellow">pessoas</span>.
        </h2>

        {/* Linha divisora */}
        <div
          className={`mx-auto mt-10 h-px w-20 bg-wt-primary/50 transition-all delay-300 duration-700 ${visible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
        />

        {/* Apoio contextual */}
        <p
          className={`mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70 transition-all delay-[400ms] duration-700 sm:text-xl ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          Esse propósito guia cada viagem planejada, cada casamento realizado,
          cada evento entregue — e cada pessoa que construiu sua carreira aqui.
          Buscamos quem queira ser parte dessa transformação.
        </p>
      </div>
    </section>
  );
}
