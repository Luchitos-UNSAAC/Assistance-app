"use server"

import { prisma } from "@/lib/prisma";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";
import {getCurrentUser} from "@/lib/get-current-user";

export const deleteAttendanceById = async (attendanceId: string) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: `No existe el usuario`
      };
    }
    const volunteer = await getCurrentVolunteer();
    if (!volunteer) {
      return {
        success: false,
        message: `No existe el voluntario`
      };
    }
    
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    })
    if (!existingAttendance) {
      return {
        success: false,
        message: `No existe la asistencia con el ID proporcionado`
      };
    }
    
    const response = await prisma.attendance.update({
      where: {
        id: attendanceId,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.email,
      }
    })
    if (!response) {
      return {
        success: false,
        message: `Error al eliminar la asistencia`,
      }
    }
    
    return {
      success: true,
    }
  } catch (error) {
    console.error("[ERROR_UPDATE_ATTENDANCE]", error)
    return {
      success: false,
      message: `Error al eliminar la asistencia`,
    }
  }
}