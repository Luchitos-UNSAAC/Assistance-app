"use client"

import {useState, useTransition} from "react"
import {useRouter} from "next/navigation"
import {Loader2, Lock} from "lucide-react"

import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {useToast} from "@/hooks/use-toast"
import {changePassword} from "@/features/auth/actions/change-password";

interface ChangePasswordModalProps {
  isOpen: boolean
}

export const ChangePasswordModal = ({
                                      isOpen
                                    }: ChangePasswordModalProps) => {
  const router = useRouter()
  const {toast} = useToast()

  const [pending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  // Estados del formulario
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  if (!isOpen) return null

  const disabled = isLoading || pending
  const isValid =
    newPassword.length >= 6 &&
    newPassword === confirmPassword

  const handleSubmit = () => {
    if (!isValid || disabled) return

    startTransition(async () => {
      try {
        setIsLoading(true)

        const response = await changePassword(newPassword)

        if (response?.error) {
          toast({
            title: "Error",
            description: response.error || "La contraseña actual es incorrecta",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "¡Éxito!",
          description: "Tu contraseña ha sido actualizada",
        })

        // Limpiar campos y cerrar
        setNewPassword("")
        setConfirmPassword("")
        close()
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !disabled && close()}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Lock className="w-5 h-5 text-primary"/>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-800">
              Eres nuevo?
            </h2>
            <p className="text-sm text-gray-500">
              Asegúrate de usar una clave segura
            </p>
            <p className="text-sm font-bold text-gray-500">
              Cambia tu contraseña a uno personalizado
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Mínimo 6 caracteres"
              disabled={disabled}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repite la contraseña"
              disabled={disabled}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {newPassword !== confirmPassword && confirmPassword.length > 0 && (
              <p className="text-[12px] text-red-500 font-medium">Las contraseñas no coinciden</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={close}
            disabled={disabled}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || disabled}
            className="min-w-[140px]"
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            )}
            {isLoading ? "Actualizando..." : "Cambiar clave"}
          </Button>
        </div>
      </div>
    </div>
  )
}
