import {prisma} from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export const getCurrentVolunteerByUserId = async (volunteerId: string, role?: UserRole) => {
  const whereClause: any = {
    volunteerId
  }
  if (role) {
    whereClause.role = role;
  }
  
  const user = await prisma.user.findUnique({
    where: {
      ...whereClause
    },
    include: {
      volunteer: true
    }
  });
  if (!user) {
    return null;
  }
  
  if (!user.volunteer) {
    return null;
  }
  
  return {
    id: user.volunteer.id,
    name: user.volunteer.name,
    email: user.email,
    phone: user.volunteer.phone,
    address: user.volunteer.address,
    birthday: user.volunteer.birthday,
    status: user.volunteer.status,
    createdAt: user.volunteer.createdAt,
    updatedAt: user.volunteer.updatedAt,
    user: {
      id: user.id,
    }
  };
}