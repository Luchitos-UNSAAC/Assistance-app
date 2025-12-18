"use server"

import { prisma } from "@/lib/prisma"
import {getCurrentAdminUser} from "@/lib/get-current-admin-user";

export const getSettings = async ()=> {
  const currentAdminUser = await getCurrentAdminUser()
  if (!currentAdminUser) {
    return [];
  }

  try {
    const settings = await prisma.setting.findMany({
      where: {
        deletedAt: null,
      }
    })
    if (settings.length === 0) {
      return []
    }
    return settings;
  } catch (e) {
    console.error("[ERROR_GET_SETTINGS]", e)
    return [];
  }
}
