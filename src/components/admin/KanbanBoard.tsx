"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
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
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Auto-dismiss error toast after 5 seconds
  useEffect(() => {
    if (!errorToast) return;
    const timer = setTimeout(() => setErrorToast(null), 5000);
    return () => clearTimeout(timer);
  }, [errorToast]);

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
      // Rollback on error
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: app.stage } : a))
      );
      setErrorToast("Falha ao mover candidato. A alteração foi revertida.");
    }
  }

  // All stages, reprovado always last
  const orderedStages: ApplicationStage[] = [
    ...APPLICATION_STAGES_ORDER.filter((s) => s !== "reprovado"),
    "reprovado",
  ];

  return (
    <>
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
              applications={applications.filter((a) => a.stage === stage)}
              onUpdate={refreshApplications}
            />
          ))}
        </div>
      </DndContext>

      {errorToast && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <span>{errorToast}</span>
          <button
            type="button"
            onClick={() => setErrorToast(null)}
            className="ml-2 text-white/80 hover:text-white"
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
