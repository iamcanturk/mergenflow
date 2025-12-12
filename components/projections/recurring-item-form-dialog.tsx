'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateRecurringItem, useUpdateRecurringItem } from '@/hooks/use-recurring-items'
import { useTranslation } from '@/lib/i18n'

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

const createRecurringItemSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, t('projections.recurring.nameValidation')),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(t('projections.recurring.amountValidation')),
  frequency: z.enum(['monthly', 'yearly']),
  start_date: z.string().min(1, t('projections.recurring.startDateRequired')),
  end_date: z.string().optional(),
})

type RecurringItemFormData = z.infer<ReturnType<typeof createRecurringItemSchema>>

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
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const createItem = useCreateRecurringItem()
  const updateItem = useUpdateRecurringItem()
  const isEditing = !!item

  const today = new Date().toISOString().split('T')[0]

  const recurringItemSchema = createRecurringItemSchema(t)

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

  // Update form values when item changes
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('projections.recurring.editTitle') : t('projections.recurring.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('projections.recurring.editDescription')
              : t('projections.recurring.addItemDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('projections.recurring.name')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('projections.recurring.namePlaceholder')} {...field} />
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
                    <FormLabel>{t('projections.recurring.type')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('projections.recurring.selectType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">{t('transactions.income')}</SelectItem>
                        <SelectItem value="expense">{t('transactions.expense')}</SelectItem>
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
                    <FormLabel>{t('projections.recurring.frequency')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('projections.recurring.selectFrequency')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">{t('projections.frequency.monthly')}</SelectItem>
                        <SelectItem value="yearly">{t('projections.frequency.yearly')}</SelectItem>
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
                  <FormLabel>{t('projections.recurring.amount')} (₺) *</FormLabel>
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
                    <FormLabel>{t('projections.recurring.startDate')} *</FormLabel>
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
                    <FormLabel>{t('projections.recurring.endDate')}</FormLabel>
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
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('common.loading') : isEditing ? t('projections.recurring.update') : t('common.add')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
