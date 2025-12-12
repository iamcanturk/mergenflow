'use client'

import { Asset } from '@/types'
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
import { CURRENCIES } from '@/lib/constants'

interface DeleteAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
  onConfirm: () => void
  loading?: boolean
}

export function DeleteAssetDialog({
  open,
  onOpenChange,
  asset,
  onConfirm,
  loading,
}: DeleteAssetDialogProps) {
  if (!asset) return null

  const currency = CURRENCIES[asset.currency as keyof typeof CURRENCIES]

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Varlığı Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>&quot;{asset.name}&quot;</strong> ({currency.symbol}{asset.amount.toLocaleString('tr-TR')})
            varlığını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
