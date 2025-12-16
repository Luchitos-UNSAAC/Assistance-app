"use server"

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { UserRole, GroupRole } from "@prisma/client";

interface UpdateVolunteerToManagerByIdAndDayProps {
  volunteerId: string
  day: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO_MANIANA" | "SABADO_TARDE" | "DOMINGO"
}

export const updateVolunteerToManagerByIdAndDay = async (body: UpdateVolunteerToManagerByIdAndDayProps) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: `No existe el usuario`
      };
    }

    const { volunteerId, day } = body;

    const volunteer = await prisma.volunteer.findUnique({
      where: {
        id: volunteerId
      },
    })
    if (!volunteer) {
      return {
        success: false,
        message: `No existe el voluntario`
      };
    }

    const groupByDay = await prisma.group.findFirst({
      where: {
        dayOfWeek: day,
        deletedAt: null,
      }
    })
    if (!groupByDay) {
      return {
        success: false,
        message: `No existe un grupo para el día ${day}`
      };
    }

    const existingGroupMember = await prisma.groupMember.findFirst({
      where: {
        volunteerId: volunteer.id,
        groupId: groupByDay.id
      },
      include: {
        volunteer: true
      }
    })
    if (existingGroupMember) {
      await prisma.groupMember.update({
        where: {
          id: existingGroupMember.id
        },
        data: {
          role: GroupRole.LEADER
        },
      })
      await prisma.user.update({
        where: {
          volunteerId: volunteer.id
        },
        data: {
          role: UserRole.MANAGER
        }
      })
      return {
        success: true,
        message: `El voluntario ya es encargado del día ${day}`
      };
    }

    const newGroupMember = await prisma.groupMember.create({
      data: {
        groupId: groupByDay.id,
        volunteerId: volunteer.id,
        role: GroupRole.LEADER,
      }
    })
    if (!newGroupMember) {
      return {
        success: false,
        message: `Error al asignar el voluntario como encargado del día ${day}`
      }
    }

    await prisma.user.update({
      where: {
        volunteerId: volunteer.id
      },
      data: {
        role: UserRole.MANAGER
      }
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("[ERROR_UPDATE_VOLUNTEER_TO_MANAGER]", error)
    return {
      success: false,
      message: `Error al asignar el voluntario como encargado: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
