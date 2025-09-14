"use client";

import { useState, useEffect } from "react";
import type { CallForVolunteersForm, ScheduleInput, WeekDay } from "@/features/calls/types/form";
import { Button } from "@/components/ui/button";
import { CallWithSchedules } from "@/features/calls/actions/get-call-by-id";
import {useRouter} from "next/navigation";
import {ArrowLeft} from "lucide-react";

const WEEK_DAYS: WeekDay[] = [
  "LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO","DOMINGO"
];

function classInput(base = "") {
  return `w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${base}`;
}

function timeIsValid(start: string, end: string) {
  const toM = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  return toM(start) < toM(end);
}

interface Props {
  call: CallWithSchedules;
}

export default function CallForVolunteersEditPage({ call }: Props) {
  const [form, setForm] = useState<CallForVolunteersForm | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const router = useRouter()
  
  // Inicializa form con datos de la convocatoria recibida
  useEffect(() => {
    if (call) {
      const deadline = call.deadline.toISOString().split("T")[0];
      setForm({
        title: call.title,
        description: call.description,
        location: call.location ?? "",
        modality: call.modality,
        requirements: call.requirements ?? "",
        benefits: call.benefits ?? "",
        deadline: deadline,
        status: call.status,
        schedules: call.callSchedules.map((s) => ({
          mode: s.dayOfWeek ? "WEEKLY" : "ONCE",
          dayOfWeek: s.dayOfWeek ?? undefined,
          onDate: s.onDate ? new Date(s.onDate).toISOString().split("T")[0] : undefined,
          startTime: s.startTime ? new Date(s.startTime).toISOString().slice(11, 16) : "09:00",
          endTime: s.endTime ? new Date(s.endTime).toISOString().slice(11, 16) : "12:00",
        })),
      });
    }
  }, [call]);
  
  const handleChangeField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm((prev) => prev ? { ...prev, [name]: value } : prev);
  };
  
  const addSchedule = () => {
    if (!form) return;
    setForm((prev) => ({
      ...prev!,
      schedules: [...prev!.schedules, { mode: "WEEKLY", dayOfWeek: "LUNES", startTime: "09:00", endTime: "12:00" }],
    }));
  };
  
  const removeSchedule = (idx: number) => {
    if (!form) return;
    setForm((prev) => ({
      ...prev!,
      schedules: prev!.schedules.filter((_, i) => i !== idx),
    }));
  };
  
  const updateSchedule = (idx: number, patch: Partial<ScheduleInput>) => {
    if (!form) return;
    setForm((prev) => {
      const copy = [...prev!.schedules];
      copy[idx] = { ...copy[idx], ...patch };
      if (patch.mode === "WEEKLY") {
        copy[idx].onDate = undefined;
        if (!copy[idx].dayOfWeek) copy[idx].dayOfWeek = "LUNES";
      }
      if (patch.mode === "ONCE") {
        copy[idx].dayOfWeek = undefined;
        if (!copy[idx].onDate) copy[idx].onDate = "";
      }
      return { ...prev!, schedules: copy };
    });
  };
  
  const validateClient = (): string | null => {
    if (!form) return "Formulario inválido";
    if (!form.title.trim()) return "El título es obligatorio.";
    if (!form.description.trim()) return "La descripción es obligatoria.";
    if (!form.deadline) return "La fecha límite es obligatoria.";
    if (!form.schedules.length) return "Agrega al menos un horario.";
    
    for (let i = 0; i < form.schedules.length; i++) {
      const s = form.schedules[i];
      if (!s.startTime || !s.endTime) return `Horario #${i + 1}: completa las horas.`;
      if (!timeIsValid(s.startTime, s.endTime)) return `Horario #${i + 1}: la hora de inicio debe ser menor que la de fin.`;
      if (s.mode === "WEEKLY" && !s.dayOfWeek) return `Horario #${i + 1}: selecciona un día de semana.`;
      if (s.mode === "ONCE" && !s.onDate) return `Horario #${i + 1}: selecciona la fecha.`;
    }
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    
    setErrors(null);
    const err = validateClient();
    if (err) {
      setErrors(err);
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/calls/${call.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Error al actualizar la convocatoria");
      }
      router.push("/calls")
    } catch (e: any) {
      setErrors(e.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!form) return <p className="text-center py-10">Cargando...</p>;
  
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Editar Convocatoria
        </h2>
        <Button onClick={()=> router.push("/calls")}
                variant='outline'
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Convocatorias
        </Button>
      </div>
      
      {errors && (
        <div className="mb-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700">
          {errors}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos principales */}
        <label className="block">
          <span className="text-gray-700">Título</span>
          <input type="text" name="title" value={form.title} onChange={handleChangeField} className={classInput()} />
        </label>
        
        <label className="block">
          <span className="text-gray-700">Descripción</span>
          <textarea name="description" value={form.description} onChange={handleChangeField} className={classInput("min-h-28")} />
        </label>
        
        <label className="block">
          <span className="text-gray-700">Ubicación</span>
          <input type="text" name="location" value={form.location} onChange={handleChangeField} className={classInput()} />
        </label>
        
        <label className="block">
          <span className="text-gray-700">Modalidad</span>
          <select name="modality" value={form.modality} onChange={handleChangeField} className={classInput()}>
            <option value="PRESENTIAL">Presencial</option>
            <option value="REMOTE">Remoto</option>
            <option value="HYBRID">Híbrido</option>
          </select>
        </label>
        
        <label className="block">
          <span className="text-gray-700">Requisitos</span>
          <textarea name="requirements" value={form.requirements} onChange={handleChangeField} className={classInput()} />
        </label>
        
        <label className="block">
          <span className="text-gray-700">Beneficios</span>
          <textarea name="benefits" value={form.benefits} onChange={handleChangeField} className={classInput()} />
        </label>
        
        <label className="block">
          <span className="text-gray-700">Fecha límite</span>
          <input type="date" name="deadline" value={form.deadline} onChange={handleChangeField} className={classInput()} />
        </label>
        
        {/* Horarios */}
        <fieldset className="border rounded-xl p-4">
          <legend className="px-2 text-gray-800 font-semibold">Horarios disponibles</legend>
          <div className="space-y-4">
            {form.schedules.map((s, i) => (
              <div key={i} className="rounded-xl border p-3 bg-gray-50">
                <div className="flex items-center gap-4 mb-3">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name={`mode-${i}`} checked={s.mode === "WEEKLY"} onChange={() => updateSchedule(i, { mode: "WEEKLY" })} />
                    <span>Semanal</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name={`mode-${i}`} checked={s.mode === "ONCE"} onChange={() => updateSchedule(i, { mode: "ONCE" })} />
                    <span>En una fecha</span>
                  </label>
                  <button type="button" onClick={() => removeSchedule(i)} className="ml-auto text-sm px-3 py-1 rounded-lg border text-gray-600 hover:bg-gray-100">Eliminar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {s.mode === "WEEKLY" ? (
                    <label className="block">
                      <span className="text-gray-700">Día</span>
                      <select value={s.dayOfWeek} onChange={(e) => updateSchedule(i, { dayOfWeek: e.target.value as WeekDay })} className={classInput()}>
                        {WEEK_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </label>
                  ) : (
                    <label className="block">
                      <span className="text-gray-700">Fecha</span>
                      <input type="date" value={s.onDate || ""} onChange={(e) => updateSchedule(i, { onDate: e.target.value })} className={classInput()} />
                    </label>
                  )}
                  <label className="block">
                    <span className="text-gray-700">Desde</span>
                    <input type="time" value={s.startTime} onChange={(e) => updateSchedule(i, { startTime: e.target.value })} className={classInput()} />
                  </label>
                  <label className="block">
                    <span className="text-gray-700">Hasta</span>
                    <input type="time" value={s.endTime} onChange={(e) => updateSchedule(i, { endTime: e.target.value })} className={classInput()} />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" onClick={addSchedule} className="w-full md:w-auto bg-white border text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
              + Agregar horario
            </button>
          </div>
        </fieldset>
        
        <label className="block">
          <span className="text-gray-700">Estado</span>
          <select name="status" value={form.status} onChange={handleChangeField} className={classInput()}>
            <option value="OPEN">Abierta</option>
            <option value="CLOSED">Cerrada</option>
            <option value="DRAFT">Borrador</option>
          </select>
        </label>
        
        <Button type="submit" disabled={submitting}
                className='w-full'
                variant='outline'
        >
          {submitting ? "Guardando..." : "Actualizar Convocatoria"}
        </Button>
      </form>
    </div>
  );
}
