"use server";

import { prisma } from "@/lib/prisma";
import { AttendanceWithVolunteer, VolunteerForSelect } from "@/lib/store";
import { AttendanceStatus, VolunteerStatus } from "@prisma/client";
import {getGroupOfCurrentVolunteer} from "@/lib/get-group-of-current-volunteer";
import {getCurrentVolunteer} from "@/lib/get-current-volunteer";

type GetAttendancesParams = {
  page?: number;
  pageSize?: number;
};

export const getAttendancesAndVolunteers = async ({ page = 1, pageSize = 10 }: GetAttendancesParams = {}) => {
  try {
    page = Number(page) || 1;
    pageSize = Number(pageSize) || 10;
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 10;
    const maxPageSize = 100;
    if (pageSize > maxPageSize) pageSize = maxPageSize;
    
    const currentVolunteer = await getCurrentVolunteer()
    if (!currentVolunteer) {
      return {
        attendances: [],
        volunteers: [],
        pagination: { page, pageSize, total: 0, totalPages: 1 },
      };
    }
    
    const currentGroup = await getGroupOfCurrentVolunteer(currentVolunteer.id);
    if (!currentGroup) {
      return {
        attendances: [],
        volunteers: [],
        pagination: { page, pageSize, total: 0, totalPages: 1 },
      };
    }
    
    const whereAttendance = { deletedAt: null };
    
    const [total, attendances, volunteers] = await Promise.all([
      prisma.attendance.count({ where: whereAttendance }),
      prisma.attendance.findMany({
        where: whereAttendance,
        include: {
          Volunteer: true
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.volunteer.findMany({
        where: {
          deletedAt: null,
          status: VolunteerStatus.ACTIVE,
          groupMembers: {
            some: {
              groupId: currentGroup.id,
              deletedAt: null
            }
          },
        },
        select: { id: true, name: true, email: true, status: true },
        orderBy: { name: "asc" },
      }),
    ]);
    
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
    
    const attendancesMapped: AttendanceWithVolunteer[] = attendances.map((attendance) => ({
      id: attendance.id,
      date: attendance.date.toISOString(),
      status: mapAttendanceStatus(attendance.status),
      volunteer: {
        id: attendance.Volunteer.id,
        name: attendance.Volunteer.name,
        email: attendance.Volunteer.email,
      },
    }));
    
    const volunteersForSelect: VolunteerForSelect[] = volunteers.map((volunteer) => ({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      status: mapVolunteerStatus(volunteer.status),
      countAttendances: attendancesMapped.filter((a) => a.volunteer.id === volunteer.id).length,
      attendanceToday: attendancesMapped.find((a) => {
        const today = new Date();
        const attendanceDate = new Date(a.date);
        return (
          a.volunteer.id === volunteer.id &&
          attendanceDate.getDate() === today.getDate() &&
          attendanceDate.getMonth() === today.getMonth() &&
          attendanceDate.getFullYear() === today.getFullYear()
        );
      }),
    }));
    
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    
    return {
      attendances: attendancesMapped,
      volunteers: volunteersForSelect,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("[ERROR_GET_ATTENDANCES]", error);
    return {
      attendances: [],
      volunteers: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
    };
  }
};