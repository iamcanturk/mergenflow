'use client'

import { Transaction } from '@/types'
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

interface DeleteTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  onConfirm: () => void
  loading?: boolean
}

export function DeleteTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onConfirm,
  loading,
}: DeleteTransactionDialogProps) {
  if (!transaction) return null

  const typeLabel = transaction.type === 'income' ? 'geliri' : 'gideri'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>İşlemi Sil</AlertDialogTitle>
          <AlertDialogDescription>
            Bu {typeLabel} (<strong>₺{transaction.amount.toLocaleString('tr-TR')}</strong>)
            silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Siliniyor...' : 'Sil'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
