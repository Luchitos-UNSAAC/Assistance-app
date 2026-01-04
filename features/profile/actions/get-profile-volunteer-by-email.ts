import {prisma} from "@/lib/prisma";
import {AttendanceStatus, VolunteerStatus} from "@prisma/client";
import {Volunteer} from "@/lib/store";

export const getProfileVolunteerByEmail = async (email: string): Promise<Volunteer | null> => {
  const currentVolunteer = await prisma.user.findFirst({
    where: {
      email,
    }
  })

  if (!currentVolunteer) {
    return null;
  }

  if (!currentVolunteer.volunteerId) {
    return null;
  }

  const volunteerFull = await prisma.volunteer.findUnique({
    where: {
      id: currentVolunteer.volunteerId,
      status: "ACTIVE",
      deletedAt: null,
    },
    include: {
      attendances: {
        select: {
          id: true,
          date: true,
          status: true,
          volunteerId: true,
        },
      },
      user: true,
    },
  });

  if (!volunteerFull) {
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

  return {
    id: volunteerFull.id,
    name: volunteerFull.name,
    email: volunteerFull.email,
    phone: volunteerFull.phone,
    address: volunteerFull.address,
    dni: volunteerFull?.user?.dni || undefined,
    birthday: volunteerFull?.birthday?.toISOString(),
    status: mapVolunteerStatus(volunteerFull.status),
    attendances: volunteerFull.attendances.map(a => ({
      id: a.id,
      date: a.date.toISOString(),
      status: mapAttendanceStatus(a.status),
      volunteerId: a.volunteerId,
    }))
  }
}
