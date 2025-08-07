"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAttendanceStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, ArrowLeft, Mail } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import EditProfileModal from "@/components/edit-profile-modal";

export default function VolunteerProfilePage() {
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
  
  const volunteerAttendances = attendances.filter((a) => a.volunteerId === user.volunteerId)
  const stats = {
    present: volunteerAttendances.filter((a) => a.status === "Present").length,
    absent: volunteerAttendances.filter((a) => a.status === "Absent").length,
    justified: volunteerAttendances.filter((a) => a.status === "Justified").length,
    total: volunteerAttendances.length,
  }
  
  return (
    <AuthGuard requiredRole="VOLUNTEER">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>
        </div>
        
        {/* Profile Card */}
        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> <span>{user.email}</span>
              </div>
              {/*{user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}*/}
              {/*{user.address && <p className="text-sm text-gray-600">{user.address}</p>}*/}
            </div>
            
            {/* Edit Button */}
            <Button className="w-full mt-4 gradient-button text-white" onClick={() => setIsEditModalOpen(true)}>
              Editar Perfil
            </Button>
          </CardContent>
        </Card>
        
        {/* Attendance Stats */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-md font-semibold text-gray-900 mb-2">Resumen de Asistencias</h3>
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">{stats.present} Presente{stats.present !== 1 ? "s" : ""}</span>
              <span className="text-red-600 font-medium">{stats.absent} Ausente{stats.absent !== 1 ? "s" : ""}</span>
              <span className="text-yellow-600 font-medium">{stats.justified} Justificado{stats.justified !== 1 ? "s" : ""}</span>
            </div>
            <div className="text-sm text-gray-500 text-right">Total: {stats.total}</div>
          </CardContent>
        </Card>
        
        {/* Edit Modal */}
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      </div>
    </AuthGuard>
  )
}
