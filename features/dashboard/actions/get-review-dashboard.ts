import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, addDays } from "date-fns"
import {cookies} from "next/headers";
import {AttendanceStatus} from "@prisma/client";
import {StatusAttendance} from "@/lib/store";

interface VolunteerSummary {
  id: string
  name: string
  email: string
  birthday: string
}

export interface DashboardReview {
  activeVolunteers: number
  todayAttendances: number
  presentToday: number
  upcomingBirthdays: VolunteerSummary[]
  myAttendances?: number
  myPresentToday?: number
  myBirthday: string | null
  myAttendancesHistory: {
    date: string
    status: StatusAttendance
  }[] | null
}

export async function getReviewDashboard(): Promise<DashboardReview | null> {
  const cookieStore = cookies();
  const userEmail = cookieStore.get("userEmail")?.value;
  if (!userEmail) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    }
  })
  if (!user) {
    return null;
  }
  
  const isVolunteer = user.role === "VOLUNTEER"
  
  const today = new Date()
  
  const [volunteers, attendances] = await Promise.all([
    prisma.volunteer.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        createdBy: {
          not: null,
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        birthday: true,
      }
    }),
    
    prisma.attendance.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
      },
      select: {
        status: true,
        volunteerId: true,
        date: true,
      }
    })
  ])
  
  const mapAttendanceStatus = (status: AttendanceStatus): StatusAttendance =>  {
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
  
  // Active Volunteers
  const activeVolunteers = volunteers.length
  
  // Filter today's attendances
  const todayAttendances = attendances
  const presentToday = attendances.filter(a => a.status === "PRESENT").length
  
  // Upcoming birthdays in next 30 days
  const upcomingBirthdays = volunteers.filter(v => {
    if (!v.birthday) return false
    const b = new Date(v.birthday)
    const thisYear = new Date(today.getFullYear(), b.getMonth(), b.getDate())
    const diff = (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  })
  
  // Volunteer-specific data
  let myAttendances = 0
  let myPresentToday = 0
  let myBirthday: string | null = null
  let myAttendancesHistory = null
  
  if (isVolunteer) {
    const myAttendance = await prisma.attendance.findMany({
      where: {
        deletedAt: null,
        Volunteer: {
          user: {
            email: user.email
          }
        }
      },
      select: {
        date: true,
        status: true,
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    const myToday = myAttendance.filter(a =>
      a.date >= startOfDay(today) && a.date <= endOfDay(today)
    )
    
    myAttendances = myAttendance.length
    myAttendancesHistory = myAttendance.map(a => ({
      date: a.date.toISOString(),
      status: mapAttendanceStatus(a.status)
    }))
    myPresentToday = myToday.filter(a => a.status === "PRESENT").length
    
    const me = volunteers.find(v => v.email === user.email)
    if (me?.birthday) {
      const bd = new Date(me.birthday)
      myBirthday = new Date(today.getFullYear(), bd.getMonth(), bd.getDate()).toISOString()
    }
  }
  
  return {
    activeVolunteers,
    todayAttendances: todayAttendances.length,
    presentToday,
    upcomingBirthdays: upcomingBirthdays.map(v => ({
      id: v.id,
      name: v.name,
      email: v.email,
      birthday: new Date(today.getFullYear(), new Date(v.birthday).getMonth(), new Date(v.birthday).getDate()).toISOString()
    })),
    myAttendances,
    myAttendancesHistory,
    myPresentToday,
    myBirthday
  }
}