"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CandidateDrawer } from "./CandidateDrawer";
import type { Application } from "@/types";

interface CandidateCardProps {
  application: Application;
  onUpdate: () => void;
}

export function CandidateCard({ application, onUpdate }: CandidateCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="w-full rounded-wt-sm bg-white p-3 text-left shadow-wt-sm transition-all hover:-translate-y-0.5 hover:shadow-wt-md"
      >
        <p className="text-sm font-semibold text-wt-teal-deep">
          {application.full_name}
        </p>
        <p className="mt-0.5 text-xs text-wt-gray-500">{application.email}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-wt-gray-500">
            {formatDate(application.created_at)}
          </span>
          {application.score ? (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-wt-yellow">
              <Star className="h-3 w-3 fill-wt-yellow" />
              {application.score}
            </span>
          ) : null}
        </div>
      </button>

      <CandidateDrawer
        application={application}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}
