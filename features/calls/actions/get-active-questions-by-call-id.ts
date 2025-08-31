import {prisma} from '@/lib/prisma';

export const getActiveQuestionByCallId = async (callId: string) => {
  try {
    const call = await prisma.callForVolunteers.findUnique({
      where: {id: callId},
    })
    if (!call) {
      console.error('Call not found');
      return [];
    }

    return await prisma.callQuestion.findMany({
      where: {callId,},
      orderBy: {createdAt: 'asc'},
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}