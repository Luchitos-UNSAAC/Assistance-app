"use server"

import { prisma } from "@/lib/prisma"
import { UserRole, GroupRole, WeekDay } from "@prisma/client"
import { getCurrentAdminUser } from "@/lib/get-current-admin-user"

interface UpdateUserRoleOptions {
  isLeader?: boolean
  leaderDay?: WeekDay | null
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
  options?: UpdateUserRoleOptions
) {
  try {
    // 1️⃣ Validar admin
    const currentAdminUser = await getCurrentAdminUser()

    if (!currentAdminUser || currentAdminUser.role !== UserRole.ADMIN) {
      return { error: "No tienes permisos suficientes" }
    }

    // 2️⃣ Obtener usuario con volunteer y grupos
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        volunteer: {
          include: {
            groupMembers: {
              where: { deletedAt: null },
              include: { group: true },
            },
          },
        },
      },
    })

    if (!user) {
      return { error: "No existe el usuario" }
    }

    // 3️⃣ Evitar eliminar último ADMIN
    if (user.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
      const adminsCount = await prisma.user.count({
        where: {
          role: UserRole.ADMIN,
          deletedAt: null,
        },
      })

      if (adminsCount <= 1) {
        return { error: "Debe existir al menos un administrador" }
      }
    }

    const { isLeader = false, leaderDay = null } = options ?? {}

    // 4️⃣ Validaciones de negocio
    if (
      (role === UserRole.MANAGER || isLeader) &&
      !leaderDay
    ) {
      return { error: "Debe seleccionar el día de encargado" }
    }

    await prisma.$transaction(async (tx) => {
      // 5️⃣ Actualizar rol del usuario
      await tx.user.update({
        where: { id: userId },
        data: {
          role,
          updatedBy: currentAdminUser.id,
        },
      })

      if (!user.volunteer) return

      const volunteerId = user.volunteer.id

      // 6️⃣ Resetear roles de grupo → MEMBER
      await tx.groupMember.updateMany({
        where: {
          volunteerId,
          deletedAt: null,
        },
        data: {
          role: GroupRole.MEMBER,
          updatedAt: new Date(),
        },
      })

      // 7️⃣ Asignar liderazgo si corresponde
      if (role === UserRole.MANAGER || isLeader) {
        const group = await tx.group.findFirst({
          where: {
            deletedAt: null,
            dayOfWeek: leaderDay!,
          },
        })

        if (!group) {
          throw new Error("No existe un grupo para el día seleccionado")
        }

        await tx.groupMember.updateMany({
          where: {
            volunteerId,
            groupId: group.id,
            deletedAt: null,
          },
          data: {
            role: GroupRole.LEADER,
            updatedAt: new Date(),
          },
        })
      }
    })

    return { success: true }
  } catch (e) {
    console.error("[ERROR_UPDATE_ROLE_USER]", e)
    return { error: "Algo ha sucedido" }
  }
}
