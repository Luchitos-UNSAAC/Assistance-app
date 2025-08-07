"use server"

import { prisma } from "@/lib/prisma";
import {getCurrentVolunteerByUserId} from "@/lib/get-current-volunteer-by-user-id";
import { VolunteerStatus } from "@prisma/client";
import {getCurrentUser} from "@/lib/get-current-user";

export const deleteVolunteerById = async (volunteerId: string) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: `No existe el usuario`
      };
    }
    
    const volunteer = await getCurrentVolunteerByUserId(volunteerId);
    if (!volunteer) {
      return {
        success: false,
        message: `No existe el voluntario`
      };
    }
    
    // Use a transaction to ensure all operations are atomic
    await prisma.$transaction(async (tx) => {
      await tx.volunteer.update({
        where: {
          id: volunteerId,
        },
        data: {
          status: VolunteerStatus.INACTIVE,
          deletedAt: new Date().toISOString(),
          deletedBy: currentUser.email,
        }
      })
      
      // Update the user associated with the volunteer to mark it as deleted
      await tx.user.update({
        where: {
          id: volunteer.user.id,
        },
        data: {
          deletedAt: new Date().toISOString(),
          deletedBy: currentUser.email,
        }
      })
      
      // Delete all attendances related to the volunteer
      await tx.attendance.updateMany({
        where: {
          volunteerId: volunteerId,
        },
        data: {
          deletedAt: new Date().toISOString(),
          deletedBy: currentUser.email,
        }
      })
    })
    
    return {
      success: true,
    }
  } catch (error) {
    console.error("[ERROR_DELETE_VOLUNTEER_BY_ID]", error)
    return {
      success: false,
      message: `Error al eliminar el voluntario`,
    }
  }
}