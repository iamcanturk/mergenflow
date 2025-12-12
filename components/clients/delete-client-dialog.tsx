'use client'

import { useDeleteClient } from '@/hooks/use-clients'
import { Client } from '@/types'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
}

export function DeleteClientDialog({ open, onOpenChange, client }: DeleteClientDialogProps) {
  const deleteClient = useDeleteClient()

  async function handleDelete() {
    if (!client) return
    await deleteClient.mutateAsync(client.id)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{client?.company_name}</strong> müşterisini silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
