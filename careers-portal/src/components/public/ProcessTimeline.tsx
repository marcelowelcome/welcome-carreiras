import type { ProcessStep } from "@/types";

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="font-wt-heading text-xl font-bold text-wt-teal-deep sm:text-2xl">
        Etapas do processo
      </h2>
      <ol className="relative ml-4 border-l-2 border-wt-gray-300/60">
        {steps.map((step, index) => (
          <li key={index} className="relative mb-8 ml-6 last:mb-0">
            <span className="absolute -left-[31px] flex h-7 w-7 items-center justify-center rounded-full border-2 border-wt-primary bg-white font-wt-heading text-xs font-bold text-wt-primary">
              {step.order}
            </span>
            <h3 className="font-wt-heading text-sm font-bold text-wt-teal-deep">
              {step.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-wt-gray-700">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
