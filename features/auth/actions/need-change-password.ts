"use server"

import {prisma} from "@/lib/prisma";
import {getCurrentUser} from "@/lib/get-current-user";

export async function needChangePassword() {
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
        email: email
      }
    })
    if (!user || !user.volunteerId) {
      return {
        success: false,
        error: "Usuario no encontrado"
      }
    }
    return {
      success: true,
      data: user.password === "TEMP_PASSWORD"
    }

  } catch (error) {
    console.error("[ERROR_LOGIN_USER]", error);
    return {
      success: false,
      error: "Error al verificar la contraseña"
    }
  }
}
