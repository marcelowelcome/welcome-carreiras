"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import { BRAND_LABELS, BRAND_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (testimonials.length === 0) return null;

  const testimonial = testimonials[current];

  function goTo(index: number) {
    setCurrent((index + testimonials.length) % testimonials.length);
  }

  return (
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

        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="rounded-wt-lg bg-white p-8 shadow-wt-sm sm:p-12">
            <Quote className="h-10 w-10 text-wt-primary/30" />

            <blockquote className="mt-4 font-wt-body text-lg leading-relaxed text-wt-gray-700 sm:text-xl">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-wt-primary-light font-wt-heading text-sm font-bold text-wt-primary">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <p className="font-wt-heading font-bold text-wt-teal-deep">
                  {testimonial.name}
                </p>
                <p className="text-sm text-wt-gray-500">
                  {testimonial.role} &middot;{" "}
                  <span
                    className={cn(
                      "font-medium",
                      BRAND_COLORS[testimonial.brand].text
                    )}
                  >
                    {BRAND_LABELS[testimonial.brand]}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Controles */}
          {testimonials.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => goTo(current - 1)}
                className="rounded-full border border-wt-gray-300 bg-white p-2 text-wt-gray-700 transition-colors hover:border-wt-primary hover:text-wt-primary"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      i === current ? "bg-wt-primary" : "bg-wt-gray-300"
                    )}
                    aria-label={`Ir para depoimento ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => goTo(current + 1)}
                className="rounded-full border border-wt-gray-300 bg-white p-2 text-wt-gray-700 transition-colors hover:border-wt-primary hover:text-wt-primary"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
