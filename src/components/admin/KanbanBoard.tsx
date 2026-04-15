"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { APPLICATION_STAGES_ORDER } from "@/lib/constants";
import type { Application, ApplicationStage } from "@/types";

interface KanbanBoardProps {
  initialApplications: Application[];
  jobId: string;
}

export function KanbanBoard({ initialApplications, jobId }: KanbanBoardProps) {
  const [applications, setApplications] = useState(initialApplications);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const refreshApplications = useCallback(async () => {
    const res = await fetch(`/api/admin/applications?job_id=${jobId}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const { data } = (await res.json()) as { data: Application[] };
    if (data) setApplications(data);
  }, [jobId]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const newStage = over.id as ApplicationStage;

    const app = applications.find((a) => a.id === appId);
    if (!app || app.stage === newStage) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, stage: newStage } : a))
    );

    const res = await fetch(`/api/admin/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    if (!res.ok) {
      // Rollback em caso de erro
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: app.stage } : a))
      );
    }
  }

  // Labels específicos do Kanban (override do global APPLICATION_STAGE_LABELS).
  // "Triagem" vira "Phone Screen" só aqui.
  const kanbanLabels: Partial<Record<ApplicationStage, string>> = {
    triagem: "Phone Screen",
  };

  // Todas as etapas, reprovado sempre no final
  const orderedStages: ApplicationStage[] = [
    ...APPLICATION_STAGES_ORDER.filter((s) => s !== "reprovado"),
    "reprovado",
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {orderedStages.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            label={kanbanLabels[stage]}
            applications={applications.filter((a) => a.stage === stage)}
            onUpdate={refreshApplications}
          />
        ))}
      </div>
    </DndContext>
  );
}
