"use server"

import { prisma } from "@/lib/prisma";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";
import {AttendanceStatus} from "@prisma/client";
import {getCurrentUser} from "@/lib/get-current-user";
import {StatusAttendance} from "@/lib/store";

interface EditAttendanceBody {
  volunteerId: string;
  date: string;
  status: "Present" | "Absent" | "Justified" | "Late";
}

export const editAttendanceById = async (attendanceId: string, body: EditAttendanceBody) => {
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
    
    const mapAttendanceStatus = (status: StatusAttendance) => {
      switch (status) {
        case "Present":
          return AttendanceStatus.PRESENT;
        case "Absent":
          return AttendanceStatus.ABSENT;
        case "Justified":
          return AttendanceStatus.JUSTIFIED;
        case "Late":
          return AttendanceStatus.LATE;
      }
    }
    
    const statusFormatted = mapAttendanceStatus(body.status);
    
    const response = await prisma.attendance.update({
      where: {
        id: attendanceId,
      },
      data: {
        date: new Date(body.date),
        status: statusFormatted,
        volunteerId: body.volunteerId,
        createdBy: currentUser.email,
      }
    })
    if (!response) {
      return {
        success: false,
        message: `Error al actualizar la asistencia`,
      }
    }
    
    return {
      success: true,
    }
  } catch (error) {
    console.error("[ERROR_UPDATE_ATTENDANCE]", error)
    return {
      success: false,
      message: `Error al actualizar la asistencia`,
    }
  }
}