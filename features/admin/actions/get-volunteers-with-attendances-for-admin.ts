"use server"

import {prisma} from "@/lib/prisma";
import {Group, GroupMember, Volunteer, User} from "@prisma/client";

export type VolunteerWithAttendancesByStatus = Volunteer & {
  groupMembers: (GroupMember & {
    group: Group
  })[],
  attendances: {
    PRESENT: number;
    ABSENT: number;
    LATE: number;
  },
  user: User | null
}

export type VolunteerForAdmin = {
  volunteers: VolunteerWithAttendancesByStatus[]
  groups: Group[]
}

export const getVolunteersWithAttendancesForAdmin = async () => {
  try {
    const volunteersFirst = await prisma.volunteer.findMany({
      where: {
        user: {
          role: {
            not: 'ADMIN'
          },
          deletedAt: null
        },
        deletedAt: null
      },
      include: {
        groupMembers: {
          include: {
            group: true
          },
          where: {
            deletedAt: null
          },
          orderBy: {
            group: {
              name: 'asc'
            }
          }
        },
        user: true,
      },
      // take: 20,
      orderBy: {
        name: 'asc'
      }
    })

    const attendanceStats = await prisma.attendance.groupBy({
      by: ["volunteerId", "status"],
      _count: {
        _all: true,
      },
    })

    const groups = await prisma.group.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc'
      }
    })

    const volunteersWithAttendance: VolunteerWithAttendancesByStatus[] = volunteersFirst.map(v => {
      const stats = attendanceStats.filter(a => a.volunteerId === v.id)
      return {
        ...v,
        attendances: {
          PRESENT: stats.find(s => s.status === "PRESENT")?._count._all ?? 0,
          ABSENT: stats.find(s => s.status === "ABSENT")?._count._all ?? 0,
          LATE: stats.find(s => s.status === "LATE")?._count._all ?? 0,
        },
        user: v.user,
      }
    })

    const result: VolunteerForAdmin = {
      volunteers: volunteersWithAttendance,
      groups,
    }
    return result
  } catch (e) {
    console.log("[ERROR_GET_VOLUNTEER_WITH_ATTENDANCES_FOR_ADMIN", e)
    return {
      volunteers: [],
      groups: [],
    }
  }
}
