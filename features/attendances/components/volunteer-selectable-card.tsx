'use client'

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Volunteer} from "@prisma/client"
import {Check, X} from "lucide-react";

interface Props {
  volunteer: Volunteer
  onConfirm?: (volunteer: Volunteer) => void
}

export function VolunteerSelectableCard({
                                          volunteer,
                                          onConfirm,
                                        }: Props) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      className={`
        rounded-lg border p-3
        transition-all duration-200
        ${confirming ? "bg-fuchsia-50" : "bg-white"}
      `}
    >
      {/* NORMAL STATE */}
      <div
        className={`
          flex items-center justify-between
          transition-all duration-200
          ${confirming ? "opacity-0 scale-95 h-0 overflow-hidden" : "opacity-100 scale-100"}
        `}
        onClick={() => setConfirming(true)}
      >
        <div>
          <p className="text-sm font-medium">{volunteer.name}</p>
          {volunteer.email && (
            <p className="text-xs text-gray-500">
              {volunteer.email}
            </p>
          )}
        </div>

        <span className="text-xs text-gray-400 animate-pulse">
          Seleccionar
        </span>
      </div>

      {/* CONFIRM STATE */}
      <div
        className={`
          flex items-center justify-between gap-2
          transition-all duration-200
          ${confirming ? "opacity-100 scale-100" : "opacity-0 scale-95 h-0 overflow-hidden"}
        `}
      >
        <p className="text-xs text-gray-700">
          ¿Estás seguro?
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirming(false)}
          >
            <X />
          </Button>

          <Button
            size="sm"
            className='bg-fuchsia-700 hover:bg-fuchsia-900'
            onClick={() => onConfirm?.(volunteer)}
          >
            <Check/>
          </Button>
        </div>
      </div>
    </div>
  )
}
