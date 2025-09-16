import {prisma} from "@/lib/prisma";
import {getCurrentUser} from "@/lib/get-current-user";
import { CallStatus } from "@prisma/client";

export const getCurrentCall = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return null;
    }
    
    const calls = await prisma.callForVolunteers.findMany({
      where: {
        status: CallStatus.OPEN
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    });
    if (calls.length === 0) {
      return null;
    }
    return calls[0];
    
  } catch (error) {
    console.error("[ERROR_GET_CURRENT_CALL", error);
    return null;
  }
}