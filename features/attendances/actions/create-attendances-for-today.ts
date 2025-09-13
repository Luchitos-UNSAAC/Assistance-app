"use server";

import { prisma } from "@/lib/prisma";
import { getGroupOfCurrentVolunteer } from "@/lib/get-group-of-current-volunteer";
import { getCurrentVolunteer } from "@/lib/get-current-volunteer";
import { AttendanceStatus, VolunteerStatus } from "@prisma/client";

export async function createAttendancesForToday() {
  try {
    const currentVolunteer = await getCurrentVolunteer();
    if (!currentVolunteer) {
      return { success: false, message: "No se encontró el voluntario actual." };
    }
    
    const currentGroup = await getGroupOfCurrentVolunteer(currentVolunteer.id);
    if (!currentGroup) {
      return { success: false, message: "No se encontró el grupo del voluntario actual." };
    }
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Todos los voluntarios activos del grupo
    const volunteers = await prisma.volunteer.findMany({
      where: {
        deletedAt: null,
        status: VolunteerStatus.ACTIVE,
        groupMembers: {
          some: {
            groupId: currentGroup.id,
            deletedAt: null,
          },
        },
      },
      select: { id: true },
    });
    
    if (volunteers.length === 0) {
      return { success: false, message: "No hay voluntarios activos en este grupo." };
    }
    
    // Filtramos los que ya tienen asistencia hoy
    const existingAttendances = await prisma.attendance.findMany({
      where: {
        deletedAt: null,
        volunteerId: { in: volunteers.map((v) => v.id) },
        date: { gte: startOfDay, lte: endOfDay },
      },
      select: { volunteerId: true },
    });
    
    const attendedIds = new Set(existingAttendances.map((a) => a.volunteerId));
    const volunteersWithoutAttendance = volunteers.filter((v) => !attendedIds.has(v.id));
    
    if (volunteersWithoutAttendance.length > 0) {
      await prisma.attendance.createMany({
        data: volunteersWithoutAttendance.map((v) => ({
          volunteerId: v.id,
          date: new Date(),
          status: AttendanceStatus.ABSENT,
        })),
      });
    }
    
    return {
      success: true,
      message: `${volunteersWithoutAttendance.length} asistencias creadas.`,
    };
  } catch (error) {
    console.error("[ERROR_CREATE_ATTENDANCES_TODAY]", error);
    return { success: false, message: "Error al crear asistencias." };
  }
}
