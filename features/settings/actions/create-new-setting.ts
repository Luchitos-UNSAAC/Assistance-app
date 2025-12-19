"use server"

import { prisma } from "@/lib/prisma"
import {getCurrentAdminUser} from "@/lib/get-current-admin-user";

export type NewSettingBody = {
  key: string,
  value: string,
}

export const createNewSetting = async (body: NewSettingBody)=> {
  const currentAdminUser = await getCurrentAdminUser()
  if (!currentAdminUser) {
    return {
      error: 'No eres administrador'
    };
  }

  try {
    const newSetting = await prisma.setting.create({
      data: {
        key: body.key,
        value: body.value,
      }
    })
    if (!newSetting) {
      return {
        error: "Error al crear configuration"
      }
    }
    return {
      success: true,
    };
  } catch (e) {
    console.error("[ERROR_CREATE_NEW_SETTING]", e)
    return {
      error: "Algo ha sucedido mal"
    };
  }
}
