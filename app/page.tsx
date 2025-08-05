"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useVolunteerStore, useAttendanceStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { Users, Calendar, TrendingUp, Gift, User } from "lucide-react"
import { format, isToday, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"

export default function HomePage() {
  const volunteers = useVolunteerStore((state) => state.volunteers)
  const attendances = useAttendanceStore((state) => state.attendances)
  const { user } = useAuthStore()

  const activeVolunteers = volunteers.filter((v) => v.status === "Active").length
  const todayAttendances = attendances.filter((a) => isToday(parseISO(a.date)))
  const presentToday = todayAttendances.filter((a) => a.status === "Present").length

  // For volunteers, filter to show only their own data
  const getFilteredData = () => {
    if (user?.role === "VOLUNTEER" && user.volunteerId) {
      const myAttendances = attendances.filter((a) => a.volunteerId === user.volunteerId)
      const myTodayAttendances = myAttendances.filter((a) => isToday(parseISO(a.date)))
      const myPresentToday = myTodayAttendances.filter((a) => a.status === "Present").length

      return {
        attendances: myAttendances,
        todayAttendances: myTodayAttendances,
        presentToday: myPresentToday,
        isVolunteerView: true,
      }
    }

    return {
      attendances,
      todayAttendances,
      presentToday,
      isVolunteerView: false,
    }
  }

  const filteredData = getFilteredData()

  // Upcoming birthdays (next 30 days)
  const upcomingBirthdays = volunteers
    .filter((volunteer) => {
      // For volunteers, only show their own birthday
      if (user?.role === "VOLUNTEER" && user.volunteerId) {
        return volunteer.id === user.volunteerId
      }
      return true
    })
    .filter((volunteer) => {
      const today = new Date()
      const birthday = new Date(volunteer.birthday)
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
      const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate())

      const daysToBirthday = Math.min(
        Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        Math.ceil((nextYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      )

      return daysToBirthday >= 0 && daysToBirthday <= 30
    })
    .slice(0, 3)

  return (
    <AuthGuard requiredRole="VOLUNTEER">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            LUCHOS UNSAAC
          </h1>
          <p className="text-gray-600">
            {filteredData.isVolunteerView ? "Mi Panel de Voluntario" : "Plataforma de Voluntarios Caninos"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {!filteredData.isVolunteerView && (
            <Card className="gradient-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Voluntarios Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{activeVolunteers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {filteredData.isVolunteerView ? "Mi Asistencia Hoy" : "Presentes Hoy"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{filteredData.presentToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredData.isVolunteerView && (
            <Card className="gradient-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Asistencias</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredData.attendances.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Access for Volunteers */}
        {filteredData.isVolunteerView && user?.volunteerId && (
          <Card className="gradient-card">
            <CardContent className="p-4">
              <Link href={`/volunteers/${user.volunteerId}`}>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ver Mi Perfil Completo</p>
                      <p className="text-sm text-gray-600">Historial de asistencias y estadísticas</p>
                    </div>
                  </div>
                  <div className="text-purple-600">→</div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Today's Attendance */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>{filteredData.isVolunteerView ? "Mi Asistencia de Hoy" : "Asistencia de Hoy"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredData.todayAttendances.length > 0 ? (
              <div className="space-y-3">
                {filteredData.todayAttendances.map((attendance) => {
                  const volunteer = volunteers.find((v) => v.id === attendance.volunteerId)
                  if (!volunteer) return null

                  return (
                    <div key={attendance.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {filteredData.isVolunteerView ? "Tu asistencia" : volunteer.name}
                        </p>
                        {!filteredData.isVolunteerView && <p className="text-sm text-gray-600">{volunteer.email}</p>}
                      </div>
                      <Badge
                        variant={
                          attendance.status === "Present"
                            ? "default"
                            : attendance.status === "Justified"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          attendance.status === "Present"
                            ? "bg-green-500 hover:bg-green-600"
                            : attendance.status === "Justified"
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : ""
                        }
                      >
                        {attendance.status === "Present"
                          ? "Presente"
                          : attendance.status === "Absent"
                            ? "Ausente"
                            : "Justificado"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                {filteredData.isVolunteerView
                  ? "No tienes registro de asistencia para hoy"
                  : "No hay registros de asistencia para hoy"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Birthdays */}
        {upcomingBirthdays.length > 0 && (
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-pink-600" />
                <span>{filteredData.isVolunteerView ? "Mi Próximo Cumpleaños" : "Próximos Cumpleaños"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingBirthdays.map((volunteer) => (
                  <div key={volunteer.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {filteredData.isVolunteerView ? "Tu cumpleaños" : volunteer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(volunteer.birthday), "dd 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600">
                        {Math.ceil(
                          (new Date(
                            new Date().getFullYear(),
                            parseISO(volunteer.birthday).getMonth(),
                            parseISO(volunteer.birthday).getDate(),
                          ).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        días
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}
