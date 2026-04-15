"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  target: number;
  durationMs?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

/**
 * Contador animado que começa quando o elemento entra no viewport.
 * Uso: const { ref, value } = useCountUp({ target: 50 });
 */
export function useCountUp({
  target,
  durationMs = 1600,
  decimals = 0,
  suffix = "",
  prefix = "",
}: Options) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string>(
    prefix + (0).toFixed(decimals) + suffix
  );
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const step = (now: number) => {
              const elapsed = Math.min(1, (now - start) / durationMs);
              const eased = 1 - Math.pow(1 - elapsed, 5); // easeOutQuint
              const current = eased * target;
              setValue(prefix + current.toFixed(decimals) + suffix);
              if (elapsed < 1) requestAnimationFrame(step);
              else setValue(prefix + target.toFixed(decimals) + suffix);
            };
            requestAnimationFrame(step);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, durationMs, decimals, suffix, prefix]);

  return { ref, value };
}
