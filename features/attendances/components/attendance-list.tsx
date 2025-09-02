"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AttendanceWithVolunteer, VolunteerForSelect } from "@/lib/store"
import { Plus, Calendar, Edit, Trash2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import AttendanceModal from "@/components/attendance-modal"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"
import { useDeleteModalStore } from "@/lib/delete-modal-store"
import { useRouter, useSearchParams } from "next/navigation"
import { deleteAttendanceById } from "@/features/attendances/actions/delete-attendance-by-id"

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface AttendanceListProps {
  attendances: AttendanceWithVolunteer[]
  volunteers: VolunteerForSelect[]
  serverTime: string
  pagination?: Pagination
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export default function AttendanceList({
                                         attendances,
                                         volunteers,
                                         serverTime,
                                         pagination,
                                       }: AttendanceListProps) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<AttendanceWithVolunteer | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openModal: openModalToDelete } = useDeleteModalStore()
  
  // Page / pageSize: priorizamos `pagination` (server) si está presente,
  // si no, leemos query params (fallback).
  const page = pagination?.page ?? Number(searchParams?.get("page") ?? 1)
  const pageSize = pagination?.pageSize ?? Number(searchParams?.get("pageSize") ?? 10)
  const total = pagination?.total ?? attendances.length
  const totalPages = pagination?.totalPages ?? 1
  
  // Filtros (cliente) — siguen actuando sobre los attendances que llegan del server (offset already applied).
  const filteredAttendances = attendances
    .filter((attendance) => {
      const dateMatch = !selectedDate || attendance.date === selectedDate
      const statusMatch = statusFilter === "all" || attendance.status === statusFilter
      return dateMatch && statusMatch
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  // Rangos para mostrar "Mostrando X–Y de TOTAL"
  const startIndex = Math.max(1, (page - 1) * pageSize + 1)
  const endIndex = startIndex + attendances.length - 1 // attendances es lo que trae el servidor en esa página
  
  // Navegación entre páginas
  const goTo = (p: number) => {
    if (p < 1 || (pagination && p > totalPages)) return
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    params.set("page", String(p))
    startTransition(() => {
      router.push(`${window.location.pathname}?${params.toString()}`)
    })
  }
  
  // Cambiar pageSize (reset a página 1)
  const changePageSize = (size: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    params.set("pageSize", String(size))
    params.set("page", "1")
    startTransition(() => {
      router.push(`${window.location.pathname}?${params.toString()}`)
    })
  }
  
  // Refresh manual (botón)
  const handleRefresh = () => {
    if (isPending) return
    startTransition(() => {
      router.refresh()
    })
  }
  
  const handleEdit = (attendance: AttendanceWithVolunteer) => {
    setEditingAttendance(attendance)
    setIsModalOpen(true)
  }
  
  const handleDelete = (attendanceId: string) => {
    const onDeleteAttendance = async (id: string) => {
      if (isPending) return
      startTransition(async () => {
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
  
  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingAttendance(null)
  }
  
  return (
    <AuthGuard requiredRole="MANAGER">
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Asistencias</h1>
            
            {/* Refresh button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isPending}
              aria-label="Refrescar"
              className="h-8 w-8"
            >
              <RotateCcw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* PageSize selector */}
            <div className="flex items-center gap-2 mr-2">
              <span className="text-sm text-gray-600">Mostrar</span>
              <select
                value={pageSize}
                onChange={(e) => changePageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Seleccionar cantidad de registros por página"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            
            <Button onClick={() => setIsModalOpen(true)}
                    size='sm'
                    className="gradient-button text-white">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* (Opcional) espacio para filtros: si quieres los reactivos, los dejamos aquí. */}
        {/* ... puedes re-habilitar tu bloque de filtros comentado si lo deseas ... */}
        
        {/* Info de rango / resumen */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{startIndex}</span>–<span className="font-medium">{endIndex}</span> de{" "}
            <span className="font-medium">{total}</span>
            {filteredAttendances.length !== attendances.length && (
              <span className="ml-2 text-xs text-gray-500">({filteredAttendances.length} en esta página después de filtros)</span>
            )}
          </div>
          
          {/* Controles de paginación */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => goTo(page - 1)}
              disabled={page <= 1 || isPending}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="text-sm">
              Página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages || isPending}
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
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
                        {attendance.status === "Present" ? "Presente" : attendance.status === "Absent" ? "Ausente" : "Justificado"}
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
