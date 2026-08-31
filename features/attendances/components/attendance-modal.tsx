// features/attendance/components/attendance-modal.tsx
"use client"

import React, { useEffect, useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { type Volunteer } from "@/lib/store"
import { getAttendancesByVolunteer } from "@/features/attendances/actions/get-attendances-by-volunteer"
import { addAttendance } from "@/features/attendances/actions/add-attendance-v2"
import { updateAttendance } from "@/features/attendances/actions/update-attendance"

interface AttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  volunteer: Volunteer
}

type AttendanceStatus = "PRESENT" | "ABSENT" | "JUSTIFIED" | "LATE"

interface AttendanceRecord {
  id: string
  date: string | Date
  status: AttendanceStatus
  notes: string | null
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; className: string }[] = [
  { value: "PRESENT", label: "Presente", className: "bg-green-100 text-green-700" },
  { value: "LATE", label: "Tardanza", className: "bg-yellow-100 text-yellow-700" },
  { value: "JUSTIFIED", label: "Inasistencia justificada", className: "bg-blue-100 text-blue-700" },
  { value: "ABSENT", label: "Inasistencia", className: "bg-red-100 text-red-700" },
]

const getStatusMeta = (status: AttendanceStatus) =>
  STATUS_OPTIONS.find((s) => s.value === status)!

const todayStr = () => new Date().toISOString().split("T")[0]

const toDateStr = (date: string | Date) => {
  const d = new Date(date)
  const formatted = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export default function AttendanceModal({ isOpen, onClose, volunteer }: AttendanceModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [date, setDate] = useState(todayStr())
  const [status, setStatus] = useState<AttendanceStatus>("PRESENT")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Registro existente para la fecha seleccionada (evita duplicados)
  const existingForDate = attendances.find((a) => toDateStr(a.date) === date)
  const isEditing = !!existingForDate

  useEffect(() => {
    if (!isOpen) return

    setDate(todayStr())
    setStatus("PRESENT")
    setNotes("")
    setErrors({})

    setLoadingHistory(true)
    getAttendancesByVolunteer(volunteer.id)
      .then((response) => {
        if (response.success) {
          setAttendances(response.data as AttendanceRecord[])
        }
      })
      .finally(() => setLoadingHistory(false))
  }, [isOpen, volunteer.id])

  // Cuando la fecha coincide con un registro existente, precargamos sus datos
  useEffect(() => {
    if (existingForDate) {
      setStatus(existingForDate.status)
      setNotes(existingForDate.notes || "")
    } else {
      setStatus("PRESENT")
      setNotes("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, attendances])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!date) newErrors.date = "Selecciona una fecha"
    if (!status) newErrors.status = "Selecciona un estado"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    startTransition(async () => {
      const response = isEditing
        ? await updateAttendance(existingForDate!.id, { status, notes })
        : await addAttendance({ volunteerId: volunteer.id, date, status, notes })

      if (!response.success) {
        toast({
          title: "Error",
          description: response.message || "Ocurrió un error al registrar la asistencia.",
          variant: "destructive",
        })
        return
      }

      router.refresh()
      toast({
        title: isEditing ? "Asistencia actualizada" : "Asistencia registrada",
        description: isEditing
          ? "El registro de asistencia fue actualizado exitosamente."
          : "La asistencia fue registrada exitosamente.",
      })
      onClose()
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 shadow-2xl dark:bg-black bg-white">
        <DialogHeader>
          <DialogTitle>Registrar asistencia — {volunteer.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              disabled={pending}
              max={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}

            {isEditing && (
              <p className="text-sm text-amber-600 mt-1">
                Ya existe un registro para esta fecha ({getStatusMeta(existingForDate!.status).label}).
                Se actualizará en lugar de duplicarse.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AttendanceStatus)}
              disabled={pending}
            >
              <SelectTrigger id="status" className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
          </div>

          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              disabled={pending}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales..."
              rows={3}
            />
          </div>

          {/* Historial reciente para contexto visual y evitar duplicados a simple vista */}
          <div>
            <Label>Historial reciente</Label>
            <div className="mt-1 max-h-36 overflow-y-auto rounded-md border border-gray-200 divide-y">
              {loadingHistory && (
                <p className="text-sm text-gray-400 p-2">Cargando historial...</p>
              )}
              {!loadingHistory && attendances.length === 0 && (
                <p className="text-sm text-gray-400 p-2">Sin registros previos.</p>
              )}
              {!loadingHistory &&
                attendances.slice(0, 8).map((a) => {
                  const meta = getStatusMeta(a.status)
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between px-2 py-1.5 text-sm"
                    >
                      <span className="text-gray-600">{toDateStr(a.date)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-button text-white" disabled={pending}>
              {isEditing ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
