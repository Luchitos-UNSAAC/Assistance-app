"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {useAttendanceStore, Volunteer} from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {User, Mail, Edit, Phone, MapPin, Calendar, BarChart3} from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import {Badge} from "@/components/ui/badge";
import {format, parseISO} from "date-fns";
import {es} from "date-fns/locale";
import VolunteerModal from "@/features/volunteers/components/volunteer-modal";
import UserMenu from "@/components/user-menu";

interface ProfileProps{
  volunteer: Volunteer
}

export default function Profile({ volunteer }: ProfileProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const attendances = useAttendanceStore((state) => state.attendances)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <User className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No se encontró tu perfil de usuario</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Ir al inicio
        </Button>
      </div>
    )
  }

  const attendanceStats = {
    present: volunteer.attendances.filter((a) => a.status === "Present").length,
    absent: volunteer.attendances.filter((a) => a.status === "Absent").length,
    justified: volunteer.attendances.filter((a) => a.status === "Justified").length,
    total: volunteer.attendances.length,
  }

  const missingData =
    !volunteer.dni?.trim() || !volunteer.address?.trim();

  return (
    <AuthGuard requiredRole="VOLUNTEER">
      <div className="p-4 space-y-6">

        {/* Profile Card */}
        <Card className="gradient-card">
          <CardContent className="p-6">
            {
              missingData && <div className="w-full">
              <span className="text-red-400 animate-pulse text-sm text-end">
                Completar datos 🛑
              </span>
              </div>
            }
            <div className="flex items-center space-x-4 mb-6">
              <UserMenu justImage={true} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
                <Badge
                  variant={volunteer.status === "Active" ? "default" : "secondary"}
                  className={volunteer.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {volunteer.status === "Active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{volunteer.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {
                    volunteer.phone
                      ? <span className="text-gray-700">{volunteer.phone}</span>
                      : <span className="text-gray-400 text-sm">No registrado</span>
                  }

                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {
                    volunteer.address
                      ? <span className="text-gray-700">{volunteer.address}</span>
                      : <span className="text-gray-400 text-sm">No registrado</span>
                  }
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  {
                    volunteer?.birthday
                      ? <span className="text-gray-700">
                    {format(parseISO(volunteer?.birthday), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                      : <span className="text-gray-400 text-sm">No registrado</span>
                  }

                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Mis Estadísticas de Asistencia</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                <p className="text-sm text-green-700">Presente</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                <p className="text-sm text-red-700">Ausente</p>
              </div>
              {/*<div className="text-center p-3 bg-yellow-50 rounded-lg">*/}
              {/*  <p className="text-2xl font-bold text-yellow-600">{attendanceStats.justified}</p>*/}
              {/*  <p className="text-sm text-yellow-700">Justificado</p>*/}
              {/*</div>*/}
            </div>
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Mi Historial de Asistencias</CardTitle>
          </CardHeader>
          <CardContent>
            {volunteer.attendances.length > 0 ? (
              <div className="space-y-3">
                {volunteer.attendances
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((attendance) => (
                    <div key={attendance.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(parseISO(attendance.date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                        <p className="text-sm text-gray-600">
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
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay registros de asistencia</p>
            )}
          </CardContent>
        </Card>

        <VolunteerModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} volunteer={volunteer} />
      </div>
    </AuthGuard>
  )
}
