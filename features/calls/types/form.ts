// types/forms.ts
export type WeekDay =
  | "LUNES" | "MARTES" | "MIERCOLES"
  | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";

export type ScheduleMode = "WEEKLY" | "ONCE";

export interface ScheduleInput {
  mode: ScheduleMode;           // WEEKLY = recurrente por día de semana, ONCE = una sola fecha
  dayOfWeek?: WeekDay;          // requerido si mode=WEEKLY
  onDate?: string;              // yyyy-mm-dd, requerido si mode=ONCE
  startTime: string;            // HH:mm
  endTime: string;              // HH:mm
}

export interface CallForVolunteersForm {
  title: string;
  description: string;
  location?: string;
  modality: "PRESENTIAL" | "REMOTE" | "HYBRID";
  requirements?: string;
  benefits?: string;
  deadline: string; // yyyy-mm-dd
  status: "OPEN" | "CLOSED" | "DRAFT";
  schedules: ScheduleInput[]; // ⬅️ nuevo
}
