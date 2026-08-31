"use server"

import { prisma } from "@/lib/prisma";
import { getCurrentVolunteer } from "@/lib/get-current-volunteer";
import { UserRole, VolunteerStatus, GroupRole, WeekDay } from "@prisma/client";
import { getCurrentUser } from "@/lib/get-current-user";

interface AddVolunteerWithGroupBody {
  name: string
  email: string
  phone: string
  dni: string
  address: string
  birthday: string
  status?: "Active" | "Inactive" | "Suspended"
  dayOfWeek: WeekDay
  groupRole: GroupRole
}

export const addVolunteerWithGroup = async (body: AddVolunteerWithGroupBody) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "No existe el usuario" };
    }

    const requester = await getCurrentVolunteer();
    if (!requester) {
      return { success: false, message: "No existe el encargado" };
    }

    const existingVolunteer = await prisma.volunteer.findUnique({
      where: { email: body.email },
    });
    if (existingVolunteer) {
      return { success: false, message: "Ya existe un voluntario con este email" };
    }

    const statusFormatted =
      body.status === "Active"
        ? VolunteerStatus.ACTIVE
        : body.status === "Suspended"
          ? VolunteerStatus.SUSPENDED
          : VolunteerStatus.INACTIVE;

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
            role: UserRole.VOLUNTEER,
            createdBy: currentUser.email,
          },
        },
      },
    });

    if (!newVolunteer) {
      return { success: false, message: "Error al agregar el voluntario" };
    }

    // Asignación al grupo del día seleccionado
    const existingGroup = await prisma.group.findFirst({
      where: { dayOfWeek: body.dayOfWeek },
    });

    if (existingGroup) {
      const newMember = await prisma.groupMember.create({
        data: {
          volunteerId: newVolunteer.id,
          role: body.groupRole,
          groupId: existingGroup.id,
        },
      });

      if (!newMember) {
        return { success: false, message: "Error al agregar el voluntario al grupo existente" };
      }

      return { success: true };
    }

    const group = await prisma.group.create({
      data: {
        name: `Grupo de ${body.dayOfWeek}`,
        createdBy: currentUser.email,
        dayOfWeek: body.dayOfWeek,
        members: {
          create: {
            volunteerId: newVolunteer.id,
            role: body.groupRole,
          },
        },
      },
    });

    if (!group) {
      return { success: false, message: "Error al crear el grupo del voluntario" };
    }

    return { success: true };
  } catch (error) {
    console.error("[ERROR_ADD_VOLUNTEER_WITH_GROUP]", error);
    return { success: false, message: "Error al agregar el voluntario" };
  }
};
