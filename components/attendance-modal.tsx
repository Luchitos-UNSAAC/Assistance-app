// File: components/attendance-modal.tsx
"use client"

import React, { useState, useEffect, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AttendanceWithVolunteer, VolunteerForSelect, StatusAttendance } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { addAttendance } from "@/features/attendances/actions/add-attendance"
import { editAttendanceById } from "@/features/attendances/actions/edit-attendance-by-id"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"

interface AttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  attendance?: AttendanceWithVolunteer | null
  volunteers: VolunteerForSelect[]
  serverTime: string // ISO string
  /**
   * Optional: when opening the modal to CREATE a new attendance we can preselect
   * a volunteer (useful when the + button is shown per item in a list).
   */
  initialVolunteerId?: string | null
}

export default function AttendanceModal({
                                          isOpen,
                                          onClose,
                                          attendance,
                                          volunteers,
                                          serverTime,
                                          initialVolunteerId = null,
                                        }: AttendanceModalProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    volunteerId: "",
    date: "",
    time: "",
    status: "Present" as StatusAttendance,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const formatTime = (iso: string) => format(parseISO(iso), "HH:mm")
  const formatDate = (iso: string) => format(parseISO(iso), "yyyy-MM-dd")
  
  useEffect(() => {
    const initializeForm = () => {
      if (attendance) {
        const parsed = parseISO(attendance.date)
        setFormData({
          volunteerId: attendance.volunteer.id,
          date: format(parsed, "yyyy-MM-dd"),
          time: format(parsed, "HH:mm"),
          status: attendance.status,
        })
      } else {
        setFormData({
          volunteerId: initialVolunteerId ?? "",
          date: formatDate(serverTime),
          time: formatTime(serverTime),
          status: "Present",
        })
      }
      setErrors({})
    }
    
    if (isOpen) initializeForm()
  }, [attendance, isOpen, serverTime, initialVolunteerId])
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.volunteerId) newErrors.volunteerId = "Selecciona un voluntario"
    if (!formData.date) newErrors.date = "La fecha es requerida"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isPending || !validateForm()) return
    
    const combinedDate = new Date(`${formData.date}T${formData.time}:00`)
    
    const payload = {
      volunteerId: formData.volunteerId,
      date: combinedDate.toISOString(),
      status: formData.status,
    }
    
    startTransition(async () => {
      const response = attendance
        ? await editAttendanceById(attendance.id, payload)
        : await addAttendance(payload)
      
      if (!response.success) {
        toast({
          title: "Error",
          description: response.message || "Ocurrió un error al guardar la asistencia.",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: attendance ? "Asistencia actualizada" : "Asistencia registrada",
        description: attendance
          ? "El registro de asistencia ha sido actualizado exitosamente."
          : "El registro de asistencia ha sido guardado exitosamente.",
      })
      
      router.refresh()
      onClose()
    })
  }
  
  const activeVolunteers = volunteers.filter((v) => v.status === "Active")
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-purple-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{attendance ? "Editar Asistencia" : "Registrar Asistencia"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          {/* Voluntario */}
          <div>
            <Label htmlFor="volunteer">Voluntario</Label>
            <Select
              value={formData.volunteerId}
              onValueChange={(value) => handleInputChange("volunteerId", value)}
            >
              <SelectTrigger className={errors.volunteerId ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecciona un voluntario" />
              </SelectTrigger>
              <SelectContent>
                {activeVolunteers.map((volunteer) => (
                  <SelectItem key={volunteer.id} value={volunteer.id}>
                    {volunteer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.volunteerId && (
              <p className="text-sm text-red-500 mt-1">{errors.volunteerId}</p>
            )}
          </div>
          
          {/* Fecha */}
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              disabled
              readOnly
              onChange={(e) => handleInputChange("date", e.target.value)}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date}</p>
            )}
          </div>
          
          {/* Hora del servidor */}
          <div>
            <Label htmlFor="time">Hora</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              disabled
              readOnly
              className="text-gray-600 bg-gray-100 cursor-not-allowed"
            />
          </div>
          
          {/* Estado */}
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: StatusAttendance) =>
                handleInputChange("status", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Present">Presente</SelectItem>
                <SelectItem value="Absent">Ausente</SelectItem>
                <SelectItem value="Justified">Justificado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-button text-white" disabled={isPending}>
              {attendance ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

