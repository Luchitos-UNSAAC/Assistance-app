"use server"

import {cookies} from "next/headers";
import {prisma} from "@/lib/prisma";

export const getCurrentAdminUser = async () => {
  try {
    const cookieStore = cookies();
    const userEmail = cookieStore.get("userEmail")?.value;
    if (!userEmail) {
      return null;
    }
    const adminUser = await prisma.user.findFirst({
      where: {
        email: userEmail,
        role: 'ADMIN'
      }
    })
    if (!adminUser){
      return null;
    }
    return adminUser
  } catch (e) {
    console.log("[ERROR_GET_CURRENT_ADMIN_USER]", e)
    return null
  }
}
