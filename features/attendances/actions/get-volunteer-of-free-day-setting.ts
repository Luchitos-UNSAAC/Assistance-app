"use server"

import { prisma } from "@/lib/prisma";
import {VolunteerStatus} from "@prisma/client";

const FREE_DAY_KEY = 'DIA_LIBRE';

export const getVolunteerOfFreeDaySetting = async (excludedIds: string[]) => {
  try {
    const freeDay = await prisma.setting.findFirst({
      where: {
        key: FREE_DAY_KEY,
      }
    })
    if (freeDay === null || freeDay === undefined) {
      return [];
    }

    console.log("[freeDay]", freeDay.value)

    const freeDayBoolean = freeDay.value === 'true';
    if (!freeDayBoolean) {
      return [];
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)

    const volunteers = await prisma.volunteer.findMany({
      where: {
        deletedAt: null,
        status: VolunteerStatus.ACTIVE,
        user: {
          role: {
            not: 'ADMIN'
          }
        },
        id: {
          notIn: excludedIds,
        },
        attendances: {
          none: {
            date: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        },
      },
    })
    if (!volunteers) {
      return []
    }

    return volunteers;
  } catch (e) {
    console.error("[ERROR_GET_FREE_DAY_SETTING]", e)
    return [];
  }
}
