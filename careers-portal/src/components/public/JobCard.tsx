import Link from "next/link";
import { MapPin, Briefcase, Building2, ArrowRight } from "lucide-react";
import type { Job } from "@/types";
import {
  BRAND_LABELS,
  BRAND_COLORS,
  CONTRACT_TYPE_LABELS,
  WORK_MODEL_LABELS,
} from "@/lib/constants";
import { cn, formatRelativeDate } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  showBrand?: boolean;
}

export function JobCard({ job, showBrand = true }: JobCardProps) {
  const brandColor = BRAND_COLORS[job.brand];

  return (
    <Link
      href={`/vagas/${job.slug}`}
      className="group block rounded-wt-md bg-white p-6 shadow-wt-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-wt-lg sm:p-8"
    >
      {showBrand && (
        <span
          className={cn(
            "inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
            brandColor.badge
          )}
        >
          {BRAND_LABELS[job.brand]}
        </span>
      )}

      <h3 className="mt-3 font-wt-heading text-xl font-bold tracking-tight text-wt-teal-deep transition-colors group-hover:text-wt-primary sm:text-2xl">
        {job.title}
      </h3>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-wt-gray-700">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-wt-primary" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="h-4 w-4 text-wt-primary" />
          {CONTRACT_TYPE_LABELS[job.contract_type]}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-wt-primary" />
          {WORK_MODEL_LABELS[job.work_model]}
        </span>
      </div>

      {job.salary_range && (
        <p className="mt-4 text-sm font-semibold text-wt-teal-deep">
          {job.salary_range}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-wt-gray-300/60 pt-4">
        {job.published_at ? (
          <p className="text-xs text-wt-gray-500">
            Publicada {formatRelativeDate(job.published_at)}
          </p>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-2 font-wt-heading text-xs font-bold uppercase tracking-[0.1em] text-wt-gray-700 transition-colors group-hover:text-wt-primary">
          Explore
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
