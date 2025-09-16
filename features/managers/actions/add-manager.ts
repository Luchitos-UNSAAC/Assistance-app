"use server"

import { prisma } from "@/lib/prisma";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";
import { UserRole, VolunteerStatus, GroupRole, WeekDay } from "@prisma/client";
import {getCurrentUser} from "@/lib/get-current-user";

interface AddManagerBody {
  name: string
  email: string
  phone: string
  dni: string
  address: string
  birthday: string
  status?: "Active" | "Inactive" | "Suspended"
  dayOfWeek?: any
}

const dayOfWeekMapper = (day: string) => {
  switch (day) {
    case "LUNES":
      return WeekDay.LUNES;
    case "MARTES":
      return WeekDay.MARTES;
    case "MIERCOLES":
      return WeekDay.MIERCOLES;
    case "JUEVES":
      return WeekDay.JUEVES;
    case "VIERNES":
      return WeekDay.VIERNES;
    case "SABADO":
      return WeekDay.SABADO;
    case "DOMINGO":
      return WeekDay.DOMINGO;
    default:
      return WeekDay.LUNES;
  }
}

export const addManager = async (body: AddManagerBody) => {
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
        message: `No existe el encargado`
      };
    }
    
    const existingVolunteer = await prisma.volunteer.findUnique({
      where: {
        email: body.email,
      },
    })
    if (existingVolunteer) {
      return {
        success: false,
        message: `Ya existe un encargado con este email`,
      }
    }
    
    const statusFormatted = body.status === "Active" ? VolunteerStatus.ACTIVE : VolunteerStatus.INACTIVE;
    
    const newVolunteer = await prisma.volunteer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        birthday: new Date(body.birthday),
        status: statusFormatted,
        createdBy: currentUser.email,
        user: {
          create: {
            email: body.email,
            name: body.name,
            password: "123123",
            dni: body.dni,
            role: UserRole.MANAGER,
            createdBy: currentUser.email,
          }
        }
      },
    })
    if (!newVolunteer) {
      return {
        success: false,
        message: `Error al agregar el encargado`,
      }
    }
    
    const dayOfWeekMapped = dayOfWeekMapper(body.dayOfWeek);
    // Verify existing group for the day
    const existingGroup = await prisma.group.findFirst({
      where: {
        dayOfWeek: dayOfWeekMapped,
      }
    })
    if (existingGroup) {
      const newMemberGroup = await prisma.groupMember.create({
        data: {
          volunteerId: newVolunteer.id,
          role: GroupRole.LEADER,
          groupId: existingGroup.id,
        }
      })
      
      if (!newMemberGroup) {
        return {
          success: false,
          message: `Error al agregar el encargado al grupo existente`,
        }
      }
      
      return {
        success: true,
      }
    }
    
    const group = await prisma.group.create({
      data: {
        name: `Grupo de ` + dayOfWeekMapped,
        createdBy: currentUser.email,
        dayOfWeek: dayOfWeekMapped,
        members: {
          create: {
            volunteerId: newVolunteer.id,
            role: GroupRole.LEADER
          }
        }
      }
    })
    
    if (!group) {
      return {
        success: false,
        message: `Error al crear el grupo del encargado`,
      }
    }
    
    return {
      success: true,
    }
  } catch (error) {
    console.error("[ERROR_ADD_MANAGER]", error)
    return {
      success: false,
      message: `Error al agregar el encargado`,
    }
  }
}