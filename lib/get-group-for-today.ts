"use server";
import {prisma} from "@/lib/prisma";
import type {WeekDay} from "@/features/calls/types/form";
import {GroupRole} from "@prisma/client";

const WEEK_DAYS: WeekDay[] = [
  "LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO","DOMINGO"
];

export const getGroupForToday = async () => {
  try {
    const today = new Date();
    const dayOfWeek = WEEK_DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];
    return await prisma.groupMember.findMany({
      where: {
        role: GroupRole.LEADER,
      },
    });
    
  } catch (error) {
    console.error("[ERROR_GET_GROUP_FOR_TODAY]", error);
    return null
  }
}