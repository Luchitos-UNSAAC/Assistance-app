"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {useVolunteerStore, useAttendanceStore, Volunteer} from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, Calendar, BarChart3 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"
import VolunteerModal from "@/features/volunteers/components/volunteer-modal";

interface VolunteerDetailProps {
  volunteer: Volunteer;
}

export default function VolunteerDetail({volunteer}: VolunteerDetailProps) {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, hasPermission } = useAuthStore()
  const volunteerId = params.id as string
  
  const deleteVolunteer = useVolunteerStore((state) => state.deleteVolunteer)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Check if user can access this volunteer profile
  const canAccessProfile = () => {
    if (hasPermission("MANAGER")) return true // Managers can see all profiles
    if (user?.role === "VOLUNTEER" && user.volunteerId === volunteerId) return true // Volunteers can see their own profile
    return false
  }
  
  if (!canAccessProfile()) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tienes permisos para ver este perfil</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }
  
  if (!volunteer) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Voluntario no encontrado</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }
  
  const handleDelete = () => {
    if (confirm("¿Estás seguro de que quieres eliminar este voluntario?")) {
      deleteVolunteer(volunteerId)
      toast({
        title: "Voluntario eliminado",
        description: "El voluntario ha sido eliminado exitosamente.",
      })
      router.push("/volunteers")
    }
  }
  
  const attendanceStats = {
    present: volunteer.attendances.filter((a) => a.status === "Present").length,
    absent: volunteer.attendances.filter((a) => a.status === "Absent").length,
    justified: volunteer.attendances.filter((a) => a.status === "Justified").length,
    total: volunteer.attendances.length,
  }
  
  const canEditProfile = hasPermission("MANAGER")
  const isOwnProfile = user?.role === "VOLUNTEER" && user.volunteerId === volunteerId
  
  return (
    <AuthGuard requiredRole="VOLUNTEER">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button onClick={() => router.back()} variant="ghost" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {canEditProfile && (
            <div className="flex space-x-2">
              <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={handleDelete} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
        
        {/* Profile Card */}
        <Card className="gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{isOwnProfile ? "Mi Perfil" : volunteer.name}</h1>
                <Badge
                  variant={volunteer.status === "Active" ? "default" : "secondary"}
                  className={volunteer.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {volunteer.status === "Active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{volunteer.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{volunteer.phone}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{volunteer.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {format(parseISO(volunteer.birthday), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
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
              <span>{isOwnProfile ? "Mis Estadísticas de Asistencia" : "Estadísticas de Asistencia"}</span>
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
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{attendanceStats.justified}</p>
                <p className="text-sm text-yellow-700">Justificado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Attendance History */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>{isOwnProfile ? "Mi Historial de Asistencias" : "Historial de Asistencias"}</CardTitle>
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
        
        {canEditProfile && (
          <VolunteerModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} volunteer={volunteer} />
        )}
      </div>
    </AuthGuard>
  )
}
