"use client"

import React, { useTransition, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { addVolunteerWithGroup } from "@/features/volunteers/actions/add-volunteer-with-group"

interface AddVolunteerModalProps {
  isOpen: boolean
  onClose: () => void
}

const WEEK_DAYS = [
  { value: "LUNES", label: "Lunes" },
  { value: "MARTES", label: "Martes" },
  { value: "MIERCOLES", label: "Miércoles" },
  { value: "JUEVES", label: "Jueves" },
  { value: "VIERNES", label: "Viernes" },
  { value: "SABADO_MANIANA", label: "Sábado (mañana)" },
  { value: "SABADO_TARDE", label: "Sábado (tarde)" },
  { value: "DOMINGO", label: "Domingo" },
] as const

const GROUP_ROLES = [
  { value: "LEADER", label: "Líder" },
  { value: "MEMBER", label: "Miembro" },
] as const

const initialState = {
  name: "",
  email: "",
  dni: "",
  phone: "",
  address: "",
  birthday: "",
  status: "Active" as "Active" | "Inactive" | "Suspended",
  dayOfWeek: "",
  groupRole: "",
}

export default function AddVolunteerModal({ isOpen, onClose }: AddVolunteerModalProps) {
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const [formData, setFormData] = useState(initialState)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData(initialState)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "El nombre es requerido"
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido"
    if (!formData.address.trim()) newErrors.address = "La dirección es requerida"
    if (!formData.dni.trim()) newErrors.dni = "El dni es requerido"
    if (!formData.birthday) newErrors.birthday = "La fecha de nacimiento es requerida"
    if (!formData.dayOfWeek) newErrors.dayOfWeek = "Selecciona un día"
    if (!formData.groupRole) newErrors.groupRole = "Selecciona un rol"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    startTransition(async () => {
      const response = await addVolunteerWithGroup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        birthday: formData.birthday,
        status: formData.status,
        dni: formData.dni,
        dayOfWeek: formData.dayOfWeek as any,
        groupRole: formData.groupRole as any,
      })

      if (!response.success) {
        toast({
          title: "Error",
          description: response.message || "Ocurrió un error al agregar el voluntario.",
          variant: "destructive",
        })
        return
      }

      router.refresh()
      toast({
        title: "Voluntario agregado",
        description: "El voluntario ha sido agregado y asignado al grupo exitosamente.",
      })
      handleClose()
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md  border-2 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Voluntario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          <div className="space-y-4 h-[80vh] overflow-y-auto">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={formData.name}
                disabled={pending}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ingresa el nombre completo"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled={pending}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="ejemplo@unsaac.edu.pe"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                type="text"
                value={formData.dni}
                disabled={pending}
                onChange={(e) => handleInputChange("dni", e.target.value)}
                placeholder="909090"
                className={errors.dni ? "border-red-500" : ""}
              />
              {errors.dni && <p className="text-sm text-red-500 mt-1">{errors.dni}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                disabled={pending}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+51 987654321"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                disabled={pending}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Ingresa la dirección"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div>
              <Label htmlFor="birthday">Fecha de nacimiento</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                disabled={pending}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                className={errors.birthday ? "border-red-500" : ""}
              />
              {errors.birthday && <p className="text-sm text-red-500 mt-1">{errors.birthday}</p>}
            </div>

            <div>
              <Label htmlFor="dayOfWeek">Día</Label>
              <Select
                value={formData.dayOfWeek}
                onValueChange={(value) => handleInputChange("dayOfWeek", value)}
                disabled={pending}
              >
                <SelectTrigger id="dayOfWeek" className={errors.dayOfWeek ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona un día" />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dayOfWeek && <p className="text-sm text-red-500 mt-1">{errors.dayOfWeek}</p>}
            </div>

            <div>
              <Label htmlFor="groupRole">Rol dentro del grupo</Label>
              <Select
                value={formData.groupRole}
                onValueChange={(value) => handleInputChange("groupRole", value)}
                disabled={pending}
              >
                <SelectTrigger id="groupRole" className={errors.groupRole ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.groupRole && <p className="text-sm text-red-500 mt-1">{errors.groupRole}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-button text-white" disabled={pending}>
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
