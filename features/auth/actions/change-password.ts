"use server"

import {prisma} from "@/lib/prisma";
import {getCurrentUser} from "@/lib/get-current-user";

export async function changePassword(newPassword: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: "Usuario no autenticado"
      }
    }
    const email = currentUser.email;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        password: "TEMP_PASSWORD"
      }
    })
    if (!user || !user.volunteerId) {
      return {
        success: false,
        error: "Usuario no encontrado"
      }
    }

    await prisma.user.update({
      where: {
        email: email
      },
      data: {
        password: newPassword
      }
    })

    return {
      success: true,
      error: null
    }

  } catch (error) {
    console.error("[ERROR_LOGIN_USER]", error);
    return {
      success: false,
      error: "Error al verificar la contraseña"
    }
  }
}
