"use server"

import { prisma } from "@/lib/prisma";
import {Volunteer} from "@/lib/store";
import { AttendanceStatus, VolunteerStatus } from "@prisma/client";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";
import {getGroupOfCurrentVolunteer} from "@/lib/get-group-of-current-volunteer";

export const getVolunteerGroupedToday = async () => {
  try {
    const currentVolunteer = await getCurrentVolunteer()
    if (!currentVolunteer) {
      return [];
    }

    const currentGroup = await getGroupOfCurrentVolunteer(currentVolunteer.id);
    if (!currentGroup) {
      return [];
    }

    const activeVolunteers = await prisma.volunteer.findMany({
      where: {
        status: VolunteerStatus.ACTIVE,
        deletedAt: null,
        groupMembers: {
          some: {
            groupId: currentGroup.id,
            deletedAt: null
          }
        },
        user: {
          role: {
            not: 'ADMIN'
          }
        }
      },
      include: {
        attendances: {
          orderBy: {
            date: 'desc'
          },
          where: {
            deletedAt: null
          }
        },
        user: {
          select: {
            dni: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

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
    }

    const volunteersMapped: Volunteer[] =  activeVolunteers.map((volunteer) => ({
      id: volunteer?.id || '',
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer?.phone || "",
      dni: volunteer?.user?.dni || "",
      address: volunteer?.address || "",
      birthday: volunteer?.birthday ? new Date(volunteer?.birthday).toISOString().split('T')[0] : "",
      status: volunteer?.status === "ACTIVE" ? "Active" : "Inactive",
      attendances: volunteer?.attendances?.map(attendance => ({
        id: attendance.id,
        volunteerId: attendance.volunteerId,
        date: new Date(attendance.date).toISOString().split('T')[0],
        status: mapAttendanceStatus(attendance.status),
      })) || [],
    }));
    return volunteersMapped;

  } catch (error) {
    console.error("[ERROR_GET_ACTIVE_VOLUNTEERS]", error);
    return [];
  }
}
