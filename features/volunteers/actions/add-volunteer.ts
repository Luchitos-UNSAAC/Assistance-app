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
  newVolunteerId?: string
}

export const addVolunteer = async (body: AddManagerBody) => {
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
    
    const newVolunteerId = body.newVolunteerId;
    
    // Si se pasa un ID, se agrega el voluntario existente al grupo
    if (newVolunteerId) {
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
      
      const existingGroupMember = await prisma.groupMember.findFirst({
        where: {
          volunteerId: existingVolunteer.id,
          groupId: currentGroupMemberVolunteer.groupId,
        }
      });
      if (existingGroupMember) {
        return {
          success: false,
          message: `El voluntario ya pertenece al grupo`,
        }
      }
      
      await prisma.groupMember.create({
        data: {
          role: GroupRole.MEMBER,
          volunteerId: existingVolunteer.id,
          groupId: currentGroupMemberVolunteer.groupId,
        }
      });
      return {
        success: true,
      }
      
      // Si no se pasa un ID, se crea un nuevo voluntario
    } else {
      const existingNewVolunteer = await prisma.volunteer.findUnique({
        where: {
          email: body.email,
          deletedBy: null
        }
      })
      if (existingNewVolunteer) {
        return {
          success: false,
          message: `Ya existe un voluntario con este email`,
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
              role: UserRole.VOLUNTEER,
              createdBy: currentUser.email,
            }
          },
          groupMembers: {
            create: {
              role: GroupRole.MEMBER,
              group: {
                connect: {
                  id: currentGroupMemberVolunteer.groupId
                }
              }
            }
          }
        },
      })
      if (!newVolunteer) {
        return {
          success: false,
          message: `Error al agregar el voluntario`,
        }
      }
      
      return {
        success: true,
      }
    }
  } catch (error) {
    console.error("[ERROR_ADD_MANAGER]", error)
    return {
      success: false,
      message: `Error al agregar el voluntario`,
    }
  }
}