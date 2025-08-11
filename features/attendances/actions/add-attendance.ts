"use server"

import { prisma } from "@/lib/prisma";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";
import {AttendanceStatus} from "@prisma/client";
import {getCurrentUser} from "@/lib/get-current-user";
import {StatusAttendance} from "@/lib/store";

interface AddAttendanceBody {
  volunteerId: string;
  date: string;
  status: "Present" | "Absent" | "Justified" | "Late";
}

export const addAttendance = async (body: AddAttendanceBody) => {
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
    
    const response = await prisma.attendance.create({
      data: {
        date: new Date(),
        status: statusFormatted,
        volunteerId: body.volunteerId,
        createdBy: currentUser.email,
      }
    })
    if (!response) {
      return {
        success: false,
        message: `Error al agregar el asistencia`,
      }
    }
    
    return {
      success: true,
    }
  } catch (error) {
    console.error("[ERROR_ADD_ATTENDANCE]", error)
    return {
      success: false,
      message: `Error al agregar el asistencia`,
    }
  }
}