"use server"

import { prisma } from "@/lib/prisma";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";
import { GroupRole } from "@prisma/client";
import {getCurrentUser} from "@/lib/get-current-user";

export const addNewVolunteerToCurrentVolunteerGroup = async (newVolunteerId: string) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: `No existe el usuario`
      };
    }
    const currentVolunteer = await getCurrentVolunteer();
    if (!currentVolunteer) {
      return {
        success: false,
        message: `No existe el voluntario`
      };
    }
    
    const currentGroupMemberVolunteer = await prisma.groupMember.findFirst({
      where: {
        volunteerId: currentVolunteer.id,
        role: GroupRole.LEADER,
      }
    });
    if (!currentGroupMemberVolunteer) {
      return {
        success: false,
        message: `No tienes permisos para agregar voluntarios`,
      }
    }
    
    const existingVolunteer = await prisma.volunteer.findUnique({
      where: {
        id: newVolunteerId,
        deletedBy: null
      }
    });
    if (!existingVolunteer) {
      return {
        success: false,
        message: `No existe el voluntario`,
      }
    }
    
    const newGroupMember = await prisma.groupMember.create({
      data: {
        volunteerId: existingVolunteer.id,
        groupId: currentGroupMemberVolunteer.groupId,
        role: GroupRole.MEMBER,
      }
    })
    if (!newGroupMember) {
      return {
        success: false,
        message: `No se pudo agregar el voluntario`,
      }
    }
    
    return {
      success: true,
      message: `Voluntario agregado correctamente`,
      volunteer: existingVolunteer,
    }
    
  } catch (error) {
    console.error("[ERROR_ADD_MANAGER]", error)
    return {
      success: false,
      message: `Error al agregar el voluntario`,
    }
  }
}