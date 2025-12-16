"use server"

import {prisma} from "@/lib/prisma";
import {getCurrentVolunteerByUserId} from "@/lib/get-current-volunteer-by-user-id";
import { cookies } from "next/headers";

export async function loginUser(email: string, password: string) {
  try {
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
    if (user.password !== password) {
      return {
        success: false,
        error: "Contraseña incorrecta"
      }
    }

    const volunteer = await getCurrentVolunteerByUserId(user.volunteerId);
    if (!volunteer) {
      return {
        success: false,
        error: "Voluntario no encontrado"
      }
    }
    cookies().set("userEmail", email, { httpOnly: true, secure: true });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        volunteerId: volunteer.id,
        role: user.role,
        avatar: user.avatar,
      }
    }
  } catch (error) {
    console.log("[ERROR_LOGIN_USER]", error);
    return {
      success: false,
      error: "Error al iniciar sesión"
    }
  }
}
