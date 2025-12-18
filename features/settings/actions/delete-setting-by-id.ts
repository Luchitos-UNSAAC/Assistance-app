"use server"

import { prisma } from "@/lib/prisma"
import {getCurrentAdminUser} from "@/lib/get-current-admin-user";

export const deleteSetting = async (settingId: string)=> {
  const currentAdminUser = await getCurrentAdminUser()
  if (!currentAdminUser) {
    return null;
  }

  try {
    const editSetting = await prisma.setting.update({
      where: {
        id: settingId,
      },
      data: {
        deletedAt: new Date(),
      }
    })
    if (!editSetting) {
      return null
    }
    return editSetting;
  } catch (e) {
    console.error("[ERROR_DELETE_SETTING]", e)
    return null;
  }
}
