"use client"

import { Volunteer } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {User, Mail, Plus} from "lucide-react"
import { InfoRow } from "@/components/info-row"
import {useTransition} from "react";
import {
  addNewVolunteerToCurrentVolunteerGroup
} from "@/features/volunteers/actions/add-volunteer-to-current-volunteer-group";
import {useToast} from "@/hooks/use-toast";

interface VolunteerNewModalProps {
  isOpen: boolean
  onClose: () => void
  newVolunteers: Volunteer[]
}

export default function VolunteerNewModal({
                                            isOpen,
                                            onClose,
                                            newVolunteers,
                                          }: VolunteerNewModalProps) {
  const [pending, startTransition] = useTransition()
  const {toast} = useToast()
  
  const onAddVolunteer = (id: string) => {
    if (pending) return
    startTransition(async ()=>{
      const response = await addNewVolunteerToCurrentVolunteerGroup(id)
      if (response.success) {
        toast({
          title: "Voluntario agregado",
          description: `El voluntario ha sido agregado exitosamente.`,
        })
        onClose()
      } else {
        toast({
          title: "Error",
          description: response.message || "Ocurrió un error al agregar el voluntario.",
          variant: "destructive",
        })
      }
    })
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-2 border-purple-200">
        <DialogHeader>
          wss<DialogTitle className="text-xl font-semibold">Nuevos Voluntarios</DialogTitle>
          <DialogDescription>
            Aquí puedes revisar los voluntarios que aún faltan agregar al sistema.
          </DialogDescription>
        </DialogHeader>
        
        {newVolunteers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            No hay voluntarios nuevos pendientes.
          </div>
        ) : (
          <div className="space-y-4">
            {newVolunteers.map((volunteer) => (
              <Card key={volunteer.id} className="border shadow-sm">
                <CardContent className="p-3 space-y-2">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex justify-around items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
                          <Badge variant="destructive" className="text-xs px-2 py-0.5">
                            No agregado
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Button className="gradient-button text-white"
                                onClick={() => onAddVolunteer(volunteer.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-700 mt-2">
                    <InfoRow icon={Mail} text={volunteer.email} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
