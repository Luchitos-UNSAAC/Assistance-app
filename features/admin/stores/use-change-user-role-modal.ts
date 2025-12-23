import { create } from "zustand"
import { User } from "@prisma/client"

type ChangeUserRoleModalStore = {
  isOpen: boolean
  user: Pick<User, "id" | "role" | "name"> | null
  open: (user: Pick<User, "id" | "role" | "name">) => void
  close: () => void
}

export const useChangeUserRoleModal =
  create<ChangeUserRoleModalStore>((set) => ({
    isOpen: false,
    user: null,

    open: (user) =>
      set({
        isOpen: true,
        user,
      }),

    close: () =>
      set({
        isOpen: false,
        user: null,
      }),
  }))
