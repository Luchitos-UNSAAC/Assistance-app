"use server"

import { prisma } from "@/lib/prisma"
import { Volunteer } from "@/lib/store"
import { AttendanceStatus, VolunteerStatus, WeekDay } from "@prisma/client"
import { getGroupOfCurrentVolunteer } from "@/lib/get-group-of-current-volunteer"

const mapAttendanceStatus = (status: AttendanceStatus) => {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return "Present"
    case AttendanceStatus.ABSENT:
      return "Absent"
    case AttendanceStatus.JUSTIFIED:
      return "Justified"
    case AttendanceStatus.LATE:
      return "Late"
  }
}

const DAY_MAP: Record<number, WeekDay> = {
  0: WeekDay.DOMINGO,
  1: WeekDay.LUNES,
  2: WeekDay.MARTES,
  3: WeekDay.MIERCOLES,
  4: WeekDay.JUEVES,
  5: WeekDay.VIERNES,
  6: WeekDay.SABADO_MANIANA,
}

export const getVolunteerGroupedToday = async (email: string): Promise<{
  volunteers: Volunteer[]
  isPossibleToMarkAttendances: boolean
  todayWeekDay: WeekDay
} | null> => {
  try {
    const today = new Date()
    const todayWeekDay = DAY_MAP[today.getDay()]

    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // ==========================
    // 🟣 ADMIN FLOW
    // ==========================
    const currentAdmin = await prisma.user.findFirst({
     where: {
       email,
       role: "ADMIN",
     }
    })
    if (currentAdmin) {
      // 1️⃣ Ver si el admin es líder de algún grupo
      const adminVolunteer = await prisma.volunteer.findFirst({
        where: {
          deletedAt: null,
          user: { id: currentAdmin.id },
        },
        select: {
          groupMembers: {
            where: {
              deletedAt: null,
              role: "LEADER",
            },
            select: { groupId: true },
          },
        },
      })

      const leaderGroupIds =
        adminVolunteer?.groupMembers.map((gm) => gm.groupId) ?? []

      const isPossibleToMarkAttendances = leaderGroupIds.length > 0

      // 2️⃣ Obtener SOLO grupos del día de hoy
      const groupsToday = await prisma.group.findMany({
        where: {
          deletedAt: null,
          dayOfWeek: todayWeekDay,
        },
        select: { id: true },
      })

      if (groupsToday.length === 0) {
        return {
          volunteers: [],
          isPossibleToMarkAttendances,
          todayWeekDay,
        }
      }

      const groupIds = groupsToday.map((g) => g.id)

      // 3️⃣ Voluntarios de esos grupos
      const volunteers = await prisma.volunteer.findMany({
        where: {
          deletedAt: null,
          status: VolunteerStatus.ACTIVE,
          groupMembers: {
            some: {
              groupId: { in: groupIds },
              deletedAt: null,
            },
          },
          user: {
            role: { not: "ADMIN" },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          birthday: true,
          status: true,
          user: {
            select: { dni: true },
          },
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
      })

      return {
        volunteers: volunteers.map(mapVolunteer),
        isPossibleToMarkAttendances,
        todayWeekDay,
      }
    }

    // ==========================
    // 🟢 MANAGER / LEADER FLOW
    // ==========================
    const currentVolunteer = await prisma.user.findFirst({
      where: {
        email,
      }
    })
    if (!currentVolunteer) return null

    const currentGroup = await getGroupOfCurrentVolunteer(currentVolunteer.id)
    if (!currentGroup) return null

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
          role: { not: "ADMIN" },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        birthday: true,
        status: true,
        user: {
          select: { dni: true },
        },
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
    })

    return {
      volunteers: volunteers.map(mapVolunteer),
      isPossibleToMarkAttendances: true,
      todayWeekDay: currentGroup.dayOfWeek,
    }
  } catch (error) {
    console.error("[ERROR_GET_VOLUNTEERS_GROUPED_TODAY]", error)
    return null
  }
}

// ==========================
// 🔁 MAPPER
// ==========================
function mapVolunteer(v: any): Volunteer {
  return {
    id: v.id,
    name: v.name,
    email: v.email,
    phone: v.phone ?? "",
    dni: v.user?.dni ?? "",
    address: v.address ?? "",
    birthday: v.birthday
      ? new Date(v.birthday).toISOString().split("T")[0]
      : "",
    status: v.status === VolunteerStatus.ACTIVE ? "Active" : "Inactive",
    attendances: v.attendances.length
      ? [
        {
          id: v.attendances[0].id,
          volunteerId: v.id,
          date: v.attendances[0].date.toISOString().split("T")[0],
          status: mapAttendanceStatus(v.attendances[0].status),
        },
      ]
      : [],
  }
}
