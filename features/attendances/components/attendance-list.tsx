"use client"

import {useState, useTransition} from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {useAttendanceStore, AttendanceWithVolunteer, VolunteerForSelect} from "@/lib/store"
import { Plus, Calendar, Edit, Trash2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import AttendanceModal from "@/components/attendance-modal"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"
import {useDeleteModalStore} from "@/lib/delete-modal-store";
import {useRouter} from "next/navigation";
import {deleteAttendanceById} from "@/features/attendances/actions/delete-attendance-by-id";

interface AttendanceListProps {
  attendances: AttendanceWithVolunteer[]
  volunteers: VolunteerForSelect[]
  serverTime: string
}

export default function AttendanceList({attendances, volunteers, serverTime}: AttendanceListProps) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<AttendanceWithVolunteer | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const filteredAttendances = attendances
    .filter((attendance) => {
      const dateMatch = !selectedDate || attendance.date === selectedDate
      const statusMatch = statusFilter === "all" || attendance.status === statusFilter
      return dateMatch && statusMatch
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  const handleEdit = (attendance: AttendanceWithVolunteer) => {
    setEditingAttendance(attendance)
    setIsModalOpen(true)
  }
  
  const handleDelete = (attendanceId: string) => {
    const onDeleteAttendance = async (id: string) => {
      if (isPending) return
      startTransition(async ()=>{
        const response = await deleteAttendanceById(id)
        if (!response.success) {
          toast({
            title: "Error",
            description: response.message || "Ocurrió un error al eliminar la asistencia.",
            variant: "destructive",
          })
        } else {
          router.refresh()
          toast({
            title: "Asistencia eliminada",
            description: "La asistencia ha sido eliminada exitosamente.",
          })
        }
      })
    }
    openModalToDelete(
      "Eliminar asistencia",
      "¿Estás seguro de que deseas eliminar esta asistencia? Esta acción no se puede deshacer.",
      async () => {
        return await onDeleteAttendance(attendanceId)
      }
    )
  }
  
  const { openModal: openModalToDelete } = useDeleteModalStore()
  
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
        {/*<Card className="gradient-card">*/}
        {/*  <CardContent className="p-4">*/}
        {/*    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
        {/*      <div>*/}
        {/*        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por fecha</label>*/}
        {/*        <Select value={selectedDate} onValueChange={setSelectedDate}>*/}
        {/*          <SelectTrigger className="bg-white/80">*/}
        {/*            <SelectValue placeholder="Todas las fechas" />*/}
        {/*          </SelectTrigger>*/}
        {/*          <SelectContent>*/}
        {/*            <SelectItem value="all">Todas las fechas</SelectItem>*/}
        {/*            {uniqueDates.map((date) => (*/}
        {/*              <SelectItem key={date} value={date}>*/}
        {/*                {format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: es })}*/}
        {/*              </SelectItem>*/}
        {/*            ))}*/}
        {/*          </SelectContent>*/}
        {/*        </Select>*/}
        {/*      </div>*/}
        {/*      <div>*/}
        {/*        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado</label>*/}
        {/*        <Select value={statusFilter} onValueChange={setStatusFilter}>*/}
        {/*          <SelectTrigger className="bg-white/80">*/}
        {/*            <SelectValue />*/}
        {/*          </SelectTrigger>*/}
        {/*          <SelectContent>*/}
        {/*            <SelectItem value="all">Todos los estados</SelectItem>*/}
        {/*            <SelectItem value="Present">Presente</SelectItem>*/}
        {/*            <SelectItem value="Absent">Ausente</SelectItem>*/}
        {/*            <SelectItem value="Justified">Justificado</SelectItem>*/}
        {/*          </SelectContent>*/}
        {/*        </Select>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </CardContent>*/}
        {/*</Card>*/}
        
        {/* Attendance Records */}
        <div className="space-y-4">
          {filteredAttendances.map((attendance) => {
            return (
              <Card key={attendance.id} className="gradient-card">
                <CardContent className="p-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
                    
                    {/* Left: Volunteer + Date */}
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md shrink-0">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-sm leading-snug">
                        <h3 className="font-semibold text-gray-900 truncate max-w-[160px]">
                          {attendance.volunteer.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {format(parseISO(attendance.date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(attendance.date), "hh:mm a", { locale: es })} —{" "}
                          {format(parseISO(attendance.date), "EEEE", { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right: Status + Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium px-2 py-0.5 border ${
                          attendance.status === "Present"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : attendance.status === "Justified"
                              ? "bg-yellow-500 text-white hover:bg-yellow-600"
                              : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        {attendance.status === "Present"
                          ? "Presente"
                          : attendance.status === "Absent"
                            ? "Ausente"
                            : "Justificado"}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEdit(attendance)}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label="Editar asistencia"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(attendance.id)}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-600 hover:text-red-700"
                          aria-label="Eliminar asistencia"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
        
        <AttendanceModal
          serverTime={serverTime}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          volunteers={volunteers}
          attendance={editingAttendance}
        />
      </div>
    </AuthGuard>
  )
}
