"use server"

import {prisma} from "@/lib/prisma"
import {getCurrentAdminUser} from "@/lib/get-current-admin-user";

export const getSettingById = async (settingId: string) => {
  const currentAdminUser = await getCurrentAdminUser()
  if (!currentAdminUser) {
    return null;
  }

  try {
    const settings = await prisma.setting.findFirst({
      where: {
        id: settingId,
        deletedAt: null,
      }
    })
    if (!settings) {
      return null
    }
    return settings;
  } catch (e) {
    console.error("[ERROR_GET_SETTINGS]", e)
    return null;
  }
}
