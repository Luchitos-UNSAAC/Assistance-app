import {cookies} from "next/headers";
import {prisma} from "@/lib/prisma";

export const getCurrentUserWithRole = async () => {
  try {
    const cookieStore = cookies();
    const userEmail = cookieStore.get("userEmail")?.value;
    const currentUser = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    if (!currentUser) {
      return false;
    }
    return currentUser
  } catch (error) {
    console.error("[ERROR_GET_CURRENT_USER_WITH_ROLE]", error);
    return null
  }
}