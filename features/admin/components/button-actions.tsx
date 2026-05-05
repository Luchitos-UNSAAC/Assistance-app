"use client"

import {
  ArchiveIcon,
  Calendar,
  MailCheckIcon,
  MoreHorizontalIcon,
  UserIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInitialAttendanceModal } from "@/features/admin/stores/use-Initial-attendance-modal"
import { VolunteerWithAttendancesByStatus } from "@/features/admin/actions/get-volunteers-with-attendances-for-admin"
import { useRouter } from "next/navigation"
import { useVolunteerGroupModal } from "@/features/admin/stores/use-volunteer-group-modal"
import { useChangeUserRoleModal } from "@/features/admin/stores/use-change-user-role-modal"
import { cn } from "@/lib/utils"

interface ButtonActionsProps {
  volunteer: VolunteerWithAttendancesByStatus
}

export const ButtonActions = ({ volunteer }: ButtonActionsProps) => {
  const router = useRouter()
  const openInitialAttendanceModal = useInitialAttendanceModal((s) => s.open)
  const openScheduleVolunteerModal = useVolunteerGroupModal((s) => s.open)
  const openChangeUserRoleModal = useChangeUserRoleModal((s) => s.open)

  // Estilo común para los iconos de los items
  const iconStyles = "mr-2 h-4 w-4 text-muted-foreground/80"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent hover:text-accent-foreground rounded-full"
          aria-label="Abrir opciones de voluntario"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 border-border/50 bg-popover/95 backdrop-blur-md shadow-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => openScheduleVolunteerModal(volunteer)}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            <Calendar className={iconStyles} />
            <span className="font-medium">Horarios</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => openInitialAttendanceModal(volunteer)}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            <MailCheckIcon className={iconStyles} />
            <span className="font-medium">Primeras asistencias</span>
          </DropdownMenuItem>

          {volunteer.user && (
            <DropdownMenuItem
              onClick={() =>
                openChangeUserRoleModal({
                  id: volunteer.user!.id,
                  role: volunteer.user!.role,
                  name: volunteer.user!.name,
                })
              }
              className="cursor-pointer focus:bg-primary/10 focus:text-primary"
            >
              <UserIcon className={cn(iconStyles, "text-primary/70")} />
              <span className="font-semibold">Cambiar rol</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => router.push(`/admin/volunteers/${volunteer.id}/attendances`)}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            <ArchiveIcon className={iconStyles} />
            <span className="font-medium">Ver fechas</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
