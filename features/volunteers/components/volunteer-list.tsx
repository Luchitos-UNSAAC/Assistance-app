"use client"

import {useState, useTransition} from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {Volunteer, Attendance} from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import {Plus, User, Mail, Phone, MapPin, Pencil, Trash, AlertCircle} from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import {SearchBar} from "@/components/search-bar";
import {InfoRow} from "@/components/info-row";
import {useRouter} from "next/navigation";
import {useDeleteModalStore} from "@/lib/delete-modal-store";
import {deleteVolunteerById} from "@/features/volunteers/actions/delete-volunteer-by-id";
import VolunteerModal from "@/features/volunteers/components/volunteer-modal";

import VolunteerNewModal from "@/features/volunteers/components/volunteer-new-modal";

interface ManagersListProps {
  newVolunteers: Volunteer[]
  volunteers: Volunteer[]
  attendances: Attendance[]
}

export default function VolunteerList({volunteers, attendances, newVolunteers}: ManagersListProps) {
  const { hasPermission } = useAuthStore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const { openModal: openModalToDelete } = useDeleteModalStore()
  
  const filteredVolunteers = volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const getAttendanceStats = (volunteerId: string) => {
    const volunteerAttendances = attendances.filter((a) => a.volunteerId === volunteerId)
    const present = volunteerAttendances.filter((a) => a.status === "Present").length
    const absent = volunteerAttendances.filter((a) => a.status === "Absent").length
    const justified = volunteerAttendances.filter((a) => a.status === "Justified").length
    return { present, absent, justified, total: volunteerAttendances.length }
  }
  
  const canManageVolunteers = hasPermission("MANAGER")
  
  const handleEdit = (id: string) => {
    setSelectedVolunteer(id)
    setIsModalOpen(true)
  }
  
  const handleDelete = async (id: string) => {
    const onDeleteManager = async (id: string) => {
      if (pending) return
      startTransition(async ()=>{
        const response = await deleteVolunteerById(id)
        if (!response.success) {
          toast({
            title: "Error",
            description: response.message || "Ocurrió un error al eliminar el voluntario.",
            variant: "destructive",
          })
        } else {
          router.refresh()
          toast({
            title: "Voluntario eliminado",
            description: "El voluntario ha sido eliminado exitosamente.",
          })
        }
      })
    }
    openModalToDelete(
      "Eliminar voluntario",
      "¿Estás seguro de que deseas eliminar este voluntario? Esta acción no se puede deshacer.",
      async () => {
        return await onDeleteManager(id)
      }
    )
  }
  
  return (
    <AuthGuard requiredRole="MANAGER">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Voluntarios</h1>
          {canManageVolunteers && (
            <div className="flex items-center gap-2">
              {
                newVolunteers.length > 0 && (
                  <Button  onClick={() => setIsNewModalOpen(true)}>
                    <AlertCircle className="h-4 w-4 md:mr-2" />
                    <span className='hidden md:block'> Nuevos: {newVolunteers.length}</span>
                  </Button>
                )
              }
              <Button
                onClick={() => {
                  setSelectedVolunteer(null)
                  setIsModalOpen(true)
                }}
                className="gradient-button text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Search */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre o email..."
        />
        
        {/* Volunteers List */}
        <div className="space-y-4">
          {filteredVolunteers.map((volunteer) => {
            const stats = getAttendanceStats(volunteer.id)
            return (
              <Card
                key={volunteer.id}
                className="gradient-card hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-3 space-y-2">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="hidden md:block p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-sm">
                        <h3 className="font-semibold text-gray-900 leading-tight">{volunteer.name}</h3>
                        {canManageVolunteers && (
                          <div className="flex gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEdit(volunteer.id)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(volunteer.id)}>
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats about the attendances and not attendances */}
                    <div className="flex gap-1">
                      <div className="text-xs px-2 py-1">
                        <span className="text-green-600 font-medium">{stats.present} Presente{stats.present !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="text-xs px-2 py-1">
                        <span className="text-red-600 font-medium">{stats.absent} Deuda{stats.absent !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="text-xs px-2 py-1">
                        <span className="text-yellow-600 font-medium">{stats.justified} Tombola{stats.justified !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                  </div>
                  
                  {/*/!* Volunteer Info *!/*/}
                  {/*<Accordion type="single" collapsible>*/}
                  {/*  <AccordionItem value="personal-info">*/}
                  {/*    <AccordionTrigger className="text-xs text-gray-700">Ver datos personales</AccordionTrigger>*/}
                  {/*    <AccordionContent>*/}
                  {/*      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-700 mt-2">*/}
                  {/*        <InfoRow icon={Mail} text={volunteer.email} />*/}
                  {/*        <InfoRow icon={Phone} text={volunteer.phone} />*/}
                  {/*        <InfoRow icon={MapPin} text={volunteer.address} />*/}
                  {/*      </div>*/}
                  {/*    </AccordionContent>*/}
                  {/*  </AccordionItem>*/}
                  {/*</Accordion>*/}
                  
                  {/*/!* Attendance Summary *!/*/}
                  {/*<div className="flex justify-between items-center border-t pt-2 border-gray-100 text-xs">*/}
                  {/*  <div className="flex gap-2">*/}
                  {/*    <div className="text-green-600 font-medium">*/}
                  {/*      {stats.present} Presente{stats.present !== 1 ? "s" : ""}*/}
                  {/*    </div>*/}
                  {/*    <div className="text-red-600 font-medium">*/}
                  {/*      {stats.absent} Ausente{stats.absent !== 1 ? "s" : ""}*/}
                  {/*    </div>*/}
                  {/*    <div className="text-yellow-600 font-medium">*/}
                  {/*      {stats.justified} Justificado{stats.justified !== 1 ? "s" : ""}*/}
                  {/*    </div>*/}
                  {/*  </div>*/}
                  {/*  <div className="text-gray-400 mt-1">Total: {stats.total}</div>*/}
                  {/*</div>*/}
                </CardContent>
              </Card>
            
            )
          })}
        </div>
        
        {filteredVolunteers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron voluntarios</p>
          </div>
        )}
        
        {/* Volunteer Modal */}
        {canManageVolunteers && (
          <VolunteerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            volunteer={selectedVolunteer ? volunteers.find((v) => v.id === selectedVolunteer) : undefined}
          />
        )}
        
        <VolunteerNewModal
          isOpen={isNewModalOpen}
          onClose={() => {
            setIsNewModalOpen(false)
            router.refresh()
          }}
          newVolunteers={newVolunteers}
        />
      </div>
    </AuthGuard>
  )
}
