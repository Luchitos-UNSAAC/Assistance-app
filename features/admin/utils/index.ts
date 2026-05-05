import {VolunteerWithAttendancesByStatus} from "@/features/admin/actions/get-volunteers-with-attendances-for-admin";
import {format} from "date-fns";

export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'JUSTIFIED', 'LATE'] as const;
export const WEEK_DAYS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO_MANIANA', 'SABADO_TARDE', 'DOMINGO'] as const;

export const WEEK_DAY_LABELS: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves',
  VIERNES: 'Viernes', SABADO_MANIANA: 'Sábado Mañana', SABADO_TARDE: 'Sábado Tarde', DOMINGO: 'Domingo',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin', MANAGER: 'Encargado', VOLUNTEER: 'Voluntario',
};

// Formateadores puros
export const formatRoleLabel = (role?: string) => (role ? ROLE_LABELS[role] : 'Voluntario');
export const formatDate = (date?: Date | string | null) => (date ? format(new Date(date), "yyyy-MM-dd") : '-');
export const getVolunteerSchedule = (row: VolunteerWithAttendancesByStatus) =>
  row.groupMembers?.map(m => m.group?.dayOfWeek).filter(Boolean).join(', ') || 'Sin horario';
