'use client'

import { useState } from "react"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {Volunteer} from "@prisma/client";
import {VolunteersFreeDayModal} from "@/features/attendances/components/volunteers-free-day-modal";

interface Props {
  volunteersFreeDaySetting: Volunteer[]
  isPossibleToMarkAttendances: boolean;
}

export function VolunteersFreeDaySetting({ volunteersFreeDaySetting, isPossibleToMarkAttendances }: Props) {
  const [open, setOpen] = useState(false)

  if (volunteersFreeDaySetting.length === 0) {
    return;
  }

  return (
    <>
      {/* Cortina / anchor */}
      {
        isPossibleToMarkAttendances && <>
          <div
            onClick={() => setOpen(true)}
            className="w-full rounded-xl border border-fuchsia-700 bg-white px-3 py-1 shadow-sm active:scale-[0.98] transition animate-pulse"
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="text-sm font-semibold text-fuchsia-500">
                    Dia libre
                  </p>
                  <p className="text-xs text-fuchsia-400">
                    Aqui encuentra a los voluntarios que no estan en la lista
                  </p>
                </div>
              </div>

              <Button size="icon" variant="ghost">
                <Plus className="h-5 w-5 text-fuchsia-500" />
              </Button>
            </div>
          </div>

          {/* Modal */}
          <VolunteersFreeDayModal
            open={open}
            onClose={() => setOpen(false)}
            volunteers={volunteersFreeDaySetting}
          />
        </>
      }

    </>
  )
}
