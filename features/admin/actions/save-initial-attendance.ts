"use server"

import {prisma} from "@/lib/prisma";
import {AttendanceStatus} from "@prisma/client";

export interface SaveInitialAttendanceBody {
  present: number;
  late: number;
  absent: number;
  startDate: string;
  volunteerId: string;
}

export const saveInitialAttendance = async (body: SaveInitialAttendanceBody) => {
  const {late, absent, startDate, present, volunteerId} = body;
  try {
    const existsAttendanceOnDay = await prisma.attendance.findFirst({
      where: {
        date: new Date(startDate),
      }
    })
    if (existsAttendanceOnDay) {
      return {
        error: 'Ya existe asistencias desde esta fecha'
      }
    }

    const baseDate = new Date(startDate)
    baseDate.setHours(0, 0, 0, 0)

    const attendancePlan: AttendanceStatus[] = [
      ...Array(present).fill(AttendanceStatus.PRESENT),
      ...Array(late).fill(AttendanceStatus.LATE),
      ...Array(absent).fill(AttendanceStatus.ABSENT),
    ]

    const manyAttendances = attendancePlan.map((status, index) => {
      const date = new Date(baseDate)
      date.setDate(baseDate.getDate() + index)

      return {
        date,
        status,
        source: "initial_attendances",
        volunteerId,
      }
    })

    await prisma.$transaction(async (tx) => {
      await tx.attendance.createMany({
        data: manyAttendances,
      })
    })

    return {
      success: true,
    }
  } catch (e) {
    console.log("[ERROR_SAVE_INITIAL_ATTENDANCE]", e)
    return {
      error: "Algo ha sucedido"
    }
  }
}
