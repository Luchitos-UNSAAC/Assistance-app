// features/attendance/actions/add-attendance.ts
"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-current-user"
import { AttendanceStatus } from "@prisma/client"

interface AddAttendanceBody {
  volunteerId: string
  date: string // formato "YYYY-MM-DD"
  status: "PRESENT" | "ABSENT" | "JUSTIFIED" | "LATE"
  notes?: string
}

const normalizeDate = (date: string) => new Date(`${date}T00:00:00.000Z`)

export const addAttendance = async (body: AddAttendanceBody) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, message: "No existe el usuario" }
    }

    const normalizedDate = normalizeDate(body.date)

    const existing = await prisma.attendance.findUnique({
      where: {
        volunteerId_date: {
          volunteerId: body.volunteerId,
          date: normalizedDate,
        },
      },
    })

    if (existing) {
      return {
        success: false,
        code: "DUPLICATE" as const,
        message: "Ya existe un registro de asistencia para esta fecha",
        data: existing,
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        volunteerId: body.volunteerId,
        date: normalizedDate,
        status: body.status as AttendanceStatus,
        notes: body.notes?.trim() || null,
        source: "MANUAL",
        createdBy: currentUser.email,
      },
    })

    return { success: true, data: attendance }
  } catch (error) {
    console.error("[ERROR_ADD_ATTENDANCE]", error)
    return { success: false, message: "Error al registrar la asistencia" }
  }
}
