import {prisma} from "@/lib/prisma";
import {GroupRole} from "@prisma/client";

export const getGroupOfCurrentVolunteer = async (volunteerId: string) => {
  try {
    const groupOfCurrentVolunteer = await prisma.group.findMany({
      where: {
        deletedAt: null,
        members: {
          some: {
            volunteerId: volunteerId,
            deletedAt: null,
            role: GroupRole.LEADER
          }
        }
      },
      include: {
        members: {
          include: {
            volunteer: true
          }
        }
      }
    })
    console.log(groupOfCurrentVolunteer)
    if (groupOfCurrentVolunteer.length === 0) {
      return null;
    }
    return groupOfCurrentVolunteer[0];
  } catch (error) {
    console.error("Error fetching group of current volunteer:", error);
    return null;
  }
}
