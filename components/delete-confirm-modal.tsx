"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDeleteModalStore } from "@/lib/delete-modal-store"

export default function DeleteConfirmationModal() {
  const { isOpen, title, description, onConfirm, closeModal } = useDeleteModalStore()

  const handleDelete = async () => {
    if (!onConfirm) {
      return
    }
    await onConfirm()
    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className='bg-white border-2 border-purple-200 '>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Cancelar
          </Button>
          <Button onClick={handleDelete}
            className='bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600'
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
