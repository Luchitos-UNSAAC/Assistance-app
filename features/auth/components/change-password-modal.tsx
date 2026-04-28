"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { changePassword } from "@/features/auth/actions/change-password";

interface ChangePasswordModalProps {
  isOpen: boolean
}

export const ChangePasswordModal = ({
                                      isOpen,
                                    }: ChangePasswordModalProps) => {
  const router = useRouter()
  const { toast } = useToast()

  const [pending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  // Estados del formulario
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [birthday, setBirthday] = useState("")

  // Estado para visibilidad de contraseña
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  const disabled = isLoading || pending

  // Validación extendida
  const isValid =
    newPassword.length >= 6 &&
    newPassword === confirmPassword &&
    birthday !== ""

  const handleSubmit = () => {
    if (!isValid || disabled) return

    startTransition(async () => {
      try {
        setIsLoading(true)
        const birthdayDate = new Date(birthday)
        // Ahora incluimos birthday en la acción
        const response = await changePassword(newPassword, birthdayDate)

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
        setBirthday("")
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-800">
              ¿Eres nuevo?
            </h2>
            <p className="text-sm text-gray-500">
              Personaliza tu cuenta para continuar.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Fecha de Nacimiento */}
          <div className="space-y-2">
            <Label htmlFor="birthday">Fecha de nacimiento</Label>
            <div className="relative">
              <Input
                id="birthday"
                type="date"
                disabled={disabled}
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                disabled={disabled}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
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
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || disabled}
            className="w-full sm:min-w-[140px]"
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isLoading ? "Actualizando..." : "Actualizar datos"}
          </Button>
        </div>
      </div>
    </div>
  )
}
