"use client"

import {
  ArchiveIcon, Calendar,
  MailCheckIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useInitialAttendanceModal} from "@/features/admin/stores/use-Initial-attendance-modal";
import {VolunteerWithAttendancesByStatus} from "@/features/admin/actions/get-volunteers-with-attendances-for-admin";
import {useRouter} from "next/navigation";
import {useVolunteerGroupModal} from "@/features/admin/stores/use-volunteer-group-modal";

interface ButtonActionsProps {
  volunteer: VolunteerWithAttendancesByStatus
}

export const ButtonActions = ({volunteer}: ButtonActionsProps) => {
  const router = useRouter();
  const openInitialAttendanceModal = useInitialAttendanceModal((s) => s.open)
  const openScheduleVolunteerModal = useVolunteerGroupModal((s) => s.open)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More Options">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-gray-100">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => openScheduleVolunteerModal(volunteer)}
              className='cursor-pointer hover:font-bold'>
              <Calendar />
              Horarios
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openInitialAttendanceModal(volunteer)}
              className='cursor-pointer hover:font-bold'>
              <MailCheckIcon />
              Primeras asist.
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={()=> router.push(`/admin/volunteers/${volunteer.id}/attendances`)}
              className='cursor-pointer hover:font-bold'>
              <ArchiveIcon />
              Ver fechas
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
