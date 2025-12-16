"use client"

import React, {useState, useTransition} from "react"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {VolunteerForSelect, AttendanceWithVolunteer, StatusAttendance} from "@/lib/store"
import {Plus, Calendar, RotateCcw, X, Check, FileText} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"
import {format, parseISO} from "date-fns"
import {es} from "date-fns/locale"
import {useRouter} from "next/navigation"
import AttendanceModal from "@/components/attendance-modal"
import {createAttendancesForToday} from "@/features/attendances/actions/create-attendances-for-today";
import {editAttendanceById} from "@/features/attendances/actions/edit-attendance-by-id";
import UserMenu from "@/components/user-menu";
import {AvatarDog} from "@/components/avatar";
import {cn} from "@/lib/utils";

interface AttendanceListProps {
  volunteers: VolunteerForSelect[]
  serverTime: string
}

export default function AttendanceList({volunteers, serverTime}: AttendanceListProps) {
  const {toast} = useToast()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAttendance, setModalAttendance] = useState<AttendanceWithVolunteer | null>(null)
  const [modalInitialVolunteerId, setModalInitialVolunteerId] = useState<string | null>(null)

  const openCreateModalFor = (volunteerId: string) => {
    setModalInitialVolunteerId(volunteerId)
    setModalAttendance(null)
    setIsModalOpen(true)
  }

  const openEditModalFor = (vol: VolunteerForSelect, newStatus?: StatusAttendance) => {
    const a = vol.attendanceToday
    if (!a) return

    const status = newStatus || a.status

    const attendance: AttendanceWithVolunteer = {
      id: a.id,
      date: a.date,
      status,
      volunteer: {
        id: vol.id,
        name: vol.name,
        email: vol.email,
      },
    }

    setModalAttendance(attendance)
    setModalInitialVolunteerId(null)
    setIsModalOpen(true)
  }

  const markAssistance = (attendanceId: string, volunteerId: string, status: StatusAttendance) => {
    const now = new Date();
    const payload = {
      volunteerId,
      date: now.toISOString(),
      status,
    }
    if (isPending) {
      return;
    }
    startTransition(async () => {
      const response = await editAttendanceById(attendanceId, payload)
      if (!response.success) {
        return
      }
      router.refresh();
    })
  }

  const handleCreateAttendances = () => {
    startTransition(async () => {
      try {
        const res = await createAttendancesForToday()
        if (!res.success) {
          toast({
            title: "Error",
            description: res.message || "No se pudieron crear las asistencias.",
            variant: "destructive",
          })
          return
        }
        toast({
          title: "Asistencias creadas",
          description: res.message,
        })
        router.refresh()
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Error inesperado al crear asistencias.",
          variant: "destructive",
        })
      }
    })
  }


  const handleModalClose = () => {
    setIsModalOpen(false)
    setModalAttendance(null)
    setModalInitialVolunteerId(null)
  }

  const attendancesForTodayIsAlreadyCreated = volunteers.every(v => v.attendanceToday)

  return (
    <AuthGuard requiredRole="MANAGER">
      <div className="pt-20 pb-20">
        <div className="px-3 space-y-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Asistencias de hoy</h1>

            <div className="flex items-center gap-2">
              {!attendancesForTodayIsAlreadyCreated &&
                <Button
                  onClick={handleCreateAttendances}
                  disabled={isPending}
                  className="bg-purple-600 text-white hover:bg-purple-700 animate-pulse"
                >
                  Abrir
                </Button>
              }

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.refresh()}
                aria-label="Refrescar"
              >
                <RotateCcw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}/>
              </Button>
            </div>
          </div>


          {/* Lista de voluntarios */}
          <div className="space-y-1">
            {volunteers.map((vol) => {
              const attendance = vol.attendanceToday
              const attendanceStatus = attendance?.status ?? "No record"

              const badgeText =
                attendanceStatus === "Present"
                  ? "Presente"
                  : attendanceStatus === "Justified"
                    ? "Justificado"
                    : attendanceStatus === "Late"
                      ? "Tarde"
                      : "Ausente"

              const badgeClass =
                attendanceStatus === "Present"
                  ? "bg-green-500 text-white"
                  : attendanceStatus === "Justified"
                    ? "bg-yellow-500 text-white"
                    : attendanceStatus === "Late"
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"

              return (
                <Card key={vol.id} className="gradient-card">
                  <CardContent className="px-3 py-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
                      {/* Left: Volunteer info */}
                      <div className="flex items-start gap-3">
                        {/*<div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md shrink-0">*/}
                        {/*  /!*<Calendar className="h-4 w-4 text-white"/>*!/*/}
                        {/*</div>*/}
                        <AvatarDog
                          avatarUrl={vol?.user?.avatar || undefined}
                          name={vol.name} />
                        <div className="text-sm leading-snug">
                          <h3 className={cn('font-semibold text-gray-900 truncate max-w-[240px]',
                            !attendancesForTodayIsAlreadyCreated && 'truncate max-w-[160px]')}>{vol.name}</h3>
                          <p className="text-xs text-gray-600">{vol.email}</p>
                          {attendance?.date && (
                            <p className="text-xs text-gray-500">
                              {format(parseISO(attendance.date), "hh:mm a — EEEE", {locale: es})}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Status + Actions */}
                      {
                        attendancesForTodayIsAlreadyCreated
                        &&
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 border ${badgeClass}`}>
                            {badgeText}
                          </Badge>

                          {!attendance ? (
                            <Button
                              onClick={() => openCreateModalFor(vol.id)}
                              size="icon"
                              aria-label={`Registrar asistencia de ${vol.name}`}
                              disabled={isPending || loadingId === vol.id}
                              className="h-7 w-7"
                            >
                              <Plus className="h-4 w-4"/>
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => markAssistance(attendance?.id, vol.id, "Present")}
                                variant="outline"
                                size="sm"
                                aria-label={`Marcar asistencia de ${vol.name}`}
                                className="h-7"
                                disabled={attendance.status === "Present" || isPending || loadingId === vol.id}
                              >
                                <Check className="h-4 w-4 text-green-600"/>
                              </Button>

                              <Button
                                onClick={() => markAssistance(attendance?.id, vol.id, "Justified")}
                                variant="outline"
                                size="sm"
                                aria-label={`Registrar permiso de ${vol.name}`}
                                className="h-7"
                                disabled={attendance.status === "Justified" || isPending || loadingId === vol.id}
                              >
                                <FileText className="h-4 w-4 text-yellow-600"/>
                              </Button>
                              <Button
                                onClick={() => markAssistance(attendance?.id, vol.id, "Absent")}
                                variant="outline"
                                size="icon"
                                aria-label={`Marcar ausencia de ${vol.name}`}
                                className="h-7 w-7"
                                disabled={attendance.status === "Absent" || isPending || loadingId === vol.id}
                              >
                                <X className="h-4 w-4 text-red-600"/>
                              </Button>
                            </>
                          )}
                        </div>
                      }

                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {volunteers.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
              <p className="text-gray-500">No hay voluntarios en este grupo</p>
            </div>
          )}

          <AttendanceModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            attendance={modalAttendance}
            volunteers={volunteers}
            serverTime={serverTime}
            initialVolunteerId={modalInitialVolunteerId}
          />
        </div>
      </div>
    </AuthGuard>
  )
}
