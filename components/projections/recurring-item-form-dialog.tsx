'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateRecurringItem, useUpdateRecurringItem } from '@/hooks/use-recurring-items'

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

interface RecurringItem {
  id: string
  name: string
  type: 'income' | 'expense'
  amount: number
  frequency: 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
}

const recurringItemSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Tutar pozitif olmalı'),
  frequency: z.enum(['monthly', 'yearly']),
  start_date: z.string().min(1, 'Başlangıç tarihi zorunlu'),
  end_date: z.string().optional(),
})

type RecurringItemFormData = z.infer<typeof recurringItemSchema>

interface RecurringItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: RecurringItem | null
  defaultType?: 'income' | 'expense'
}

export function RecurringItemFormDialog({
  open,
  onOpenChange,
  item,
  defaultType = 'income',
}: RecurringItemFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const createItem = useCreateRecurringItem()
  const updateItem = useUpdateRecurringItem()
  const isEditing = !!item

  const today = new Date().toISOString().split('T')[0]

  const form = useForm<RecurringItemFormData>({
    resolver: zodResolver(recurringItemSchema),
    defaultValues: {
      name: item?.name || '',
      type: item?.type || defaultType,
      amount: item?.amount || 0,
      frequency: item?.frequency || 'monthly',
      start_date: item?.start_date || today,
      end_date: item?.end_date || '',
    },
  })

  // Form değerlerini item değiştiğinde güncelle
  if (item && form.getValues('name') !== item.name) {
    form.reset({
      name: item.name,
      type: item.type,
      amount: item.amount,
      frequency: item.frequency,
      start_date: item.start_date,
      end_date: item.end_date || '',
    })
  }

  const onSubmit = async (data: RecurringItemFormData) => {
    setLoading(true)
    try {
      if (isEditing && item) {
        await updateItem.mutateAsync({
          id: item.id,
          ...data,
          end_date: data.end_date || null,
        })
      } else {
        await createItem.mutateAsync({
          ...data,
          end_date: data.end_date || null,
        })
      }
      onOpenChange(false)
      form.reset({
        name: '',
        type: defaultType,
        amount: 0,
        frequency: 'monthly',
        start_date: today,
        end_date: '',
      })
    } catch (error) {
      console.error('Recurring item operation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const itemType = form.watch('type')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Tekrarlayan Kalem Düzenle' : 'Yeni Tekrarlayan Kalem'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Tekrarlayan gelir veya gider kalemini düzenleyin.'
              : 'Maaş, kira gibi düzenli gelir veya gider ekleyin.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İsim *</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Maaş, Kira, Netflix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="income">Gelir</SelectItem>
                        <SelectItem value="expense">Gider</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sıklık *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sıklık seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Aylık</SelectItem>
                        <SelectItem value="yearly">Yıllık</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tutar (₺) *</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlangıç Tarihi *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitiş Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
