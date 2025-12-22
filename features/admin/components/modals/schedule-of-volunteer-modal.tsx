"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {useCallback, useEffect, useMemo, useState, useTransition} from "react"
import { Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useVolunteerGroupModal } from "@/features/admin/stores/use-volunteer-group-modal"
import { updateVolunteerGroups } from "@/features/admin/actions/update-volunteer-group"
import { Group } from "@prisma/client"
import {useRouter} from "next/navigation";

interface ScheduleVolunteerModalProps {
  groups: Group[]
}

export const ScheduleVolunteerModal = ({ groups }: ScheduleVolunteerModalProps) => {
  const { isOpen, volunteer, close } = useVolunteerGroupModal()
  const [pending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter();

  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    volunteer?.groupMembers.map((gm) => gm.groupId) ?? []
  )

  useEffect(() => {
    if (volunteer) {
      setSelectedGroups(volunteer.groupMembers.map(gm => gm.groupId))
    }
  }, [volunteer])

  const toggleGroup = useCallback((groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    )
  }, [])

  const groupsByDay = useMemo(() => {
    return groups.reduce<Record<string, Group[]>>((acc, group) => {
      acc[group.dayOfWeek] ??= []
      acc[group.dayOfWeek].push(group)
      return acc
    }, {})
  }, [groups])

  const handleSave = useCallback(() => {
    if (!volunteer?.id) {
      return;
    }
    startTransition(async () => {
      const res = await updateVolunteerGroups(volunteer.id, selectedGroups)

      if (res?.error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar los días",
          variant: "destructive",
        })
        return
      }

      toast({ title: "Días actualizados ✅" })
      close()
      setSelectedGroups([])
      router.refresh()
    })
  }, [volunteer?.id, selectedGroups, toast, close, router])

  if (!isOpen || !volunteer) return null


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !pending && close()}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 space-y-6 shadow-xl">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold">
            Días de participación
          </h2>
          <p className="text-sm text-muted-foreground">
            Selecciona los días en los que el voluntario participa
          </p>
        </div>

        {/* Volunteer */}
        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="font-semibold">{volunteer.name}</p>
          <p className="text-sm text-muted-foreground">
            {volunteer.email}
          </p>
        </div>

        {/* Days */}
        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
          {Object.entries(groupsByDay).map(([day, dayGroups]) => (
            <div key={day} className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">
                {day}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dayGroups.map((group) => {
                  const selected = selectedGroups.includes(group.id)

                  return (
                    <div
                      key={group.id}
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        "cursor-pointer rounded-lg border p-3 flex items-center justify-between transition",
                        selected
                          ? "bg-green-50 border-green-400"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {group.name}
                        </p>
                        {group.description && (
                          <p className="text-xs text-muted-foreground">
                            {group.description}
                          </p>
                        )}
                      </div>

                      {selected && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t md:flex-row flex-col">
          <p className="text-sm text-muted-foreground">
            {selectedGroups.length} días seleccionados
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={close}
              disabled={pending}
            >
              Cancelar
            </Button>

            <Button onClick={handleSave} disabled={pending}>
              {pending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
