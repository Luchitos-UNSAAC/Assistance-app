import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { cookies } from "next/headers"
import { AttendanceStatus } from "@prisma/client"
import { StatusAttendance } from "@/lib/store"

interface VolunteerSummary {
  id: string
  name: string
  email: string
  birthday?: string
  isToday?: boolean
  daysRemaining?: number
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

// ===== UTILITIES =====
const MS_PER_DAY = 1000 * 60 * 60 * 24

const mapAttendanceStatus = (status: AttendanceStatus): StatusAttendance => {
  switch (status) {
    case AttendanceStatus.PRESENT: return "Present"
    case AttendanceStatus.ABSENT: return "Absent"
    case AttendanceStatus.JUSTIFIED: return "Justified"
    case AttendanceStatus.LATE: return "Late"
  }
}

const getNextBirthday = (birthday: string, today: Date) => {
  // Extraer año, mes y día directamente desde el string (YYYY-MM-DD)
  const [year, month, day] = birthday.split("T")[0].split("-").map(Number)

  // Crear fecha local con solo mes y día
  const nextBirthday = new Date(today.getFullYear(), month - 1, day)
  nextBirthday.setHours(0, 0, 0, 0)

  if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1)

  const daysRemaining = Math.round((nextBirthday.getTime() - today.getTime()) / MS_PER_DAY)
  return { nextBirthday, daysRemaining, isToday: daysRemaining === 0 }
}

// ===== MAIN FUNCTION =====
export async function getReviewDashboard(): Promise<DashboardReview | null> {
  const cookieStore = cookies()
  const userEmail = cookieStore.get("userEmail")?.value
  if (!userEmail) return null

  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) return null

  const isVolunteer = user.role === "VOLUNTEER"
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [volunteers, attendances] = await Promise.all([
    prisma.volunteer.findMany({
      where: { deletedAt: null, status: "ACTIVE", createdBy: { not: "first_migration" } },
      select: { id: true, name: true, email: true, birthday: true },
    }),
    prisma.attendance.findMany({
      where: { deletedAt: null, date: { gte: startOfDay(today), lte: endOfDay(today) } },
      select: { status: true, volunteerId: true, date: true },
    }),
  ])

  // ===== CALCULATE UPCOMING BIRTHDAYS =====
  const DAYS_RANGE = 30
  const upcomingBirthdays = volunteers
    .map(v => {
      if (!v.birthday) return null
      const birthdayStr = v.birthday instanceof Date ? v.birthday.toISOString() : v.birthday
      const { nextBirthday, daysRemaining, isToday } = getNextBirthday(birthdayStr, today)
      if (daysRemaining > DAYS_RANGE) return null
      return {
        id: v.id,
        name: v.name,
        email: v.email,
        birthday: `${nextBirthday.getFullYear()}-${String(nextBirthday.getMonth()+1).padStart(2,'0')}-${String(nextBirthday.getDate()).padStart(2,'0')}`,
        daysRemaining,
        isToday,
        _nextBirthdayTime: nextBirthday.getTime(), // helper para ordenar
      }
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)
    .sort((a, b) => (a.isToday && !b.isToday ? -1 : !a.isToday && b.isToday ? 1 : a._nextBirthdayTime - b._nextBirthdayTime))
    .map(({ _nextBirthdayTime, ...rest }) => rest)
  // ===== VOLUNTEER-SPECIFIC DATA =====
  let myAttendances = 0, myPresentToday = 0, myBirthday: string | null = null, myAttendancesHistory = null

  if (isVolunteer) {
    const myAttendance = await prisma.attendance.findMany({
      where: { deletedAt: null, Volunteer: { user: { email: user.email } } },
      select: { date: true, status: true },
      orderBy: { date: "desc" },
    })

    myAttendancesHistory = myAttendance.map(a => ({
      date: a.date.toISOString(),
      status: mapAttendanceStatus(a.status),
    }))

    myAttendances = myAttendance.length
    myPresentToday = myAttendance.filter(a => a.date >= startOfDay(today) && a.date <= endOfDay(today) && a.status === "PRESENT").length

    const me = volunteers.find(v => v.email === user.email)

    if (me?.birthday) {
      const birthdayStr = me.birthday instanceof Date ? me.birthday.toISOString() : me.birthday
      myBirthday = getNextBirthday(birthdayStr, today).nextBirthday.toISOString()
    }
  }

  // ===== FINAL RETURN =====
  return {
    activeVolunteers: volunteers.length,
    todayAttendances: attendances.length,
    presentToday: attendances.filter(a => a.status === "PRESENT").length,
    upcomingBirthdays,
    myAttendances,
    myAttendancesHistory,
    myPresentToday,
    myBirthday,
  }
}
