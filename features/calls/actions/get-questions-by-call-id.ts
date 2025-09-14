import {prisma} from '@/lib/prisma';

export const getQuestionsByCallId = async (callId: string) => {
  try {
    const call = await prisma.callForVolunteers.findUnique({
      where: {id: callId},
    })
    if (!call) {
      console.error('Call not found');
      return {questions: [], call: null};
    }
    
    const questions = await prisma.callQuestion.findMany({
      where: {callId},
      orderBy: { createdAt: 'asc'},
    });
    return {
      questions,
      call
    };
  } catch (error) {
    console.error('[ERROR_GET_QUESTIONS_BY_CALL_ID]', error);
    return {questions: [], call: null};
  }
}