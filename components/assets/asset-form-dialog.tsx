'use client'

import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateAsset, useUpdateAsset } from '@/hooks/use-assets'
import { Asset } from '@/types'
import { ASSET_TYPES, CURRENCIES } from '@/lib/constants'
import { useTranslation } from '@/lib/i18n'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  FormDescription,
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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.number().optional().nullable(),
  unit_price: z.number().optional().nullable(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  currency: z.enum(['TRY', 'USD', 'EUR']),
  purchase_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

type AssetFormData = z.infer<typeof assetSchema>

interface AssetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset?: Asset | null
}

export function AssetFormDialog({ open, onOpenChange, asset }: AssetFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const isEditing = !!asset

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type: asset?.type || 'bank',
      name: asset?.name || '',
      quantity: asset?.quantity || null,
      unit_price: asset?.unit_price || null,
      amount: asset?.amount || 0,
      currency: asset?.currency || 'TRY',
      purchase_date: asset?.purchase_date || null,
      notes: asset?.notes || null,
    },
  })

  const assetType = useWatch({ control: form.control, name: 'type' })
  const quantity = useWatch({ control: form.control, name: 'quantity' })
  const unitPrice = useWatch({ control: form.control, name: 'unit_price' })
  
  // Asset types that support quantity × unit_price calculation
  const supportsQuantity = ['gold', 'stock', 'crypto'].includes(assetType)

  // Auto-calculate amount when quantity or unit_price changes
  useEffect(() => {
    if (supportsQuantity && quantity && unitPrice) {
      form.setValue('amount', quantity * unitPrice)
    }
  }, [quantity, unitPrice, supportsQuantity, form])

  // Form değerlerini asset değiştiğinde güncelle
  useEffect(() => {
    if (asset) {
      form.reset({
        type: asset.type,
        name: asset.name,
        quantity: asset.quantity,
        unit_price: asset.unit_price,
        amount: asset.amount,
        currency: asset.currency,
        purchase_date: asset.purchase_date,
        notes: asset.notes,
      })
    }
  }, [asset, form])

  const onSubmit = async (data: AssetFormData) => {
    setLoading(true)
    try {
      const submitData = {
        ...data,
        quantity: supportsQuantity ? data.quantity : null,
        unit_price: supportsQuantity ? data.unit_price : null,
      }
      
      if (isEditing && asset) {
        await updateAsset.mutateAsync({
          id: asset.id,
          ...submitData,
        })
      } else {
        await createAsset.mutateAsync(submitData)
      }
      onOpenChange(false)
      form.reset({
        type: 'bank',
        name: '',
        quantity: null,
        unit_price: null,
        amount: 0,
        currency: 'TRY',
        purchase_date: null,
        notes: null,
      })
    } catch (error) {
      console.error('Asset operation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUnitLabel = () => {
    switch (assetType) {
      case 'gold': return t('assets.units.gram')
      case 'stock': return t('assets.units.shares')
      case 'crypto': return t('assets.units.coins')
      default: return t('assets.units.units')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('assets.editAsset') : t('assets.addAsset')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('assets.editDescription')
              : t('assets.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('assets.type')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('assets.selectType')} />
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
                  <FormLabel>{t('assets.name')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('assets.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {supportsQuantity && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('assets.quantity')} ({getUnitLabel()})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.001"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('assets.unitPrice')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('assets.currentPricePerUnit')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {supportsQuantity ? t('assets.totalValue') : t('assets.amount')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        readOnly={supportsQuantity && !!quantity && !!unitPrice}
                        className={supportsQuantity && quantity && unitPrice ? 'bg-muted' : ''}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    {supportsQuantity && (
                      <FormDescription>
                        {quantity && unitPrice
                          ? t('assets.calculatedFromQuantity')
                          : t('assets.enterManuallyOrUseQuantity')}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.currency')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.select')} />
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

            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('assets.purchaseDate')}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('assets.notesPlaceholder')}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('common.loading') : isEditing ? t('common.save') : t('common.add')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
