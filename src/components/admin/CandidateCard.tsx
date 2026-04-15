"use client";

import { useState } from "react";
import { Star, FileText, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { APPLICATION_STAGE_LABELS, APPLICATION_STAGES_ORDER } from "@/lib/constants";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Application, ApplicationStage } from "@/types";

interface CandidateCardProps {
  application: Application;
  onUpdate: () => void;
}

export function CandidateCard({ application, onUpdate }: CandidateCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notes, setNotes] = useState(application.notes ?? "");
  const [score, setScore] = useState(application.score ?? 0);
  const [saving, setSaving] = useState(false);

  async function saveNotes() {
    setSaving(true);
    const supabase = createBrowserClient();
    await supabase
      .from("applications")
      .update({ notes, score: score || null })
      .eq("id", application.id);
    setSaving(false);
  }

  async function moveToStage(newStage: ApplicationStage) {
    const supabase = createBrowserClient();
    await supabase
      .from("applications")
      .update({
        stage: newStage,
        stage_updated_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    await supabase.from("stage_history").insert({
      application_id: application.id,
      from_stage: application.stage,
      to_stage: newStage,
    });

    setDrawerOpen(false);
    onUpdate();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="w-full rounded-lg border border-border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <p className="text-sm font-medium text-primary">{application.full_name}</p>
        <p className="mt-0.5 text-xs text-muted">{application.email}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {formatDate(application.created_at)}
          </span>
          {application.score && (
            <span className="inline-flex items-center gap-0.5 text-xs text-accent">
              <Star className="h-3 w-3 fill-accent" />
              {application.score}
            </span>
          )}
        </div>
      </button>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-y-auto bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white px-6 py-4">
              <h3 className="text-lg font-semibold text-primary">
                {application.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-muted hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              {/* Info */}
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-primary">E-mail:</span> {application.email}</p>
                <p><span className="font-medium text-primary">Telefone:</span> {application.phone}</p>
                {application.linkedin_url && (
                  <p>
                    <span className="font-medium text-primary">LinkedIn:</span>{" "}
                    <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      Perfil
                    </a>
                  </p>
                )}
                {application.salary_expectation && (
                  <p><span className="font-medium text-primary">Pretensão:</span> {application.salary_expectation}</p>
                )}
                <p><span className="font-medium text-primary">Candidatura:</span> {formatDate(application.created_at)}</p>
              </div>

              {/* CV */}
              {application.resume_path && (
                <a
                  href={`/api/admin/resumes?path=${encodeURIComponent(application.resume_path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-primary hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4" />
                  Baixar currículo
                </a>
              )}

              {/* Cover letter */}
              {application.cover_letter && (
                <div>
                  <p className="text-sm font-medium text-primary">Carta de apresentação</p>
                  <p className="mt-1 text-sm text-muted">{application.cover_letter}</p>
                </div>
              )}

              {/* Score */}
              <div>
                <p className="text-sm font-medium text-primary">Avaliacao</p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScore(n)}
                      className="transition-colors"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6",
                          n <= score
                            ? "fill-accent text-accent"
                            : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm font-medium text-primary">Notas internas</p>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={saveNotes}
                  className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Adicione notas sobre o candidato..."
                />
                {saving && (
                  <p className="mt-1 text-xs text-muted">Salvando...</p>
                )}
              </div>

              {/* Mover etapa */}
              <div>
                <p className="text-sm font-medium text-primary">Mover para etapa</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {APPLICATION_STAGES_ORDER.filter(
                    (s) => s !== application.stage
                  ).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => moveToStage(stage)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-primary"
                    >
                      {APPLICATION_STAGE_LABELS[stage]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
