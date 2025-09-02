import { prisma } from "@/lib/prisma";

const weekOrder = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
  DOMINGO: 7,
};

export type ScheduleWithParticipants = {
  id: string;
  dayOfWeek?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  onDate?: string | null;
  participants: {
    participantId: string;
    participantStatus?: string | null;
    volunteer?: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      dni?: string | null;
    } | null;
    answersSummary: { questionId: string; questionText?: string; answer?: string | null; selectedOptions?: string[] | null }[];
    createdAt: string;
  }[];
};

export const getSchedulesByCallId = async (callId: string): Promise<ScheduleWithParticipants[]> => {
  if (!callId) return [];
  
  // traer schedules + relaciones a CallParticipantSchedule -> participant -> volunteer -> answers
  const schedules = await prisma.callSchedule.findMany({
    where: { callId },
    orderBy: { startTime: "asc",  },
    include: {
      callParticipantSchedules: {
        include: {
          participant: {
            include: {
              volunteer: true,
              callAnswers: {
                include: {
                  question: true,
                },
              },
            },
          },
        },
      },
    },
  });
  
  schedules.sort((a, b) => {
    // si ambos tienen fecha, comparar por fecha
    if (a.onDate && b.onDate) return new Date(a.onDate).getTime() - new Date(b.onDate).getTime();
    
    // si uno tiene fecha y otro no, darle prioridad a los que tienen fecha
    if (a.onDate && !b.onDate) return -1;
    if (!a.onDate && b.onDate) return 1;
    
    // si ninguno tiene fecha, ordenar por día de semana
    if (a.dayOfWeek && b.dayOfWeek) {
      return weekOrder[a.dayOfWeek as keyof typeof weekOrder] -
        weekOrder[b.dayOfWeek as keyof typeof weekOrder];
    }
    
    return 0;
  });
  
  // mapear y serializar
  return schedules.map((s) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek ?? null,
    startTime: s.startTime ? s.startTime.toISOString() : null,
    endTime: s.endTime ? s.endTime.toISOString() : null,
    onDate: s.onDate ? s.onDate.toISOString() : null,
    participants: s.callParticipantSchedules.map((cps) => {
      const p = cps.participant!;
      const volunteer = p.volunteer
        ? {
          id: p.volunteer.id,
          name: p.volunteer.name,
          email: p.volunteer.email,
          phone: p.volunteer.phone ?? null,
          dni: (p.volunteer as any).dni ?? null,
        }
        : null;
      
      const answersSummary = (p.callAnswers ?? []).map((a) => ({
        questionId: a.questionId,
        questionText: a.question?.question ?? undefined,
        answer: a.answer ?? null,
        selectedOptions: a.selectedOptions ? tryParseSelectedOptions(a.selectedOptions) : null,
      }));
      
      return {
        participantId: p.id,
        participantStatus: p.status ?? null,
        volunteer,
        answersSummary,
        createdAt: p.createdAt.toISOString(),
      };
    }),
  }));
};

function tryParseSelectedOptions(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return raw.split(",").map((s) => s.trim());
  }
}
