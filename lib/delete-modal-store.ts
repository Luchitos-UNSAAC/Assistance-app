import { create } from "zustand"

interface DeleteModalState {
  isOpen: boolean
  title: string
  description: string
  onConfirm: (() => Promise<void>) | null
  openModal: (title: string, description: string, onConfirm: () => Promise<void>) => void
  closeModal: () => void
}

export const useDeleteModalStore = create<DeleteModalState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  onConfirm: null,
  openModal: (title, description, onConfirm) =>
    set({ isOpen: true, title, description, onConfirm }),
  closeModal: () =>
    set({ isOpen: false, title: "", description: "", onConfirm: null }),
}))
