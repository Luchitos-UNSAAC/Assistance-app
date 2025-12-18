"use server"

import { prisma } from "@/lib/prisma"
import {getCurrentAdminUser} from "@/lib/get-current-admin-user";


export const updateSetting = async (settingId: string, value: string)=> {
  const currentAdminUser = await getCurrentAdminUser()
  if (!currentAdminUser) {
    return {
      error: 'No eres administrador'
    };
  }

  try {
    const editSetting = await prisma.setting.update({
      where: {
        id: settingId,
      },
      data: {
        value,
      }
    })
    if (!editSetting) {
      return {
        error: 'No se pudo crear la configuracion'
      }
    }
    return {
      success: true,
    }
  } catch (e) {
    console.error("[ERROR_EDIT_SETTING]", e)
    return {
      error: "Algo ha sucedido. Intente mas tarde"
    }
  }
}
