// components/calls/CallAnswersViewerResponsive.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Download, FileText, ChevronDown, ChevronUp, Copy } from "lucide-react";

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
    address?: string | null;
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

interface Props {
  questions: QuestionWithAnswers[];
  participantsCount: number;
  callId: string;
}

/** Helpers */
const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("es-PE", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const formatSchedule = (s: ScheduleShape) => {
  if (s.onDate) {
    return `${new Date(s.onDate).toLocaleDateString()} • ${s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"} - ${s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}`;
  }
  if (s.startTime && s.endTime) {
    return `${s.dayOfWeek ?? "-"} • ${new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return s.dayOfWeek ?? "-";
};

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length === 1 ? parts[0].slice(0, 2) : (parts[0][0] + parts[1][0]);
  return initials.toUpperCase();
};

const truncate = (text: string | null | undefined, max = 160) => {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
};

/** Componente principal */
export default function CallAnswersViewerResponsive({ questions, participantsCount, callId }: Props) {
  // UI state
  const [query, setQuery] = useState("");
  const [filterHasAnswer, setFilterHasAnswer] = useState<"all" | "answered" | "no-answers">("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [expandedAnswerIds, setExpandedAnswerIds] = useState<Record<string, boolean>>({});
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Detectar screen width y establecer comportamiento por defecto
  useEffect(() => {
    const m = window.matchMedia("(min-width: 768px)");
    setIsDesktop(m.matches);
    const handler = (ev: MediaQueryListEvent) => setIsDesktop(ev.matches);
    m.addEventListener?.("change", handler);
    return () => m.removeEventListener?.("change", handler);
  }, []);
  
  // Abrir todas en desktop por defecto, cerrar en mobile
  useEffect(() => {
    const map: Record<string, boolean> = {};
    questions.forEach((q) => (map[q.id] = isDesktop)); // desktop -> open; mobile -> closed
    setExpandedQuestions(map);
  }, [questions, isDesktop]);
  
  // Filtros y búsqueda (memoizados)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions
      .map((question) => {
        const answersFiltered = question.answers.filter((a) => {
          if (!q) return true;
          const volunteerName = a.volunteer?.name ?? "";
          const volunteerEmail = a.volunteer?.email ?? "";
          const answerText = (a.answer ?? (a.selectedOptions ? a.selectedOptions.join(" ") : "") ?? "").toString();
          return (
            question.question.toLowerCase().includes(q) ||
            volunteerName.toLowerCase().includes(q) ||
            volunteerEmail.toLowerCase().includes(q) ||
            answerText.toLowerCase().includes(q)
          );
        });
        return { ...question, answers: answersFiltered };
      })
      .filter((question) => {
        if (filterHasAnswer === "all") return true;
        if (filterHasAnswer === "answered") return question.answers.length > 0;
        return question.answers.length === 0;
      });
  }, [questions, query, filterHasAnswer]);
  
  // Agregados para preguntas MULTIPLE/CHECKBOX (conteo de opciones)
  const optionCountsByQuestion = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    questions.forEach((q) => {
      if (q.type === "MULTIPLE" || q.type === "CHECKBOX") {
        const counts: Record<string, number> = {};
        q.answers.forEach((a) => {
          const opts = a.selectedOptions ?? [];
          opts.forEach((opt) => {
            counts[opt] = (counts[opt] || 0) + 1;
          });
        });
        map[q.id] = counts;
      }
    });
    return map;
  }, [questions]);
  
  const toggleQuestion = (id: string) => setExpandedQuestions((p) => ({ ...p, [id]: !p[id] }));
  const toggleAnswerExpand = (id: string) => setExpandedAnswerIds((p) => ({ ...p, [id]: !p[id] }));
  
  /** Export CSV / JSON (mismo comportamiento que antes, pero más compacto) */
  const exportCSV = () => {
    const headers = ["questionId", "question", "questionType", "participantId", "volunteerName", "volunteerEmail", "answer", "selectedOptions", "dateAnswer", "numberAnswer", "createdAt", "schedules"];
    const rows: string[] = [headers.join(",")];
    filtered.forEach((q) => {
      if (q.answers.length === 0) {
        const row = [`"${q.id}"`, `"${q.question.replace(/"/g, '""')}"`, `"${q.type}"`, "", "", "", "", "", "", "", "", ""].join(",");
        rows.push(row);
      } else {
        q.answers.forEach((a) => {
          const selected = a.selectedOptions ? a.selectedOptions.join("; ") : "";
          const schedulesStr = a.schedules.map((s) => formatSchedule(s)).join(" | ");
          const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
          const row = [
            escape(q.id),
            escape(q.question),
            escape(q.type),
            escape(a.participantId),
            escape(a.volunteer?.name ?? ""),
            escape(a.volunteer?.email ?? ""),
            escape(a.answer ?? ""),
            escape(selected),
            escape(a.dateAnswer ?? ""),
            escape(a.numberAnswer ?? ""),
            escape(a.createdAt),
            escape(schedulesStr),
          ].join(",");
          rows.push(row);
        });
      }
    });
    const csv = rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `answers_call_${callId}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  
  const exportJSON = () => {
    const payload = { callId, exportedAt: new Date().toISOString(), questions: filtered };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `answers_call_${callId}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  
  const copyJSONtoClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify({ callId, questions: filtered }, null, 2));
      // Si usas un Toast: muestra éxito
    } catch {
      // fallback
    }
  };
  
  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8">
      {/* Header: título + acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Respuestas por pregunta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Convocatoria: <span className="font-medium">{callId}</span> • Participantes: <span className="font-medium">{participantsCount}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full">
              <Input
                placeholder="Buscar por pregunta, voluntario o respuesta..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10"
                aria-label="Buscar respuestas"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search size={16} />
              </div>
            </div>
          </div>
          
          <select
            value={filterHasAnswer}
            onChange={(e) => setFilterHasAnswer(e.target.value as any)}
            className="border rounded px-3 py-2 bg-white text-sm"
            aria-label="Filtrar preguntas"
          >
            <option value="all">Todas</option>
            <option value="answered">Con respuestas</option>
            <option value="no-answers">Sin respuestas</option>
          </select>
          
          <div className="flex gap-2">
            <Button size="sm" onClick={exportCSV} aria-label="Exportar CSV">
              <Download size={14} className="mr-2" /> CSV
            </Button>
            <Button size="sm" onClick={exportJSON} aria-label="Exportar JSON" variant="secondary">
              <FileText size={14} className="mr-2" /> JSON
            </Button>
            <Button size="sm" onClick={copyJSONtoClipboard} aria-label="Copiar JSON">
              <Copy size={14} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Lista de preguntas */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">No se encontraron preguntas con los filtros aplicados.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((q) => {
            const answeredCount = q.answers.length;
            const optionCounts = optionCountsByQuestion[q.id] ?? {};
            const topOptions = Object.entries(optionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
            
            return (
              <Card key={q.id} className="overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium text-sm md:text-base truncate">{q.question}</div>
                        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-xs">Tipo: {q.type}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-xs">Obligatoria: {q.required ? "Sí" : "No"}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-xs">{answeredCount} respuesta{answeredCount !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 md:ml-4">
                        {/* Top option badges (si aplicable) */}
                        {topOptions.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1">
                            {topOptions.map(([opt, count], i) => (
                              <div key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{opt} • {count}</div>
                            ))}
                          </div>
                        )}
                        
                        <Button size="sm" aria-expanded={!!expandedQuestions[q.id]} onClick={() => toggleQuestion(q.id)}>
                          {expandedQuestions[q.id] ? (<><ChevronUp size={14} className="mr-1" /> Ocultar</>) : (<><ChevronDown size={14} className="mr-1" /> Ver respuestas</>)}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {/* contenido expandido */}
                {expandedQuestions[q.id] && (
                  <CardContent>
                    {q.answers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aún no hay respuestas para esta pregunta.</p>
                    ) : (
                      <div className="space-y-3">
                        {q.answers.map((a) => {
                          const isExpanded = !!expandedAnswerIds[a.id];
                          const volunteerName = a.volunteer?.name ?? a.volunteer?.email ?? "Voluntario";
                          const truncated = truncate(a.answer, 240);
                          const displayValue = a.selectedOptions ? a.selectedOptions.join(", ") : a.answer ?? (a.numberAnswer ?? "");
                          
                          return (
                            <div key={a.id} className="border rounded p-3 bg-white shadow-sm">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                  {/* avatar iniciales */}
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium text-sm">
                                    {getInitials(a.volunteer?.name ?? a.volunteer?.email)}
                                  </div>
                                  
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">{volunteerName}</div>
                                    <div className="text-xs text-muted-foreground truncate">{a.volunteer?.email ?? ""} • {formatDateTime(a.createdAt)}</div>
                                    {a.participantStatus && <div className="text-xs text-muted-foreground mt-1">Estado: {a.participantStatus}</div>}
                                  </div>
                                </div>
                                
                                {/* schedules / badges */}
                                <div className="flex-shrink-0 text-right">
                                  {a.schedules.length > 0 && (
                                    <div className="flex flex-wrap justify-end gap-1">
                                      {a.schedules.map((s) => (
                                        <div key={s.id} className="text-xs bg-muted px-2 py-0.5 rounded">{formatSchedule(s)}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* respuesta */}
                              <div className="mt-3">
                                <Label>Respuesta</Label>
                                <div className="mt-1 text-sm text-gray-800">
                                  {displayValue ? (
                                    typeof displayValue === "string" && displayValue.length > 240 ? (
                                      <>
                                        <div>{isExpanded ? displayValue : truncated}</div>
                                        <button
                                          aria-expanded={isExpanded}
                                          onClick={() => toggleAnswerExpand(a.id)}
                                          className="mt-2 text-primary text-sm font-medium"
                                        >
                                          {isExpanded ? "Leer menos" : "Leer más"}
                                        </button>
                                      </>
                                    ) : (
                                      <div>{displayValue}</div>
                                    )
                                  ) : (
                                    <span className="text-muted-foreground">(vacío)</span>
                                  )}
                                </div>
                                
                                {/* fecha/número si aplica */}
                                {a.dateAnswer && <div className="mt-1 text-xs text-muted-foreground">Fecha respuesta: {formatDateTime(a.dateAnswer)}</div>}
                                {a.numberAnswer !== null && a.numberAnswer !== undefined && <div className="mt-1 text-xs text-muted-foreground">Número: {String(a.numberAnswer)}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
