// features/attendance/actions/get-attendances-by-volunteer.ts
"use server"

import { prisma } from "@/lib/prisma"

export const getAttendancesByVolunteer = async (volunteerId: string) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        volunteerId,
        deletedAt: null,
      },
      orderBy: { date: "desc" },
      take: 30,
    })

    return { success: true, data: attendances }
  } catch (error) {
    console.error("[ERROR_GET_ATTENDANCES_BY_VOLUNTEER]", error)
    return { success: false, message: "Error al obtener el historial de asistencia", data: [] }
  }
}
