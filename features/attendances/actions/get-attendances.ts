"use server"

import {getCurrentUser} from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import {AttendanceWithVolunteer, VolunteerForSelect} from "@/lib/store";
import { AttendanceStatus } from "@prisma/client";
import { VolunteerStatus } from "@prisma/client";

export const getAttendancesAndVolunteers = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        attendances: [],
        volunteers: []
      }
    }
    const [attendances, volunteers] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          volunteer: true
        }
      }),
      prisma.volunteer.findMany({
        where: {
          deletedAt: null,
          status: VolunteerStatus.ACTIVE,
          createdBy: {
            not: null
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        }
      })
    ])
    
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
    
    const mapVolunteerStatus = (status: VolunteerStatus) => {
      switch (status) {
        case VolunteerStatus.ACTIVE:
          return "Active";
        case VolunteerStatus.INACTIVE:
          return "Inactive";
        case VolunteerStatus.SUSPENDED:
          return "Suspended";
      }
    }
    
    const attendancesMapped: AttendanceWithVolunteer[] = attendances.map((attendance) => ({
      id: attendance.id,
      date: attendance.date.toISOString(),
      status: mapAttendanceStatus(attendance.status),
      volunteer: {
        id: attendance.volunteer.id,
        name: attendance.volunteer.name,
        email: attendance.volunteer.email,
      }
    }));
    const volunteersForSelect: VolunteerForSelect[] = volunteers.map(volunteer => ({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      status: mapVolunteerStatus(volunteer.status)
    }));
    return {
      attendances: attendancesMapped,
      volunteers: volunteersForSelect,
    }
    
  } catch (error) {
    console.error("[ERROR_GET_ATTENDANCES]", error);
    return {
      attendances: [],
      volunteers: []
    }
  }
}