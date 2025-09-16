"use server"

import { prisma } from "@/lib/prisma";
import {Volunteer} from "@/lib/store";
import { AttendanceStatus, VolunteerStatus, WeekDay } from "@prisma/client";
import {getCurrentCall} from "@/lib/get-current-call";

export const getVolunteerByScheduleToday = async () => {
  try {
    const currentCall = await getCurrentCall()
    if (!currentCall) {
      return [];
    }
    const today = new Date();
    
    const mapperDay = (day: number): WeekDay => {
      switch (day) {
        case 1:
          return WeekDay.LUNES;
        case 2:
          return WeekDay.MARTES;
        case 3:
          return WeekDay.MIERCOLES;
        case 4:
          return WeekDay.JUEVES;
        case 5:
          return WeekDay.VIERNES;
        case 6:
          return WeekDay.SABADO;
        case 0:
          return WeekDay.DOMINGO;
        default:
          return WeekDay.LUNES;
      }
    }
    
    const dayOfWeek: WeekDay = mapperDay(today.getDay());
    const activeVolunteersByGroupId = await prisma.volunteer.findMany({
      where: {
        status: VolunteerStatus.ACTIVE,
        deletedAt: null,
        callParticipants: {
          some: {
            callId: currentCall.id,
            callParticipantSchedules: {
              some: {
                schedule: {
                  dayOfWeek: dayOfWeek
                }
              }
            }
          }
        },
        groupMembers: {
          none: {}
        },
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
    
    const volunteersMapped: Volunteer[] =  activeVolunteersByGroupId.map((volunteer) => ({
      id: volunteer.id || '',
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone || "",
      dni: volunteer.user?.dni || "",
      address: volunteer.address || "",
      birthday: volunteer.birthday ? new Date(volunteer.birthday).toISOString().split('T')[0] : "",
      status: volunteer.status === "ACTIVE" ? "Active" : "Inactive",
      attendances: volunteer.attendances?.map(attendance => ({
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