"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useVolunteerStore, useAttendanceStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { Plus, Search, User, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import VolunteerModal from "@/components/volunteer-modal"
import AuthGuard from "@/components/auth-guard"

export default function VolunteersPage() {
  const volunteers = useVolunteerStore((state) => state.volunteers)
  const attendances = useAttendanceStore((state) => state.attendances)
  const { user, hasPermission } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter volunteers based on user role
  const getFilteredVolunteers = () => {
    let baseVolunteers = volunteers

    // If user is a volunteer, only show their own record
    if (user?.role === "VOLUNTEER" && user.volunteerId) {
      baseVolunteers = volunteers.filter((v) => v.id === user.volunteerId)
    }

    // Apply search filter
    return baseVolunteers.filter(
      (volunteer) =>
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const filteredVolunteers = getFilteredVolunteers()

  const getAttendanceStats = (volunteerId: string) => {
    const volunteerAttendances = attendances.filter((a) => a.volunteerId === volunteerId)
    const present = volunteerAttendances.filter((a) => a.status === "Present").length
    const absent = volunteerAttendances.filter((a) => a.status === "Absent").length
    const justified = volunteerAttendances.filter((a) => a.status === "Justified").length
    return { present, absent, justified, total: volunteerAttendances.length }
  }

  const canCreateVolunteer = hasPermission("MANAGER")

  return (
    <AuthGuard requiredRole="VOLUNTEER">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === "VOLUNTEER" ? "Mi Perfil" : "Voluntarios"}
          </h1>
          {canCreateVolunteer && (
            <Button onClick={() => setIsModalOpen(true)} className="gradient-button text-white">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          )}
        </div>

        {/* Search - Only show for managers and admins */}
        {user?.role !== "VOLUNTEER" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-white/20"
            />
          </div>
        )}

        {/* Volunteers List */}
        <div className="space-y-4">
          {filteredVolunteers.map((volunteer) => {
            const stats = getAttendanceStats(volunteer.id)
            return (
              <Link key={volunteer.id} href={`/volunteers/${volunteer.id}`}>
                <Card className="gradient-card hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
                          <Badge
                            variant={volunteer.status === "Active" ? "default" : "secondary"}
                            className={volunteer.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {volunteer.status === "Active" ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{volunteer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{volunteer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{volunteer.address}</span>
                      </div>
                    </div>

                    {/* Attendance Summary */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-600 font-medium">
                          {stats.present} Presente{stats.present !== 1 ? "s" : ""}
                        </span>
                        <span className="text-red-600 font-medium">
                          {stats.absent} Ausente{stats.absent !== 1 ? "s" : ""}
                        </span>
                        <span className="text-yellow-600 font-medium">
                          {stats.justified} Justificado{stats.justified !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">Total: {stats.total}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {filteredVolunteers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {user?.role === "VOLUNTEER" ? "No se encontró tu perfil de voluntario" : "No se encontraron voluntarios"}
            </p>
          </div>
        )}

        {canCreateVolunteer && <VolunteerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      </div>
    </AuthGuard>
  )
}
