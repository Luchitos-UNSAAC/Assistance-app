// components/calls/CallAnswersTabs.tsx
"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, FileText } from "lucide-react";
import {CallSchedule} from "@prisma/client";
import {CallWithSchedules} from "@/features/calls/actions/get-call-by-id";

type ScheduleShape = {
  id: string;
  dayOfWeek?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  onDate?: string | null;
};

type AnswerShape = {
  id: string;
  answer: string | null;
  selectedOptions: string[] | null;
  dateAnswer: string | null;
  numberAnswer: number | null;
  createdAt: string;
  participantId: string;
  participantStatus?: string | null;
  volunteer?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  schedules: ScheduleShape[];
};

type QuestionWithAnswers = {
  id: string;
  question: string;
  type: string;
  required: boolean;
  order: number;
  answers: AnswerShape[];
};

type ScheduleWithParticipants = {
  id: string;
  dayOfWeek?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  onDate?: string | null;
  participants: {
    participantId: string;
    participantStatus?: string | null;
    volunteer?: { id: string; name: string; email: string } | null;
    answersSummary: { questionId: string; questionText?: string; answer?: string | null; selectedOptions?: string[] | null }[];
    createdAt: string;
  }[];
};

interface Props {
  callId: string;
  call: CallWithSchedules
  questions: QuestionWithAnswers[];
  participantsCount: number;
  schedules: ScheduleWithParticipants[];
}

/* ---------- Helpers ---------- */
const formatDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("es-PE", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-";

const formatSchedule = (s: ScheduleShape) => {
  if (s.onDate) return `${new Date(s.onDate).toLocaleDateString()} • ${s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"} - ${s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}`;
  if (s.startTime && s.endTime) return `${s.dayOfWeek ?? "-"} • ${new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return s.dayOfWeek ?? "-";
};

/* ---------- Main component ---------- */
export default function CallAnswersTabs({ callId, questions, participantsCount, schedules, call }: Props) {
  const [activeTab, setActiveTab] = useState<"questions" | "schedules">("questions");
  
  return (
    <div className="space-y-6">
      {/* Header + tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Respuestas - Convocatoria</h1>
          <p className="text-sm text-muted-foreground mt-1">Convocatoria: <span className="font-medium">{call.title}</span> • Participantes: <span className="font-medium">{participantsCount}</span></p>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="rounded-md bg-muted inline-flex p-0.5">
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === "questions" ? "bg-white shadow" : "text-muted-foreground"}`}
              aria-pressed={activeTab === "questions"}
            >
              Preguntas
            </button>
            <button
              onClick={() => setActiveTab("schedules")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === "schedules" ? "bg-white shadow" : "text-muted-foreground"}`}
              aria-pressed={activeTab === "schedules"}
            >
              Horarios
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab content */}
      <div>
        {activeTab === "questions" ? (
          <QuestionsTab questions={questions} callId={callId} />
        ) : (
          <SchedulesTab schedules={schedules} callId={callId} />
        )}
      </div>
    </div>
  );
}

/* ---------------- QuestionsTab ---------------- */
function QuestionsTab({ questions, callId }: { questions: QuestionWithAnswers[]; callId: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "answered" | "no-answers">("all");
  const [expandedId, setExpandedId] = useState<Record<string, boolean>>({});
  
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions
      .map((quest) => ({ ...quest, answers: quest.answers.filter((a) => {
          if (!q) return true;
          const name = a.volunteer?.name ?? "";
          const email = a.volunteer?.email ?? "";
          const text = (a.answer ?? (a.selectedOptions ? a.selectedOptions.join(" ") : "")).toString();
          return quest.question.toLowerCase().includes(q) || name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || text.toLowerCase().includes(q);
        }) }))
      .filter((quest) => (filter === "all") ? true : (filter === "answered" ? quest.answers.length > 0 : quest.answers.length === 0));
  }, [questions, query, filter]);
  
  const toggle = (id: string) => setExpandedId((s) => ({ ...s, [id]: !s[id] }));
  
  // simple export
  const exportJSON = () => {
    const payload = { callId, exportedAt: new Date().toISOString(), questions: filtered };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `answers_questions_${callId}.json`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Input placeholder="Buscar pregunta, voluntario o texto..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-lg" />
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="all">Todas</option>
            <option value="answered">Con respuestas</option>
            <option value="no-answers">Sin respuestas</option>
          </select>
          <Button size="sm" onClick={exportJSON}><FileText size={14} className="mr-2" /> Exportar</Button>
        </div>
      </div>
      
      {filtered.length === 0 ? (
        <Card><CardContent><p className="text-sm text-muted-foreground">No hay preguntas con el filtro aplicado.</p></CardContent></Card>
      ) : (
        filtered.map((q) => (
          <Card key={q.id}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm md:text-base">{q.question}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{q.answers.length} respuesta{q.answers.length !== 1 ? "s" : ""}</span>
                <Button size="sm" onClick={() => toggle(q.id)}>{expandedId[q.id] ? "Ocultar" : "Ver respuestas"}</Button>
              </div>
            </CardHeader>
            
            {expandedId[q.id] && (
              <CardContent>
                {q.answers.length === 0 ? <p className="text-sm text-muted-foreground">Sin respuestas aún</p> :
                  <div className="space-y-3">
                    {q.answers.map((a) => (
                      <div key={a.id} className="border rounded p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium">{a.volunteer?.name ?? a.volunteer?.email ?? "Voluntario"}</div>
                            <div className="text-xs text-muted-foreground">{a.volunteer?.email ?? ""} • {formatDateTime(a.createdAt)}</div>
                          </div>
                          <div className="text-sm text-right">
                            {a.participantStatus && <div className="text-xs text-muted-foreground">Estado: {a.participantStatus}</div>}
                            {a.schedules.length > 0 && <div className="text-xs mt-1">{a.schedules.map((s) => <span key={s.id} className="inline-block px-2 py-0.5 bg-muted rounded text-xs mr-1">{formatSchedule(s)}</span>)}</div>}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Label>Respuesta</Label>
                          <div className="mt-1 text-sm">{a.selectedOptions ? a.selectedOptions.join(", ") : a.answer ?? <span className="text-muted-foreground">(vacío)</span>}</div>
                          {a.dateAnswer && <div className="mt-1 text-xs text-muted-foreground">Fecha: {formatDateTime(a.dateAnswer)}</div>}
                          {a.numberAnswer !== null && a.numberAnswer !== undefined && <div className="mt-1 text-xs text-muted-foreground">Número: {String(a.numberAnswer)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

/* ---------------- SchedulesTab ---------------- */
function SchedulesTab({ schedules, callId }: { schedules: ScheduleWithParticipants[]; callId: string }) {
  const [query, setQuery] = useState("");
  const [onlyWithParticipants, setOnlyWithParticipants] = useState(false);
  
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return schedules
      .map((s) => ({ ...s, participants: s.participants.filter((p) => {
          if (!q) return true;
          const name = p.volunteer?.name ?? "";
          const email = p.volunteer?.email ?? "";
          const answersText = p.answersSummary.map((as) => (as.answer ?? (as.selectedOptions ?? []).join(" "))).join(" ");
          return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || answersText.toLowerCase().includes(q) || formatSchedule(s).toLowerCase().includes(q);
        }) }))
      .filter((s) => (onlyWithParticipants ? s.participants.length > 0 : true));
  }, [schedules, query, onlyWithParticipants]);
  
  const exportCSV = () => {
    const headers = ["scheduleId", "schedule", "participantId", "name", "email", "answersSummary"];
    const rows = [headers.join(",")];
    filtered.forEach((s) => {
      if (s.participants.length === 0) {
        rows.push([`"${s.id}"`, `"${formatSchedule(s)}"`, "", "", "", ""].join(","));
      } else {
        s.participants.forEach((p) => {
          const answers = p.answersSummary.map((a) => `${a.questionText ?? a.questionId}: ${a.answer ?? (a.selectedOptions ?? []).join("; ")}`).join(" | ");
          const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
          rows.push([escape(s.id), escape(formatSchedule(s)), escape(p.participantId), escape(p.volunteer?.name ?? ""), escape(p.volunteer?.email ?? ""), escape(answers)].join(","));
        });
      }
    });
    const csv = rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedules_${callId}.csv`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Input placeholder="Buscar por horario, voluntario o respuesta..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-lg" />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyWithParticipants} onChange={(e) => setOnlyWithParticipants(e.target.checked)} />
            <span>Solo con participantes</span>
          </label>
          <Button size="sm" onClick={exportCSV}><Download size={14} className="mr-2" /> Exportar CSV</Button>
        </div>
      </div>
      
      {filtered.length === 0 ? <Card><CardContent><p className="text-sm text-muted-foreground">No hay horarios con los filtros aplicados.</p></CardContent></Card> :
        filtered.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle>{formatSchedule(s as ScheduleShape)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">Participantes: <span className="font-medium">{s.participants.length}</span></div>
              {s.participants.length === 0 ? <p className="text-sm text-muted-foreground">Nadie eligió este horario</p> :
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {s.participants.map((p) => (
                    <div key={p.participantId} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{p.volunteer?.name ?? p.volunteer?.email ?? "Voluntario"}</div>
                          <div className="text-xs text-muted-foreground">{p.volunteer?.email ?? ""}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(p.createdAt)}</div>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <div className="text-xs text-muted-foreground">Respuestas relevantes:</div>
                        <ul className="mt-1 list-disc list-inside text-sm">
                          {p.answersSummary.length === 0 ? <li className="text-muted-foreground">(sin respuestas)</li> :
                            p.answersSummary.map((as, idx) => (
                              <li key={idx}><strong>{as.questionText ?? as.questionId}:</strong> {as.answer ?? (as.selectedOptions ?? []).join(", ")}</li>
                            ))
                          }
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </CardContent>
          </Card>
        ))
      }
    </div>
  );
}
