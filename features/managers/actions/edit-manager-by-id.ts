"use server"

import { prisma } from "@/lib/prisma";
import { VolunteerStatus } from "@prisma/client";
import {getCurrentVolunteerByUserId} from "@/lib/get-current-volunteer-by-user-id";
import {getCurrentUser} from "@/lib/get-current-user";

interface EditManagerBody {
  name: string
  email: string
  phone: string
  address: string
  birthday: string
  status?: "Active" | "Inactive" | "Suspended"
}

export const editManagerById = async (managerId: string, body: EditManagerBody) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: `No existe el usuario`
      };
    }
    const volunteer = await getCurrentVolunteerByUserId(managerId);
    if (!volunteer) {
      return {
        success: false,
        message: `No existe el voluntario`
      };
    }
    const statusFormatted = body.status === "Active" ? VolunteerStatus.ACTIVE : VolunteerStatus.INACTIVE;
    
    const response = await prisma.volunteer.update({
      where: {
        id: volunteer.id,
      },
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        birthday: new Date(body.birthday),
        status: statusFormatted,
        updatedBy: currentUser.email,
        user: {
          update: {
            name: body.name,
            updatedBy: currentUser.email,
          },
        }
      },
    })
    if (!response) {
      return {
        success: false,
        message: `Error al actualizar el voluntario`,
      }
    }
    
    return {
      success: true,
    }
  } catch (error) {
    console.error("[ERROR_DELETE_MANAGE_BY_ID]", error)
    return {
      success: false,
      message: `Error al eliminar el voluntario`,
    }
  }
}