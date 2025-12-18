import { create } from "zustand"
import {VolunteerWithAttendancesByStatus} from "@/features/admin/actions/get-volunteers-with-attendances-for-admin";

type InitialAttendanceModalStore = {
  isOpen: boolean
  volunteer: VolunteerWithAttendancesByStatus | null
  open: (volunteerId: VolunteerWithAttendancesByStatus) => void
  close: () => void
}

export const useInitialAttendanceModal =
  create<InitialAttendanceModalStore>((set) => ({
    isOpen: false,
    volunteer: null,

    open: (volunteer) =>
      set({
        isOpen: true,
        volunteer,
      }),

    close: () =>
      set({
        isOpen: false,
        volunteer: null,
      }),
  }))
