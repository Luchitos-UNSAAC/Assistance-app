"use server"

import {prisma} from "@/lib/prisma";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";
import {AttendanceStatus} from "@prisma/client";
import {getCurrentUser} from "@/lib/get-current-user";
import {StatusAttendance} from "@/lib/store";

interface EditAttendanceBody {
  date: string;
  status: "Present" | "Absent" | "Justified" | "Late";
}

export const markAttendanceOfVolunteerByEmail = async (volunteerId: string, email: string, body: EditAttendanceBody) => {
  try {
    const currentUser = await prisma.user.findFirst({
      where: {
        email,
      }
    });
    if (!currentUser) {
      return {
        success: false,
        message: `No existe el usuario`
      };
    }
    const volunteer = await prisma.volunteer.findFirst({
      where: {
        id: volunteerId,
      }
    });
    if (!volunteer) {
      return {
        success: false,
        message: `No existe el voluntario`
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

    const date = new Date(body.date);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendanceOfToday = await prisma.attendance.findFirst({
      where: {
        volunteerId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingAttendanceOfToday) {
      return {
        success: false,
        message: `Ya existe una asistencia del dia de hoy`,
      };
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        date,
        status: mapAttendanceStatus(body.status),
        volunteerId: volunteerId,
        notes: 'DAY_FREE',
        source: 'DAY_FREE'
      }
    })
    if (!newAttendance) {
      return {
        success: false,
        message: "Error al crear asistencia el dia de hoy"
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
