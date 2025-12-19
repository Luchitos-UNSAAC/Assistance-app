"use server"

import { prisma } from "@/lib/prisma"
import { Attendance, Volunteer } from "@prisma/client"
import { AttendanceStatus } from "@prisma/client"

export type VolunteerWithAttendancesAndScore = {
  volunteer: Volunteer & {
    attendances: Attendance[]
  }
  scoreAttendances: {
    PRESENT: number
    ABSENT: number
    LATE: number
  }
}

export const getVolunteersWithAttendancesForAdmin = async (
  volunteerId: string
): Promise<VolunteerWithAttendancesAndScore | null> => {
  try {
    const volunteer = await prisma.volunteer.findFirst({
      where: {
        id: volunteerId,
        user: {
          role: {
            not: "ADMIN",
          },
        },
      },
      include: {
        attendances: {
          orderBy: {
            date: 'desc'
          }
        }
      },
    })

    if (!volunteer) return null

    // 🧮 Calcular score por estado
    const scoreAttendances: Record<AttendanceStatus, number> =
      volunteer.attendances.reduce(
        (acc, attendance) => {
          acc[attendance.status]++
          return acc
        },
        {
          PRESENT: 0,
          ABSENT: 0,
          LATE: 0,
        } as Record<AttendanceStatus, number>
      )

    const result: VolunteerWithAttendancesAndScore = {
      volunteer,
      scoreAttendances,
    }

    return result
  } catch (error) {
    console.error(
      "[ERROR_GET_VOLUNTEER_WITH_ATTENDANCES_FOR_ADMIN]",
      error
    )
    return null
  }
}
