"use server"

import { prisma } from "@/lib/prisma";
import {UserRole, VolunteerStatus, GroupRole, WeekDay} from "@prisma/client";

export interface AddManagerBody {
  name: string
  email: string
  phone: string
  address: string
  dni?: string
  birthday: string
  status?: "Active" | "Inactive" | "Suspended"
  day: WeekDay
}

export const addVolunteerV2 = async (email: string, body: AddManagerBody) => {
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
    const currentVolunteer = await prisma.volunteer.findFirst({
      where: {
        email,
      }
    });
    if (!currentVolunteer) {
      return {
        success: false,
        message: `No existe el voluntario`
      };
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;
    if(isAdmin) {
      const verifyIfAdminBelongsToGroup = await prisma.groupMember.findFirst({
        where: {
          volunteerId: currentVolunteer.id,
          role: GroupRole.LEADER,
        }
      });
      if (!verifyIfAdminBelongsToGroup) {
        // Added, first search which group the admin belongs to as leader
        const adminGroup = await prisma.groupMember.findFirst({
          where: {
            role: GroupRole.LEADER,
            volunteer: {

            }
          }
        });
      }
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
            password: body?.dni || "123123",
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
  } catch (error) {
    console.error("[ERROR_ADD_MANAGER]", error)
    return {
      success: false,
      message: `Error al agregar el voluntario`,
    }
  }
}
