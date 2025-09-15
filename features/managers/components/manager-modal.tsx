"use client"

import React, {useTransition} from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Volunteer } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import {useRouter} from "next/navigation";
import {editManagerById} from "@/features/managers/actions/edit-manager-by-id";
import {addManager} from "@/features/managers/actions/add-manager";

interface VolunteerModalProps {
  isOpen: boolean
  onClose: () => void
  volunteer?: Volunteer
}

export default function ManagerModal({ isOpen, onClose, volunteer }: VolunteerModalProps) {
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dni: "",
    dayOfWeek: "",
    address: "",
    birthday: "",
    status: "Active" as "Active" | "Inactive" | "Suspended",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (volunteer) {
      setFormData({
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        dni: volunteer.dni || "",
        address: volunteer.address,
        birthday: volunteer.birthday,
        status: volunteer.status,
        dayOfWeek: "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        dni: "",
        address: "",
        birthday: "",
        status: "Active",
        dayOfWeek: "",
      })
    }
    setErrors({})
  }, [volunteer, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    }
    
    if (!formData.dni.trim()) {
      newErrors.dni = "El DNI es requerido"
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es requerida"
    }

    if (!formData.birthday) {
      newErrors.birthday = "La fecha de nacimiento es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (volunteer) {
      startTransition(async ()=>{
        const body = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dni: formData.dni,
          address: formData.address,
          birthday: formData.birthday,
          status: formData.status,
        }
        const volunteerId = volunteer.id
        const response = await editManagerById(volunteerId, body)
        if (!response.success) {
          toast({
            title: "Error",
            description: response.message || "Ocurrió un error al actualizar el encargado.",
            variant: "destructive",
          })
          return
        }
        router.refresh()
        toast({
          title: "Encargado actualizado",
          description: "Los datos del encargado han sido actualizados exitosamente.",
        })
      })
    } else {
      startTransition(async ()=>{
        const body = {
          name: formData.name,
          email: formData.email,
          dni: formData.dni,
          phone: formData.phone,
          address: formData.address,
          birthday: formData.birthday,
          status: formData.status,
          dayOfWeek: formData.dayOfWeek,
        }
        const response = await addManager(body)
        if (!response.success) {
          toast({
            title: "Error",
            description: response.message || "Ocurrió un error al agregar el encargado.",
            variant: "destructive",
          })
          return
        }
        router.refresh()
        toast({
          title: "Encargado agregado",
          description: "El encargado ha sido agregado exitosamente.",
        })
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-purple-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{volunteer ? "Editar Encargado" : "Agregar Encargado"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
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
              placeholder="ejemplo@unsaac.edu"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <Label htmlFor="phone">DNI</Label>
            <Input
              id="dni"
              value={formData.dni}
              disabled={pending}
              onChange={(e) => handleInputChange("dni", e.target.value)}
              placeholder="787878787"
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
              disabled={pending}
              value={formData.birthday}
              onChange={(e) => handleInputChange("birthday", e.target.value)}
              className={errors.birthday ? "border-red-500" : ""}
            />
            {errors.birthday && <p className="text-sm text-red-500 mt-1">{errors.birthday}</p>}
          </div>
          
          <div>
            <Label htmlFor="dayOfWeek">Dia de la semana</Label>
            <Select
              value={formData.dayOfWeek}
              onValueChange={(value: any) => handleInputChange("dayOfWeek", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LUNES">LUNES</SelectItem>
                <SelectItem value="MARTES">MARTES</SelectItem>
                <SelectItem value="MIERCOLES">MIERCOLES</SelectItem>
                <SelectItem value="JUEVES">JUEVES</SelectItem>
                <SelectItem value="VIERNES">VIERNES</SelectItem>
                <SelectItem value="SABADO">SABADO</SelectItem>
                <SelectItem value="DOMINGO">DOMINGO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}
            disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-button text-white"
                    disabled={pending}>
              {volunteer ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
