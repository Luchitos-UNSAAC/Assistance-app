'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTransition, useState, useEffect } from "react"
import { UserRole, WeekDay } from "@prisma/client"
import { useChangeUserRoleModal } from "@/features/admin/stores/use-change-user-role-modal"
import { updateUserRole } from "@/features/admin/actions/update-user-role"
import { useRouter } from "next/navigation"

const USER_ROLES = [
  { value: UserRole.ADMIN, label: "Administrador" },
  { value: UserRole.MANAGER, label: "Encargado" },
  { value: UserRole.VOLUNTEER, label: "Voluntario" },
]

export function ChangeUserRoleModal() {
  const { isOpen, user, close } = useChangeUserRoleModal()
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLeader, setIsLeader] = useState(false)
  const [leaderDay, setLeaderDay] = useState<WeekDay | null>(null)
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  useEffect(() => {
    if (!user) return

    setRole(user.role)

    if (user.role === UserRole.MANAGER) {
      setIsLeader(true)
    } else {
      setIsLeader(false)
      setLeaderDay(null)
    }
  }, [user])

  if (!user) return null

  const onSave = () => {
    if (!role) return

    if (
      (role === UserRole.MANAGER || isLeader) &&
      !leaderDay
    ) {
      alert("Debes seleccionar el día en el que será encargado")
      return
    }

    startTransition(async () => {
      await updateUserRole(user.id, role, {
        isLeader,
        leaderDay,
      })
      close()
      router.refresh()
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>
            Cambiar rol de {user.name}
          </DialogTitle>
        </DialogHeader>

        {/* ROLES */}
        <div className="space-y-2">
          {USER_ROLES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => {
                setRole(r.value)

                if (r.value === UserRole.MANAGER) {
                  setIsLeader(true)
                }

                if (r.value === UserRole.VOLUNTEER) {
                  setIsLeader(false)
                  setLeaderDay(null)
                }
              }}
              className={`w-full px-4 py-2 rounded-md border text-left transition
                ${role === r.value
                ? "bg-black text-white"
                : "hover:bg-gray-100"}
              `}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* ADMIN: ¿ES ENCARGADO? */}
        {role === UserRole.ADMIN && (
          <div className="pt-4 space-y-2">
            <label className="text-sm font-medium">
              ¿Será encargado de grupo?
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsLeader(true)}
                className={`px-4 py-2 rounded-md border text-sm transition
                  ${isLeader
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"}
                `}
              >
                Sí
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLeader(false)
                  setLeaderDay(null)
                }}
                className={`px-4 py-2 rounded-md border text-sm transition
                  ${!isLeader
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"}
                `}
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* DÍA DE ENCARGADO */}
        {(role === UserRole.MANAGER || isLeader) && (
          <div className="pt-4 space-y-2">
            <label className="text-sm font-medium">
              Día en el que será encargado
            </label>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(WeekDay).map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setLeaderDay(day)}
                  className={`px-3 py-2 rounded-md border text-sm transition
                    ${leaderDay === day
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"}
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={close}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
