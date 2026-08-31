// features/attendance/actions/update-attendance.ts
"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-current-user"
import { AttendanceStatus } from "@prisma/client"

interface UpdateAttendanceBody {
  status: "PRESENT" | "ABSENT" | "JUSTIFIED" | "LATE"
  notes?: string
}

export const updateAttendance = async (attendanceId: string, body: UpdateAttendanceBody) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, message: "No existe el usuario" }
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: body.status as AttendanceStatus,
        notes: body.notes?.trim() || null,
        updatedBy: currentUser.email,
      },
    })

    return { success: true, data: updated }
  } catch (error) {
    console.error("[ERROR_UPDATE_ATTENDANCE]", error)
    return { success: false, message: "Error al actualizar la asistencia" }
  }
}
