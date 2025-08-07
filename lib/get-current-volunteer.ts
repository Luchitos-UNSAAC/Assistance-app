import {prisma} from "@/lib/prisma";
import {cookies} from "next/headers";
import { UserRole } from "@prisma/client";

export const getCurrentVolunteer = async (role?: UserRole) => {
  const cookieStore = cookies();
  const userEmail = cookieStore.get("userEmail")?.value; // Or token decoding if you use JWT
  
  const whereClause: any = {
    email: userEmail,
  }
  if (role) {
    whereClause.role = role;
  }
  
  const userFromDb = await prisma.user.findUnique({
    where: {
      ...whereClause
    },
    include: {
      volunteer: true
    }
  });
  if (!userFromDb) {
    return null;
  }
  
  if (!userFromDb.volunteer) {
    return null;
  }
  
  return {
    id: userFromDb.volunteer.id,
    name: userFromDb.volunteer.name,
    email: userFromDb.email,
    phone: userFromDb.volunteer.phone,
    address: userFromDb.volunteer.address,
    birthday: userFromDb.volunteer.birthday,
    status: userFromDb.volunteer.status,
    createdAt: userFromDb.volunteer.createdAt,
    updatedAt: userFromDb.volunteer.updatedAt,
  };
}