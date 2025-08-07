import {prisma} from "@/lib/prisma";
import { cookies } from "next/headers";

export const getCurrentUser = async () => {
  const cookieStore = cookies();
  const userEmail = cookieStore.get("userEmail")?.value; // Or token decoding if you use JWT
  return await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
    select: {
      id: true,
      email: true,
      name: true,
    }
  });
}