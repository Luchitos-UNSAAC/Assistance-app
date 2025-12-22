"use server"

import { prisma } from "@/lib/prisma"
import {getCurrentAdminUser} from "@/lib/get-current-admin-user";

export const updateVolunteerGroups = async (
  volunteerId: string,
  groupIds: string[]
) => {

  const adminUser = await getCurrentAdminUser();
  if (!adminUser) {
    return;
  }

  try {
    await prisma.groupMember.deleteMany({
      where: { volunteerId },
    })

    await prisma.groupMember.createMany({
      data: groupIds.map((groupId) => ({
        volunteerId,
        groupId,
      })),
    })

    return { success: true }
  } catch (e) {
    console.error("[UPDATE_VOLUNTEER_GROUPS]", e)
    return { error: true }
  }
}
