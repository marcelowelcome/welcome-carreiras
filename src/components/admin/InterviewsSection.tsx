"use client";

import { useEffect, useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  INTERVIEW_TYPES_ORDER,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_VOTE_LABELS,
  INTERVIEW_VOTE_COLORS,
  CULTURE_PILLARS_ORDER,
  CULTURE_PILLAR_LABELS,
} from "@/lib/constants";
import type {
  Interview,
  InterviewType,
  InterviewVote,
  PillarScores,
  CulturePillar,
} from "@/types";

interface Props {
  applicationId: string;
}

const VOTE_ORDER: InterviewVote[] = [
  "muito_inclinado",
  "inclinado",
  "pouco_inclinado",
  "nao_inclinado",
];

export function InterviewsSection({ applicationId }: Props) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState<InterviewType | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(
      `/api/admin/applications/${applicationId}/interviews`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const { data } = (await res.json()) as { data: Interview[] };
      setInterviews(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  async function removeInterview(id: string) {
    if (!confirm("Remover esta entrevista?")) return;
    const res = await fetch(`/api/admin/interviews/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="rounded-wt-sm bg-white p-4 shadow-wt-sm">
      <p className="font-wt-heading text-xs font-bold uppercase tracking-[0.12em] text-wt-primary">
        Entrevistas — Bar Raiser, Pares e Painel
      </p>

      <div className="mt-4 space-y-3">
        {INTERVIEW_TYPES_ORDER.map((type) => {
          const roundInterviews = interviews.filter((i) => i.type === type);
          return (
            <div
              key={type}
              className="rounded-wt-sm border border-wt-gray-300/60 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-wt-heading text-xs font-bold uppercase tracking-[0.08em] text-wt-teal-deep">
                  {INTERVIEW_TYPE_LABELS[type]}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenForm(openForm === type ? null : type)}
                  className="inline-flex items-center gap-1 font-wt-heading text-[11px] font-semibold uppercase tracking-[0.08em] text-wt-primary hover:text-wt-primary-dark"
                >
                  <Plus className="h-3 w-3" />
                  {openForm === type ? "Cancelar" : "Registrar"}
                </button>
              </div>

              {loading && (
                <p className="mt-2 text-xs text-wt-gray-500">Carregando...</p>
              )}

              {roundInterviews.length > 0 && (
                <ul className="mt-3 space-y-3">
                  {roundInterviews.map((iv) => (
                    <InterviewItem
                      key={iv.id}
                      interview={iv}
                      onDelete={() => removeInterview(iv.id)}
                    />
                  ))}
                </ul>
              )}

              {openForm === type && (
                <div className="mt-3 border-t border-wt-gray-300/60 pt-3">
                  <InterviewForm
                    applicationId={applicationId}
                    type={type}
                    onSaved={() => {
                      setOpenForm(null);
                      load();
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InterviewItem({
  interview,
  onDelete,
}: {
  interview: Interview;
  onDelete: () => void;
}) {
  return (
    <li className="rounded-wt-sm bg-wt-gray-100/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          {interview.interviewer_name && (
            <p className="text-sm font-semibold text-wt-teal-deep">
              {interview.interviewer_name}
            </p>
          )}
          <p className="text-[11px] text-wt-gray-500">
            {formatDate(interview.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {interview.vote && (
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                INTERVIEW_VOTE_COLORS[interview.vote]
              )}
            >
              {INTERVIEW_VOTE_LABELS[interview.vote]}
            </span>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="text-wt-gray-500 hover:text-wt-red"
            aria-label="Remover entrevista"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {Object.keys(interview.pillar_scores).length > 0 && (
        <div className="mt-2 space-y-1">
          {CULTURE_PILLARS_ORDER.map((pillar) => {
            const score = interview.pillar_scores[pillar];
            if (!score) return null;
            return (
              <div
                key={pillar}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="text-wt-gray-700">
                  {CULTURE_PILLAR_LABELS[pillar]}
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={cn(
                        "h-3 w-3",
                        n <= score
                          ? "fill-wt-yellow text-wt-yellow"
                          : "text-wt-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {interview.notes && (
        <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-wt-gray-700">
          {interview.notes}
        </p>
      )}
    </li>
  );
}

function InterviewForm({
  applicationId,
  type,
  onSaved,
}: {
  applicationId: string;
  type: InterviewType;
  onSaved: () => void;
}) {
  const [interviewerName, setInterviewerName] = useState("");
  const [vote, setVote] = useState<InterviewVote | "">("");
  const [notes, setNotes] = useState("");
  const [scores, setScores] = useState<PillarScores>({});
  const [saving, setSaving] = useState(false);

  function setPillar(pillar: CulturePillar, value: number) {
    setScores((prev) => {
      const next = { ...prev };
      if (value === prev[pillar]) {
        delete next[pillar];
      } else {
        next[pillar] = value;
      }
      return next;
    });
  }

  async function submit() {
    setSaving(true);
    const res = await fetch(
      `/api/admin/applications/${applicationId}/interviews`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          interviewer_name: interviewerName.trim() || null,
          vote: vote || null,
          pillar_scores: scores,
          notes: notes.trim() || null,
        }),
      }
    );
    setSaving(false);
    if (res.ok) onSaved();
  }

  const inputClass =
    "w-full rounded-wt-sm border border-wt-gray-300 bg-white px-3 py-2 text-sm text-wt-teal-deep focus:border-wt-primary focus:outline-none focus:ring-1 focus:ring-wt-primary";

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={interviewerName}
        onChange={(e) => setInterviewerName(e.target.value)}
        placeholder="Nome do entrevistador"
        className={inputClass}
      />

      <div>
        <p className="mb-1.5 font-wt-heading text-[11px] font-bold uppercase tracking-[0.08em] text-wt-gray-700">
          Voto
        </p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {VOTE_ORDER.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVote(v === vote ? "" : v)}
              className={cn(
                "rounded-wt-sm border px-3 py-1.5 text-left text-[11px] font-medium transition-colors",
                v === vote
                  ? "border-wt-primary bg-wt-primary-light text-wt-primary"
                  : "border-wt-gray-300 bg-white text-wt-gray-700 hover:border-wt-primary"
              )}
            >
              {INTERVIEW_VOTE_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 font-wt-heading text-[11px] font-bold uppercase tracking-[0.08em] text-wt-gray-700">
          Pilares BeWelcome
        </p>
        <ul className="space-y-1.5">
          {CULTURE_PILLARS_ORDER.map((pillar) => (
            <li
              key={pillar}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-xs text-wt-gray-700">
                {CULTURE_PILLAR_LABELS[pillar]}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPillar(pillar, n)}
                    aria-label={`${CULTURE_PILLAR_LABELS[pillar]} - nota ${n}`}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 transition-colors",
                        n <= (scores[pillar] ?? 0)
                          ? "fill-wt-yellow text-wt-yellow"
                          : "text-wt-gray-300 hover:text-wt-yellow"
                      )}
                    />
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <textarea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Observações sobre a entrevista..."
        className={inputClass}
      />

      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="inline-flex items-center rounded-wt-sm bg-wt-primary px-4 py-2 font-wt-heading text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-wt-primary-dark disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar entrevista"}
      </button>
    </div>
  );
}
