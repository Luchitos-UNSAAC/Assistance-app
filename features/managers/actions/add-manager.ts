"use server"

import { prisma } from "@/lib/prisma";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";
import { UserRole, VolunteerStatus, GroupRole } from "@prisma/client";
import {getCurrentUser} from "@/lib/get-current-user";

interface AddManagerBody {
  name: string
  email: string
  phone: string
  address: string
  birthday: string
  status?: "Active" | "Inactive" | "Suspended"
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
    
    // Create new group
    const group = await prisma.group.create({
      data: {
        name: `Grupo de ${newVolunteer.name}`,
        createdBy: currentUser.email,
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