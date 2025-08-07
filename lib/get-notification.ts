import {prisma} from "@/lib/prisma";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";

export const getNotification = async () => {
  const volunteer = await getCurrentVolunteer();
  if (!volunteer) {
    return [];
  }
  
  return await prisma.notification.findMany({
    where: {
      volunteerId: volunteer.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  
  
}