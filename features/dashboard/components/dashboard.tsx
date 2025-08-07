"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"
import { Calendar, TrendingUp, Gift, User, Users } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"
import { DashboardReview } from "@/features/dashboard/actions/get-review-dashboard"

interface DashboardProps {
  reviewDashboard: DashboardReview
}

export default function Dashboard({ reviewDashboard }: DashboardProps) {
  const { user } = useAuthStore()
  const isVolunteerView = user?.role === "VOLUNTEER"
  
  return (
    <AuthGuard requiredRole="VOLUNTEER">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            LUCHOS UNSAAC
          </h1>
          <p className="text-gray-600">
            {isVolunteerView ? "Mi Panel de Voluntario" : "Plataforma de Voluntarios Caninos"}
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {!isVolunteerView && (
            <Card className="gradient-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Voluntarios Activos</p>
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
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
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
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Asistencias</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reviewDashboard.myAttendances}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Quick Access for Volunteer */}
        {user?.volunteerId && (
          <Card className="gradient-card">
            <CardContent className="p-4 space-y-4">
              
              {/* Ver Perfil */}
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
              
              {/* Historial de Asistencias */}
              {reviewDashboard.myAttendancesHistory && reviewDashboard.myAttendancesHistory.length > 0 && (
                <div className="space-y-2 px-4">
                  <h3 className="text-sm font-semibold text-gray-700">Mi historial reciente de asistencias</h3>
                  <ul className="divide-y divide-gray-200">
                    {reviewDashboard.myAttendancesHistory.map((attendance, index) => (
                      <li key={index} className="py-2 flex justify-between items-center text-sm">
                        <div>
                          <p className="text-gray-900">
                            {format(parseISO(attendance.date), "dd 'de' MMMM", { locale: es })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(parseISO(attendance.date), "EEEE", { locale: es })}
                          </p>
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
                                : "bg-red-500 hover:bg-red-600"
                          }
                        >
                          {attendance.status === "Present"
                            ? "Presente"
                            : attendance.status === "Justified"
                              ? "Justificado"
                              : "Ausente"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Upcoming Birthdays */}
        {reviewDashboard.upcomingBirthdays.length > 0 && (
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-pink-600" />
                <span>{"Próximos Cumpleaños"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reviewDashboard.upcomingBirthdays.map((volunteer) => (
                  <div key={volunteer.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {volunteer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(volunteer.birthday), "dd 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600">
                        {
                          Math.ceil(
                            (new Date(
                              new Date().getFullYear(),
                              parseISO(volunteer.birthday).getMonth(),
                              parseISO(volunteer.birthday).getDate(),
                            ).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                          )
                        } días
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
