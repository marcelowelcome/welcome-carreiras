"use client";

import { useEffect, useRef, useState } from "react";
import { Star, FileText, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  APPLICATION_STAGE_LABELS,
  APPLICATION_STAGES_ORDER,
} from "@/lib/constants";
import { InterviewsSection } from "./InterviewsSection";
import type {
  Application,
  ApplicationStage,
  StageEvaluation,
} from "@/types";

interface CandidateDrawerProps {
  application: Application;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function CandidateDrawer({
  application,
  open,
  onClose,
  onUpdate,
}: CandidateDrawerProps) {
  const [notes, setNotes] = useState(application.notes ?? "");
  const [score, setScore] = useState(application.score ?? 0);
  const [saving, setSaving] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const [moveError, setMoveError] = useState<string | null>(null);
  const [moveSuccess, setMoveSuccess] = useState<string | null>(null);

  // Avaliações por etapa
  const [evaluations, setEvaluations] = useState<StageEvaluation[]>([]);
  const [evalStage, setEvalStage] = useState<ApplicationStage>(application.stage);
  const [evalScore, setEvalScore] = useState(0);
  const [evalNotes, setEvalNotes] = useState("");
  const [savingEval, setSavingEval] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Sincroniza ao reabrir com outro candidato
  useEffect(() => {
    setNotes(application.notes ?? "");
    setScore(application.score ?? 0);
    setEvalStage(application.stage);
    setEvalNotes("");
    setEvalScore(0);
    setMoveError(null);
    setMoveSuccess(null);
    setNotesError(null);
  }, [application.id, application.notes, application.score, application.stage]);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/admin/applications/${application.id}/evaluations`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ data }) => setEvaluations(data ?? []))
      .catch(() => setEvaluations([]));
  }, [open, application.id]);

  // UX-033: focus trap and Escape key handler
  useEffect(() => {
    if (!open) return;

    // Focus first focusable element on open
    const drawer = drawerRef.current;
    if (drawer) {
      const focusable = drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) focusable[0].focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.hasAttribute("disabled"));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Auto-dismiss success toast
  useEffect(() => {
    if (!moveSuccess) return;
    const t = setTimeout(() => setMoveSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [moveSuccess]);

  async function saveNotes() {
    setSaving(true);
    setNotesError(null);
    try {
      const res = await fetch(`/api/admin/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, score: score || null }),
      });
      if (!res.ok) {
        setNotesError("Falha ao salvar notas. Tente novamente.");
      }
    } catch {
      setNotesError("Erro de rede ao salvar notas.");
    } finally {
      setSaving(false);
    }
  }

  async function moveToStage(newStage: ApplicationStage) {
    setMoveError(null);
    try {
      const res = await fetch(`/api/admin/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) {
        setMoveError("Falha ao mover para a etapa selecionada. Tente novamente.");
        return;
      }
      setMoveSuccess(`Candidato movido para ${APPLICATION_STAGE_LABELS[newStage]}.`);
      onUpdate?.();
      onClose();
    } catch {
      setMoveError("Erro de rede ao mover candidato.");
    }
  }

  async function submitEvaluation() {
    if (!evalStage || (!evalNotes.trim() && !evalScore)) return;
    setSavingEval(true);
    const res = await fetch(
      `/api/admin/applications/${application.id}/evaluations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: evalStage,
          score: evalScore || null,
          notes: evalNotes.trim() || null,
        }),
      }
    );
    if (res.ok) {
      const { data } = (await res.json()) as { data: StageEvaluation };
      setEvaluations((prev) => [data, ...prev]);
      setEvalNotes("");
      setEvalScore(0);
    }
    setSavingEval(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative w-full max-w-md overflow-y-auto bg-wt-off-white shadow-wt-lg"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-wt-gray-300/60 bg-wt-off-white px-6 py-4">
          <div>
            <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.15em] text-wt-primary">
              Candidato · {APPLICATION_STAGE_LABELS[application.stage]}
            </p>
            <h3
              id="drawer-title"
              className="mt-1 font-wt-heading text-lg font-bold text-wt-teal-deep"
            >
              {application.full_name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="text-wt-gray-500 hover:text-wt-teal-deep"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* Info */}
          <div className="rounded-wt-sm bg-white p-4 shadow-wt-sm">
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="min-w-[84px] font-semibold text-wt-teal-deep">
                  E-mail
                </dt>
                <dd className="text-wt-gray-700">{application.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="min-w-[84px] font-semibold text-wt-teal-deep">
                  Telefone
                </dt>
                <dd className="text-wt-gray-700">{application.phone}</dd>
              </div>
              {application.linkedin_url && (
                <div className="flex gap-2">
                  <dt className="min-w-[84px] font-semibold text-wt-teal-deep">
                    LinkedIn
                  </dt>
                  <dd>
                    <a
                      href={application.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wt-primary hover:underline"
                    >
                      Perfil
                    </a>
                  </dd>
                </div>
              )}
              {application.salary_expectation && (
                <div className="flex gap-2">
                  <dt className="min-w-[84px] font-semibold text-wt-teal-deep">
                    Pretensão
                  </dt>
                  <dd className="text-wt-gray-700">
                    {application.salary_expectation}
                  </dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="min-w-[84px] font-semibold text-wt-teal-deep">
                  Aplicou em
                </dt>
                <dd className="text-wt-gray-700">
                  {formatDate(application.created_at)}
                </dd>
              </div>
            </dl>
          </div>

          {/* CV */}
          {application.resume_path && (
            <a
              href={`/api/admin/resumes?path=${encodeURIComponent(application.resume_path)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-wt-sm border border-wt-gray-300 bg-white px-4 py-2 font-wt-heading text-xs font-semibold uppercase tracking-[0.08em] text-wt-gray-700 transition-colors hover:border-wt-primary hover:text-wt-primary"
            >
              <FileText className="h-4 w-4" />
              Baixar currículo
            </a>
          )}

          {/* Cover letter */}
          {application.cover_letter && (
            <div className="rounded-wt-sm bg-white p-4 shadow-wt-sm">
              <p className="font-wt-heading text-xs font-bold uppercase tracking-[0.12em] text-wt-primary">
                Carta de apresentação
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-wt-gray-700">
                {application.cover_letter}
              </p>
            </div>
          )}

          {/* Score geral + Notas */}
          <div className="rounded-wt-sm bg-white p-4 shadow-wt-sm">
            <p className="font-wt-heading text-xs font-bold uppercase tracking-[0.12em] text-wt-primary">
              Avaliação geral
            </p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScore(n === score ? 0 : n)}
                  aria-label={`Nota ${n}`}
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      n <= score
                        ? "fill-wt-yellow text-wt-yellow"
                        : "text-wt-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>

            <p className="mt-5 font-wt-heading text-xs font-bold uppercase tracking-[0.12em] text-wt-primary">
              Notas internas
            </p>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              className="mt-2 w-full rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2 text-sm text-wt-teal-deep focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary"
              placeholder="Adicione notas sobre o candidato..."
            />
            {saving && (
              <p className="mt-1 text-xs text-wt-gray-500">Salvando...</p>
            )}
            {notesError && (
              <p role="alert" className="mt-1 text-xs text-red-600">{notesError}</p>
            )}
          </div>

          {/* Entrevistas estruturadas (Bar Raiser + pares + painel) */}
          <InterviewsSection applicationId={application.id} />

          {/* Avaliações por etapa */}
          <div className="rounded-wt-sm bg-white p-4 shadow-wt-sm">
            <p className="font-wt-heading text-xs font-bold uppercase tracking-[0.12em] text-wt-primary">
              Avaliações por etapa
            </p>

            {evaluations.length > 0 && (
              <ul className="mt-4 space-y-4">
                {evaluations.map((ev) => (
                  <li
                    key={ev.id}
                    className="border-l-2 border-wt-primary-light pl-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-wt-heading text-xs font-bold uppercase tracking-[0.08em] text-wt-teal-deep">
                        {APPLICATION_STAGE_LABELS[ev.stage]}
                      </span>
                      <span className="text-[11px] text-wt-gray-500">
                        {formatDate(ev.created_at)}
                      </span>
                    </div>
                    {ev.score && (
                      <div className="mt-1 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={cn(
                              "h-3.5 w-3.5",
                              n <= (ev.score ?? 0)
                                ? "fill-wt-yellow text-wt-yellow"
                                : "text-wt-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    )}
                    {ev.notes && (
                      <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-wt-gray-700">
                        {ev.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Form nova avaliação */}
            <div className="mt-5 space-y-3 border-t border-wt-gray-300/60 pt-4">
              <select
                value={evalStage}
                onChange={(e) => setEvalStage(e.target.value as ApplicationStage)}
                className="w-full rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2 text-sm text-wt-teal-deep focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary"
              >
                {APPLICATION_STAGES_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {APPLICATION_STAGE_LABELS[s]}
                  </option>
                ))}
              </select>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEvalScore(n === evalScore ? 0 : n)}
                    aria-label={`Nota ${n} para esta etapa`}
                  >
                    <Star
                      className={cn(
                        "h-5 w-5 transition-colors",
                        n <= evalScore
                          ? "fill-wt-yellow text-wt-yellow"
                          : "text-wt-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                placeholder="Anotações da etapa (ex: como foi a entrevista)..."
                className="w-full rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2 text-sm text-wt-teal-deep focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary"
              />

              <button
                type="button"
                onClick={submitEvaluation}
                disabled={savingEval || (!evalNotes.trim() && !evalScore)}
                className="inline-flex items-center rounded-wt-sm bg-wt-primary px-4 py-2 font-wt-heading text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-wt-primary-dark disabled:opacity-50"
              >
                {savingEval ? "Salvando..." : "Adicionar avaliação"}
              </button>
            </div>
          </div>

          {/* Mover etapa */}
          <div>
            <p className="font-wt-heading text-xs font-bold uppercase tracking-[0.12em] text-wt-primary">
              Mover para etapa
            </p>

            {moveError && (
              <p role="alert" className="mt-2 text-xs text-red-600">{moveError}</p>
            )}
            {moveSuccess && (
              <p role="status" className="mt-2 text-xs text-green-700">{moveSuccess}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {APPLICATION_STAGES_ORDER.filter(
                (s) => s !== application.stage
              ).map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => moveToStage(stage)}
                  className="rounded-full border border-wt-gray-300 bg-white px-3 py-1 font-wt-heading text-[11px] font-semibold uppercase tracking-[0.06em] text-wt-gray-700 transition-colors hover:border-wt-primary hover:text-wt-primary"
                >
                  {APPLICATION_STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
