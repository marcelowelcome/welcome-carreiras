"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { APPLICATION_STAGE_LABELS, APPLICATION_STAGE_COLORS } from "@/lib/constants";
import { CandidateCard } from "./CandidateCard";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStage } from "@/types";

interface KanbanColumnProps {
  stage: ApplicationStage;
  applications: Application[];
  onUpdate: () => void;
}

export function KanbanColumn({ stage, applications, onUpdate }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 flex-shrink-0 flex-col rounded-xl border border-border bg-gray-50 transition-colors",
        isOver && "border-accent bg-accent/5"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
              APPLICATION_STAGE_COLORS[stage]
            )}
          >
            {APPLICATION_STAGE_LABELS[stage]}
          </span>
        </div>
        <span className="text-xs font-medium text-muted">
          {applications.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <SortableCard key={app.id} application={app} onUpdate={onUpdate} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <p className="py-8 text-center text-xs text-gray-400">
            Nenhum candidato
          </p>
        )}
      </div>
    </div>
  );
}

function SortableCard({
  application,
  onUpdate,
}: {
  application: Application;
  onUpdate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CandidateCard application={application} onUpdate={onUpdate} />
    </div>
  );
}
