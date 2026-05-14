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
      },
      include: {
        volunteer: {
          select: {
            birthday: true,
          }
        },
      },
    })
    if (!user) {
      return {
        success: false,
        error: "Usuario no encontrado"
      }
    }

    if (!user.volunteerId) {
      return {
        success: false,
        error: "No hay voluntario"
      }
    }

    return {
      success: true,
      data: user.password === "TEMP_PASS",
      user: {
        email,
        birthday: user.volunteer?.birthday || undefined
      }
    }

  } catch (error) {
    console.error("[ERROR_LOGIN_USER]", error);
    return {
      success: false,
      error: "Error al verificar la contraseña"
    }
  }
}
