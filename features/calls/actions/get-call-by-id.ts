import { prisma } from "@/lib/prisma";
import {CallForVolunteers, CallSchedule} from "@prisma/client";

export type CallWithSchedules = CallForVolunteers & {
  callSchedules: CallSchedule[];
}

export const getCallById = async (id: string): Promise<CallWithSchedules | null> => {
  try {
    const call = await prisma.callForVolunteers.findUnique({
      where: {
        id: id
      },
      include: {
        callSchedules: true
      }
    });
    if (!call) return null
    
    return call
  } catch (error) {
    console.error("[ERROR_GET_CALL_BY_ID]", error)
   return null
  }
};
