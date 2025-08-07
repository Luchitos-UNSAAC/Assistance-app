import {getCurrentUser} from "@/lib/get-current-user";
import {Volunteer} from "@/lib/store";
import {AttendanceStatus, VolunteerStatus} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const getVolunteerById = async (id: string) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return null;
    }
    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        attendances: true,
      },
    });
    if (!volunteer) {
      return null;
    }
    
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
    
    const volunteerMapped: Volunteer = {
      id: volunteer.id || "",
      name: volunteer.name || "",
      email: volunteer.email || "",
      phone: volunteer.phone || "",
      address: volunteer.address || "",
      birthday: volunteer.birthday ? new Date(volunteer.birthday).toISOString().split('T')[0] : "",
      status: mapVolunteerStatus(volunteer.status),
      attendances: volunteer?.attendances.map(attendance => ({
        id: attendance.id,
        volunteerId: attendance.volunteerId,
        date: attendance.date.toISOString(),
        status: mapAttendanceStatus(attendance.status),
        
      })) || [],
    }
    
    return volunteerMapped;
  } catch (e){
    console.error("[ERROR_GET_VOLUNTEER_BY_ID]", e);
    return null;
  }
}