// features/calls/actions/get-answers-by-call-id.ts
import { prisma } from '@/lib/prisma';
export type AnswersByQuestionResult = {
  questions: {
    id: string;
    question: string;
    type: string;
    required: boolean;
    order: number;
    answers: {
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
        birthday?: string | null;
      } | null;
      schedules: {
        id: string;
        dayOfWeek?: string | null;
        startTime?: string | null;
        endTime?: string | null;
        onDate?: string | null;
      }[];
    }[];
  }[];
  participantsCount: number;
};

export const getAnswersByCallId = async (callId: string): Promise<AnswersByQuestionResult> => {
  if (!callId) {
    return { questions: [], participantsCount: 0 };
  }
  
  // Traemos preguntas + respuestas + participante + volunteer + schedules
  const questions = await prisma.callQuestion.findMany({
    where: { callId },
    orderBy: { order: 'asc' },
    include: {
      answers: {
        orderBy: { createdAt: 'asc' },
        include: {
          participant: {
            include: {
              volunteer: true,
              callParticipantSchedules: {
                include: {
                  schedule: true,
                },
              },
            },
          },
        },
      },
    },
  });
  
  // Mapear a formato serializable (fechas -> ISO strings, selectedOptions -> array si es JSON)
  const mapped = questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    required: q.required,
    order: q.order,
    answers: q.answers.map((a) => {
      let selectedOptions: string[] | null = null;
      if (a.selectedOptions) {
        try {
          const parsed = JSON.parse(a.selectedOptions);
          selectedOptions = Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
          // fallback: si no es JSON, intentar separar por coma
          selectedOptions = a.selectedOptions.split(',').map((s) => s.trim());
        }
      }
      
      return {
        id: a.id,
        answer: a.answer ?? null,
        selectedOptions,
        dateAnswer: a.dateAnswer ? a.dateAnswer.toISOString() : null,
        numberAnswer: a.numberAnswer ?? null,
        createdAt: a.createdAt.toISOString(),
        participantId: a.participantId,
        participantStatus: (a.participant as any)?.status ?? null,
        volunteer: a.participant?.volunteer
          ? {
            id: a.participant!.volunteer.id,
            name: a.participant!.volunteer.name,
            email: a.participant!.volunteer.email,
            phone: a.participant!.volunteer.phone ?? null,
            address: a.participant!.volunteer.address ?? null,
            birthday: a.participant!.volunteer.birthday
              ? a.participant!.volunteer.birthday.toISOString()
              : null,
          }
          : null,
        schedules:
          a.participant?.callParticipantSchedules?.map((cps) => {
            const s = cps.schedule!;
            return {
              id: s.id,
              dayOfWeek: s.dayOfWeek ?? null,
              startTime: s.startTime ? s.startTime.toISOString() : null,
              endTime: s.endTime ? s.endTime.toISOString() : null,
              onDate: s.onDate ? s.onDate.toISOString() : null,
            };
          }) ?? [],
      };
    }),
  }));
  
  const participantsCount = await prisma.callParticipant.count({ where: { callId } });
  
  return {
    questions: mapped,
    participantsCount,
  };
};
