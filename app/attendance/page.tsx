"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVolunteerStore, useAttendanceStore, type Attendance } from "@/lib/store"
import { Plus, Calendar, Edit, Trash2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import AttendanceModal from "@/components/attendance-modal"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"

export default function AttendancePage() {
  const volunteers = useVolunteerStore((state) => state.volunteers)
  const attendances = useAttendanceStore((state) => state.attendances)
  const deleteAttendance = useAttendanceStore((state) => state.deleteAttendance)
  const { toast } = useToast()

  const [selectedDate, setSelectedDate] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)

  const filteredAttendances = attendances
    .filter((attendance) => {
      const dateMatch = !selectedDate || attendance.date === selectedDate
      const statusMatch = statusFilter === "all" || attendance.status === statusFilter
      return dateMatch && statusMatch
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance)
    setIsModalOpen(true)
  }

  const handleDelete = (attendanceId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
      deleteAttendance(attendanceId)
      toast({
        title: "Registro eliminado",
        description: "El registro de asistencia ha sido eliminado exitosamente.",
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingAttendance(null)
  }

  // Get unique dates for filter
  const uniqueDates = [...new Set(attendances.map((a) => a.date))].sort().reverse()

  return (
    <AuthGuard requiredRole="MANAGER">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Asistencias</h1>
          <Button onClick={() => setIsModalOpen(true)} className="gradient-button text-white">
            <Plus className="h-4 w-4 mr-2" />
            Registrar
          </Button>
        </div>

        {/* Filters */}
        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por fecha</label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="bg-white/80">
                    <SelectValue placeholder="Todas las fechas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    {uniqueDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Present">Presente</SelectItem>
                    <SelectItem value="Absent">Ausente</SelectItem>
                    <SelectItem value="Justified">Justificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <div className="space-y-4">
          {filteredAttendances.map((attendance) => {
            const volunteer = volunteers.find((v) => v.id === attendance.volunteerId)
            if (!volunteer) return null

            return (
              <Card key={attendance.id} className="gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(attendance.date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(attendance.date), "EEEE", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
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
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => handleEdit(attendance)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(attendance.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredAttendances.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron registros de asistencia</p>
          </div>
        )}

        <AttendanceModal isOpen={isModalOpen} onClose={handleModalClose} attendance={editingAttendance} />
      </div>
    </AuthGuard>
  )
}
