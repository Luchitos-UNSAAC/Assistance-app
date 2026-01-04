"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/lib/auth-store"
import { TrendingUp, Gift, User, Users } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import AuthGuard from "@/components/auth-guard"
import { DashboardReview } from "@/features/dashboard/actions/get-review-dashboard"

interface DashboardProps {
  reviewDashboard: DashboardReview
}

export default function Dashboard({ reviewDashboard }: DashboardProps) {
  const { user } = useAuthStore()
  const isVolunteerView = user?.role === "VOLUNTEER"

  return (
    <AuthGuard requiredRole="VOLUNTEER">
      <div className="pt-20 pb-20">
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-800 via-pink-400 to-pink-800 bg-clip-text text-transparent animate-pulse">
              🐶 ¡Bienvenido! 🐾
            </h1>
            <p className="text-gray-500 text-md">
              {isVolunteerView
                ? "Mi Panel de Voluntario 🐕"
                : "Plataforma de Voluntarios 🐾"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-3 w-full">
            {!isVolunteerView && (
              <Card className="gradient-card">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Users className="h-4 w-4 text-gray-100"/>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Voluntarios Activos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reviewDashboard.activeVolunteers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="gradient-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-gray-100"/>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">
                      {isVolunteerView ? "Mi Asistencia Hoy" : "Presentes Hoy"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isVolunteerView
                        ? reviewDashboard.myPresentToday
                        : reviewDashboard.presentToday}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isVolunteerView && (
              <Card className="gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <User className="h-4 w-4 text-white"/>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Asistencias</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reviewDashboard.myAttendances}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upcoming Birthdays */}
          {reviewDashboard.upcomingBirthdays.length > 0 && (
            <Card className="gradient-card">
              <CardContent>
                <div className="flex items-center space-x-2 mt-3 mb-2">
                  <Gift className="h-5 w-5 text-pink-600" />
                  <span className='text-xl font-bold'>{"Próximos Cumpleaños"}</span>
                </div>
                <div className="space-y-1">
                  {reviewDashboard.upcomingBirthdays.map((volunteer) => (
                    <div key={volunteer.id} className="flex items-center justify-between px-2 py-2 bg-white/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-[230px]">
                          {volunteer?.isToday && <span className="mr-1">🎂</span>}
                          {volunteer.name}
                        </p>
                        {
                          volunteer?.birthday &&  <p className="text-sm text-gray-600">
                            {format(parseISO(volunteer.birthday), "dd 'de' MMMM", { locale: es })}
                          </p>
                        }
                      </div>
                      {
                        !volunteer?.isToday && volunteer?.birthday && <div className="text-right">
                          <div className="text-sm font-medium text-purple-600">
                            {volunteer?.birthday && (
                              <div className="text-right">
                                <p className="text-sm font-medium text-purple-600">
                                  {Math.ceil(
                                    (parseISO(volunteer.birthday).getTime() - new Date().getTime()) /
                                    (1000 * 60 * 60 * 24)
                                  )} días
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      }
                      {volunteer?.isToday && (
                        <span className="inline-flex items-center bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Hoy
                          </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
