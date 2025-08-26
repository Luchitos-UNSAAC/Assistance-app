import {prisma} from '@/lib/prisma';

export const getQuestionsByCallId = async (callId: string) => {
  try {
    const call = await prisma.callForVolunteers.findUnique({
      where: {id: callId, status: 'CLOSED'},
    })
    if (!call) {
      console.error('Call not found');
      return [];
    }
    
    const questions = await prisma.callQuestion.findMany({
      where: {callId, },
      orderBy: { createdAt: 'asc'},
    });
    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}