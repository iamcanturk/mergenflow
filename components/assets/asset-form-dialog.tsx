'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateAsset, useUpdateAsset } from '@/hooks/use-assets'
import { Asset } from '@/types'
import { ASSET_TYPES, CURRENCIES } from '@/lib/constants'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const assetSchema = z.object({
  type: z.enum(['cash', 'bank', 'gold', 'stock', 'crypto']),
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  amount: z.number().min(0, 'Tutar negatif olamaz'),
  currency: z.enum(['TRY', 'USD', 'EUR']),
})

type AssetFormData = z.infer<typeof assetSchema>

interface AssetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset?: Asset | null
}

export function AssetFormDialog({ open, onOpenChange, asset }: AssetFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const isEditing = !!asset

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type: asset?.type || 'bank',
      name: asset?.name || '',
      amount: asset?.amount || 0,
      currency: asset?.currency || 'TRY',
    },
  })

  // Form değerlerini asset değiştiğinde güncelle
  if (asset && form.getValues('name') !== asset.name) {
    form.reset({
      type: asset.type,
      name: asset.name,
      amount: asset.amount,
      currency: asset.currency,
    })
  }

  const onSubmit = async (data: AssetFormData) => {
    setLoading(true)
    try {
      if (isEditing && asset) {
        await updateAsset.mutateAsync({
          id: asset.id,
          ...data,
        })
      } else {
        await createAsset.mutateAsync(data)
      }
      onOpenChange(false)
      form.reset({
        type: 'bank',
        name: '',
        amount: 0,
        currency: 'TRY',
      })
    } catch (error) {
      console.error('Asset operation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Varlığı Düzenle' : 'Yeni Varlık'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Varlık bilgilerini güncelleyin.'
              : 'Yeni bir varlık ekleyin.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tür *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tür seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ASSET_TYPES).map(([value, { label, icon }]) => (
                        <SelectItem key={value} value={value}>
                          <span className="flex items-center gap-2">
                            <span>{icon}</span>
                            <span>{label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İsim *</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Ziraat Bankası, Bitcoin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tutar *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para Birimi *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CURRENCIES).map(([value, { label, symbol }]) => (
                          <SelectItem key={value} value={value}>
                            {symbol} {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
