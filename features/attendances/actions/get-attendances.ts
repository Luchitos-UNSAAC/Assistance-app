"use server";

import { prisma } from "@/lib/prisma";
import { VolunteerForSelect } from "@/lib/store";
import { AttendanceStatus, VolunteerStatus } from "@prisma/client";
import { getGroupOfCurrentVolunteer } from "@/lib/get-group-of-current-volunteer";
import { getCurrentVolunteer } from "@/lib/get-current-volunteer";

export const getAttendancesAndVolunteers = async () => {
  try {
    const currentVolunteer = await getCurrentVolunteer();
    if (!currentVolunteer) {
      return [];
    }

    const currentGroup = await getGroupOfCurrentVolunteer(currentVolunteer.id);
    if (!currentGroup) {
      return [];
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const volunteers = await prisma.volunteer.findMany({
      where: {
        deletedAt: null,
        status: VolunteerStatus.ACTIVE,
        groupMembers: {
          some: {
            groupId: currentGroup.id,
            deletedAt: null,
          },
        },
        user: {
          role: {
            not: 'ADMIN'
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        attendances: {
          where: {
            deletedAt: null,
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    const mapAttendanceStatus = (status: AttendanceStatus) => {
      switch (status) {
        case AttendanceStatus.PRESENT:
          return "Present";
        case AttendanceStatus.ABSENT:
          return "Absent";
        case AttendanceStatus.JUSTIFIED:
          return "Justified";
        case AttendanceStatus.LATE:
          return "Late";
      }
    };

    const mapVolunteerStatus = (status: VolunteerStatus) => {
      switch (status) {
        case VolunteerStatus.ACTIVE:
          return "Active";
        case VolunteerStatus.INACTIVE:
          return "Inactive";
        case VolunteerStatus.SUSPENDED:
          return "Suspended";
      }
    };

    const volunteersForSelect: VolunteerForSelect[] = volunteers.map(
      (volunteer) => ({
        id: volunteer.id,
        name: volunteer.name,
        email: volunteer.email,
        status: mapVolunteerStatus(volunteer.status),
        attendanceToday:
          volunteer.attendances.length > 0
            ? {
              id: volunteer.attendances[0].id,
              volunteerId: volunteer.id,
              date: volunteer.attendances[0].date.toISOString(),
              status: mapAttendanceStatus(volunteer.attendances[0].status),
            }
            : undefined,
      })
    );

    return volunteersForSelect;
  } catch (error) {
    console.error("[ERROR_GET_ATTENDANCES]", error);
    return [];
  }
};
