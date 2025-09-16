"use client"

import React, { useState, useEffect, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Volunteer } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { editManagerById } from "@/features/managers/actions/edit-manager-by-id"
import { addManager } from "@/features/managers/actions/add-manager"
import {
  updateVolunteerToManagerByIdAndDay
} from "@/features/managers/actions/update-volunteer-to-manager-by-id-and-day";

interface VolunteerModalProps {
  isOpen: boolean
  onClose: () => void
  volunteers: Volunteer[]
  volunteer?: Volunteer
}

export default function ManagerModal({ isOpen, onClose, volunteer, volunteers }: VolunteerModalProps) {
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    dni: "",
    dayOfWeek: "",
    address: "",
    birthday: "",
    status: "Active" as "Active" | "Inactive" | "Suspended",
  }
  
  const [formData, setFormData] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [managerId, setManagerId] = useState("") // para convertir a voluntario
  
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
      setFormData(emptyForm)
    }
    setErrors({})
  }, [volunteer, isOpen])
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido"
    if (!formData.email.trim()) newErrors.email = "El email es requerido"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "El email no es válido"
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido"
    if (!formData.dni.trim()) newErrors.dni = "El DNI es requerido"
    if (!formData.address.trim()) newErrors.address = "La dirección es requerida"
    if (!formData.birthday) newErrors.birthday = "La fecha de nacimiento es requerida"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent, type: "add" | "edit") => {
    e.preventDefault()
    if (!validateForm()) return
    
    startTransition(async () => {
      if (type === "edit" && volunteer) {
        const response = await editManagerById(volunteer.id, formData)
        if (!response.success) {
          toast({ title: "Error", description: response.message, variant: "destructive" })
          return
        }
        toast({ title: "Encargado actualizado", description: "Los datos se guardaron correctamente." })
      } else {
        const response = await addManager(formData)
        if (!response.success) {
          toast({ title: "Error", description: response.message, variant: "destructive" })
          return
        }
        toast({ title: "Encargado agregado", description: "Se agregó exitosamente." })
      }
      router.refresh()
      onClose()
    })
  }
  
  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pending) {
      return
    }
    
    if (!managerId.trim()) {
      toast({ title: "Error", description: "Debes ingresar un ID válido.", variant: "destructive" })
      return
    }
    if (!formData.dayOfWeek.trim()) {
      toast({ title: "Error", description: "Debes seleccionar un día de la semana.", variant: "destructive" })
      return
    }
    
    startTransition(async () => {
      const body = {
        volunteerId: managerId,
        day: formData.dayOfWeek as "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO"
      }
      const response = await updateVolunteerToManagerByIdAndDay(body)
      if (!response.success) {
        toast({ title: "Error", description: response.message, variant: "destructive" })
        return
      }
      toast({ title: "Conversión exitosa", description: "El encargado fue convertido en voluntario." })
      router.refresh()
      onClose()
    })
  }
  
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }
  
  const Form = ({ type }: { type: "add" | "edit" }) => (
    <form onSubmit={(e) => handleSubmit(e, type)} className="space-y-4 p-1">
      <div>
        <Label htmlFor="name">Nombre completo</Label>
        <Input id="name" value={formData.name} disabled={pending}
               onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Ingresa el nombre completo"
               className={errors.name ? "border-red-500" : ""} />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} disabled={pending}
               onChange={(e) => handleInputChange("email", e.target.value)} placeholder="ejemplo@unsaac.edu"
               className={errors.email ? "border-red-500" : ""} />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
      
      <div>
        <Label htmlFor="dni">DNI</Label>
        <Input id="dni" value={formData.dni} disabled={pending}
               onChange={(e) => handleInputChange("dni", e.target.value)} placeholder="787878787"
               className={errors.dni ? "border-red-500" : ""} />
        {errors.dni && <p className="text-sm text-red-500">{errors.dni}</p>}
      </div>
      
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" value={formData.phone} disabled={pending}
               onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="+51 987654321"
               className={errors.phone ? "border-red-500" : ""} />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>
      
      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" value={formData.address} disabled={pending}
               onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Ingresa la dirección"
               className={errors.address ? "border-red-500" : ""} />
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>
      
      <div>
        <Label htmlFor="birthday">Fecha de nacimiento</Label>
        <Input id="birthday" type="date" disabled={pending}
               value={formData.birthday} onChange={(e) => handleInputChange("birthday", e.target.value)}
               className={errors.birthday ? "border-red-500" : ""} />
        {errors.birthday && <p className="text-sm text-red-500">{errors.birthday}</p>}
      </div>
      
      <div>
        <Label htmlFor="dayOfWeek">Día de la semana</Label>
        <Select value={formData.dayOfWeek} onValueChange={(value: any) => handleInputChange("dayOfWeek", value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
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
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button type="submit" className="gradient-button text-white" disabled={pending}>
          {type === "edit" ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  )
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-purple-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Gestión de Encargados</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="convert" className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-purple-50">
            <TabsTrigger value="convert">Voluntario</TabsTrigger>
            <TabsTrigger value="add">Nuevo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add">
            <Form type="add" />
          </TabsContent>
          
          <TabsContent value="edit">
            <Form type="edit" />
          </TabsContent>
          
          <TabsContent value="convert">
            <form onSubmit={handleConvert} className="space-y-4 p-1">
              <div>
                <Label htmlFor="managerId">Voluntario</Label>
                <Select value={managerId} onValueChange={(value: any) => setManagerId(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {
                      volunteers.map(volunteer => (
                        <SelectItem key={volunteer.id} value={volunteer.id}>
                          {volunteer.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dayOfWeek">Día de la semana</Label>
                <Select value={formData.dayOfWeek} onValueChange={(value: any) => handleInputChange("dayOfWeek", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
                <Button type="submit" className="gradient-button text-white" disabled={pending}>
                  Convertir
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
