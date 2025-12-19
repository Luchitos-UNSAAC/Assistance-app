"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useInitialAttendanceModal } from "@/features/admin/stores/use-Initial-attendance-modal"
import { useState, useTransition } from "react"
import {
  saveInitialAttendance,
  SaveInitialAttendanceBody,
} from "@/features/admin/actions/save-initial-attendance"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export const InitialAttendanceModal = () => {
  const { isOpen, volunteer, close } = useInitialAttendanceModal()

  const [present, setPresent] = useState(0)
  const [late, setLate] = useState(0)
  const [absent, setAbsent] = useState(0)
  const [startDate, setStartDate] = useState("")

  const [pending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (!isOpen || !volunteer) return null

  const total = present + late + absent
  const hasData = total > 0 && !!startDate
  const disabled = isLoading || pending

  const handleInitialAttendance = () => {
    if (disabled) return

    const body: SaveInitialAttendanceBody = {
      present,
      late,
      absent,
      startDate,
      volunteerId: volunteer.id,
    }

    startTransition(async () => {
      try {
        setIsLoading(true)

        const response = await saveInitialAttendance(body)

        if (response?.error) {
          toast({
            title: "Error",
            description: "Intente nuevamente más tarde",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Éxito 🎉",
          description: "Asistencias guardadas correctamente",
        })

        close()
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !disabled && close()}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-800">
            Primeras asistencias 🐶
          </h2>
          <p className="text-sm text-gray-500">
            Registra el historial inicial del voluntario
          </p>
        </div>

        {/* Volunteer info */}
        <div className="rounded-lg bg-gray-50 p-4 border">
          <p className="font-semibold text-gray-800">
            {volunteer.name}
          </p>
          <p className="text-sm text-gray-500">
            {volunteer.email}
          </p>
        </div>

        {/* Current summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs text-gray-500">Presentes</p>
            <p className="text-lg font-bold text-green-700">
              {volunteer.attendances.PRESENT}
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 p-3">
            <p className="text-xs text-gray-500">Tardanzas</p>
            <p className="text-lg font-bold text-yellow-700">
              {volunteer.attendances.LATE}
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xs text-gray-500">Faltas</p>
            <p className="text-lg font-bold text-red-700">
              {volunteer.attendances.ABSENT}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Asistencias</Label>
              <Input
                type="number"
                min={0}
                disabled={disabled}
                value={present}
                onChange={(e) => setPresent(+e.target.value)}
              />
            </div>

            <div>
              <Label>Tardanzas</Label>
              <Input
                type="number"
                min={0}
                disabled={disabled}
                value={late}
                onChange={(e) => setLate(+e.target.value)}
              />
            </div>

            <div>
              <Label>Faltas</Label>
              <Input
                type="number"
                min={0}
                disabled={disabled}
                value={absent}
                onChange={(e) => setAbsent(+e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 border p-3 text-sm">
            Total de registros:{" "}
            <span className="font-semibold">{total}</span>
          </div>

          <div>
            <Label>Fecha aproximada de inicio</Label>
            <Input
              type="date"
              disabled={disabled}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={close}
            disabled={disabled}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleInitialAttendance}
            disabled={!hasData || disabled}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isLoading ? "Guardando..." : "Guardar asistencias"}
          </Button>
        </div>
      </div>
    </div>
  )
}
