import {prisma} from '@/lib/prisma';
import {CallSchedule, CallQuestion} from "@prisma/client";

export type CallQuestionWithSchedule = {
  schedules: CallSchedule[],
  questions: CallQuestion[],
}

export const getActiveQuestionByCallId = async (callId: string): Promise<CallQuestionWithSchedule> => {
  try {
    const call = await prisma.callForVolunteers.findUnique({
      where: {id: callId},
      include: {
        callSchedules: true,
      }
    })
    if (!call) {
      console.error('[ERROR_GET_ACTIVE_QUESTIONS_BY_CALL_ID]', {callId});
      return {
        schedules: [],
        questions: []
      }
    }

    return {
      schedules: call.callSchedules,
      questions: await prisma.callQuestion.findMany({
        where: {
          callId: call.id,
        },
        orderBy: {
          order: 'asc'
        },
      })
    }
      
  } catch (error) {
    console.error("[ERROR_GET_ACTIVE_QUESTIONS_BY_CALL_ID", {callId, error});
    return {
      schedules: [],
      questions: []
    }
  }
}