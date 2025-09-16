"use server"

import {getCurrentUser} from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import {Volunteer} from "@/lib/store";
import { AttendanceStatus, VolunteerStatus, UserRole, GroupRole } from "@prisma/client";

export const getVolunteerFreeToBeManager = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }
    const activeManagers = await prisma.user.findMany({
      where: {
        role: UserRole.VOLUNTEER,
        volunteer: {
          status: VolunteerStatus.ACTIVE,
          deletedAt: null,
        }
      },
      include: {
        volunteer: {
          include: {
            attendances: {
              orderBy: {
                date: 'desc'
              },
              where: {
                deletedAt: null
              }
            },
            groupMembers: {
              where: {
                role: GroupRole.LEADER,
              },
              include: {
                group: true
              }
            }
          },
        }
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
    
    const managersMapped: Volunteer[] =  activeManagers.map((manager) => ({
      id: manager?.volunteer?.id || '',
      name: manager.name,
      email: manager.email,
      phone: manager?.volunteer?.phone || "",
      dni: manager?.dni || "",
      address: manager?.volunteer?.address || "",
      birthday: manager?.volunteer?.birthday ? new Date(manager?.volunteer?.birthday).toISOString().split('T')[0] : "",
      status: manager?.volunteer?.status === "ACTIVE" ? "Active" : "Inactive",
      attendances: manager?.volunteer?.attendances?.map(attendance => ({
        id: attendance.id,
        volunteerId: attendance.volunteerId,
        date: new Date(attendance.date).toISOString().split('T')[0],
        status: mapAttendanceStatus(attendance.status),
      })) || [],
    }));
    return managersMapped;
    
  } catch (error) {
    console.error("[ERROR_GET_ACTIVE_MANAGERS]", error);
    return [];
  }
}