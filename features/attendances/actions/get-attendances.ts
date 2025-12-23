"use server";

import {prisma} from "@/lib/prisma";
import {VolunteerForSelect} from "@/lib/store";
import {AttendanceStatus, VolunteerStatus, WeekDay} from "@prisma/client";
import {getGroupOfCurrentVolunteer} from "@/lib/get-group-of-current-volunteer";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";
import {getCurrentAdminUser} from "@/lib/get-current-admin-user";

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

const DAY_MAP: Record<number, WeekDay> = {
  0: WeekDay.DOMINGO,
  1: WeekDay.LUNES,
  2: WeekDay.MARTES,
  3: WeekDay.MIERCOLES,
  4: WeekDay.JUEVES,
  5: WeekDay.VIERNES,
  6: WeekDay.SABADO_MANIANA,
}

interface GetAttendancesResponse {
  volunteersForSelect: VolunteerForSelect[]
  isPossibleToMarkAttendances: boolean
  todayWeekDay: WeekDay
}

export const getAttendancesAndVolunteers = async (): Promise<GetAttendancesResponse | null> => {
  try {
    const currentAdminUser = await getCurrentAdminUser();
    if (currentAdminUser) {
      return await getAttendancesAsAdmin(currentAdminUser.id)
    }
    const currentVolunteer = await getCurrentVolunteer();
    if (!currentVolunteer) {
      return null
    }
    return await getAttendancesAsManager(currentVolunteer.id)
  } catch (error) {
    console.error("[ERROR_GET_ATTENDANCES]", error);
    return null
  }
};

async function getAttendancesAsManager(managerId: string) {
  const currentGroup = await getGroupOfCurrentVolunteer(managerId);
  if (!currentGroup) {
    return null
  }

  let isPossibleToMarkAttendances = false;
  const day = new Date().getDay()
  const todayWeekDay = DAY_MAP[day]
  if (day === 6) {
    isPossibleToMarkAttendances = true;
  } else {
    if (todayWeekDay === currentGroup.dayOfWeek) {
      isPossibleToMarkAttendances = true;
    }
  }

  const dayOfGroup = currentGroup.dayOfWeek;

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
      user: true,
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
    orderBy: {name: "asc"},
  });

  const volunteersForSelect: VolunteerForSelect[] = volunteers.map(
    (volunteer) => ({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      status: mapVolunteerStatus(volunteer.status),
      user: {
        avatar: volunteer?.user?.avatar || undefined,
      },
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

  return {
    isPossibleToMarkAttendances,
    volunteersForSelect,
    todayWeekDay: dayOfGroup
  };
}

async function getAttendancesAsAdmin(adminUserId: string) {
  const today = new Date();
  const todayWeekDay = DAY_MAP[today.getDay()];

  // 1️⃣ Ver si el admin es líder
  const adminVolunteer = await prisma.volunteer.findFirst({
    where: {
      deletedAt: null,
      user: {
        id: adminUserId,
      },
    },
    select: {
      id: true,
      groupMembers: {
        where: {
          deletedAt: null,
          role: "LEADER",
        },
        select: {
          groupId: true,
        },
      },
    },
  });

  const leaderGroupIds =
    adminVolunteer?.groupMembers.map((gm) => gm.groupId) || [];

  const isPossibleToMarkAttendances = leaderGroupIds.length > 0;

  // 2️⃣ Obtener SOLO los grupos del día de hoy
  const groups = await prisma.group.findMany({
    where: {
      deletedAt: null,
      dayOfWeek: todayWeekDay,
    },
    select: {
      id: true,
    },
  });

  if (groups.length === 0) {
    return {
      isPossibleToMarkAttendances,
      volunteersForSelect: [],
      todayWeekDay,
    };
  }

  const groupIds = groups.map((g) => g.id);

  // 3️⃣ Rango de HOY
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // 4️⃣ Obtener voluntarios SOLO de los grupos de hoy
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
        role: {
          not: "ADMIN",
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      user: true,
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

  // 6️⃣ DTO
  const volunteersForSelect: VolunteerForSelect[] = volunteers.map(
    (volunteer) => ({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      status: mapVolunteerStatus(volunteer.status),
      user: {
        avatar: volunteer?.user?.avatar || undefined,
      },
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

  return {
    isPossibleToMarkAttendances,
    volunteersForSelect,
    todayWeekDay,
  };
}
