'use client'

import {useEffect, useMemo, useState, useTransition} from "react"
import {X, Search} from "lucide-react"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Volunteer} from "@prisma/client"
import {VolunteerSelectableCard} from "@/features/attendances/components/volunteer-selectable-card";
import {markAttendanceOfVolunteer} from "@/features/attendances/actions/mark-attendance-of-volunteer";
import {useRouter} from "next/navigation";

interface Props {
  open: boolean
  onClose: () => void
  volunteers: Volunteer[]
}

export function VolunteersFreeDayModal({
                                         open,
                                         onClose,
                                         volunteers,
                                       }: Props) {
  const [search, setSearch] = useState("")
  const [mounted, setMounted] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  const [isPending, startTransition] = useTransition();
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setMounted(true)

      // 🔑 fuerza un frame antes de animar
      requestAnimationFrame(() => {
        setAnimateIn(true)
      })
    } else {
      setAnimateIn(false)

      const timeout = setTimeout(() => {
        setMounted(false)
      }, 250)

      return () => clearTimeout(timeout)
    }
  }, [open])

  const filteredVolunteers = useMemo(() => {
    if (search.trim().length < 3) return []
    const term = search.toLowerCase()
    return volunteers.filter(v =>
      v.name.toLowerCase().includes(term)
    )
  }, [search, volunteers])

  if (!mounted) return null

  const markAssistance = (volunteerId: string, status: "Present" | "Absent" | "Justified" | "Late") => {
    const now = new Date();
    const payload = {
      date: now.toISOString(),
      status,
    }
    if (isPending) {
      return;
    }
    startTransition(async () => {
      const response = await markAttendanceOfVolunteer(volunteerId, payload)
      if (!response.success) {
        return
      }
      router.refresh();
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          absolute inset-0 bg-black/40
          transition-opacity duration-300
          ${animateIn ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full max-h-[85vh]
          rounded-t-2xl bg-white p-4
          flex flex-col
          transition-all duration-300 ease-out
          ${animateIn
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">
            Buscar voluntarios
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5"/>
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredVolunteers.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-6 animate-pulse">
              Escribe el nombre del voluntario
            </p>
          ) : (
            filteredVolunteers.map((v) => (
              <VolunteerSelectableCard
                key={v.id}
                volunteer={v}
                onConfirm={() => markAssistance(v.id, 'Present')}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
