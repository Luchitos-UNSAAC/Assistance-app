"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVolunteerStore, useAttendanceStore, type Attendance } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface AttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  attendance?: Attendance | null
}

export default function AttendanceModal({ isOpen, onClose, attendance }: AttendanceModalProps) {
  const volunteers = useVolunteerStore((state) => state.volunteers)
  const addAttendance = useAttendanceStore((state) => state.addAttendance)
  const updateAttendance = useAttendanceStore((state) => state.updateAttendance)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    volunteerId: "",
    date: "",
    status: "Present" as "Present" | "Absent" | "Justified",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (attendance) {
      setFormData({
        volunteerId: attendance.volunteerId,
        date: attendance.date,
        status: attendance.status,
      })
    } else {
      setFormData({
        volunteerId: "",
        date: new Date().toISOString().split("T")[0],
        status: "Present",
      })
    }
    setErrors({})
  }, [attendance, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.volunteerId) {
      newErrors.volunteerId = "Selecciona un voluntario"
    }

    if (!formData.date) {
      newErrors.date = "La fecha es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (attendance) {
      updateAttendance(attendance.id, formData)
      toast({
        title: "Asistencia actualizada",
        description: "El registro de asistencia ha sido actualizado exitosamente.",
      })
    } else {
      addAttendance(formData)
      toast({
        title: "Asistencia registrada",
        description: "El registro de asistencia ha sido guardado exitosamente.",
      })
    }

    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const activeVolunteers = volunteers.filter((v) => v.status === "Active")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-purple-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{attendance ? "Editar Asistencia" : "Registrar Asistencia"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          <div>
            <Label htmlFor="volunteer">Voluntario</Label>
            <Select value={formData.volunteerId} onValueChange={(value) => handleInputChange("volunteerId", value)}>
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
            {errors.volunteerId && <p className="text-sm text-red-500 mt-1">{errors.volunteerId}</p>}
          </div>

          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "Present" | "Absent" | "Justified") => handleInputChange("status", value)}
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-button text-white">
              {attendance ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
