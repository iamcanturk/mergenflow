'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions'
import { useProjects } from '@/hooks/use-projects'
import { Transaction } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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

const TRANSACTION_TYPES = {
  income: { label: 'Gelir', color: 'text-green-600' },
  expense: { label: 'Gider', color: 'text-red-600' },
}

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Tutar pozitif olmalı'),
  transaction_date: z.string().min(1, 'Tarih zorunlu'),
  project_id: z.string().optional(),
  description: z.string().optional(),
  is_paid: z.boolean(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  defaultType?: 'income' | 'expense'
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  defaultType = 'income',
}: TransactionFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const { data: projects } = useProjects()
  const isEditing = !!transaction

  const today = new Date().toISOString().split('T')[0]

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || defaultType,
      amount: transaction?.amount || 0,
      transaction_date: transaction?.transaction_date || today,
      project_id: transaction?.project_id || '',
      description: transaction?.description || '',
      is_paid: transaction?.is_paid || false,
    },
  })

  // Form değerlerini transaction değiştiğinde güncelle
  if (transaction && form.getValues('amount') !== transaction.amount) {
    form.reset({
      type: transaction.type,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      project_id: transaction.project_id || '',
      description: transaction.description || '',
      is_paid: transaction.is_paid,
    })
  }

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true)
    try {
      if (isEditing && transaction) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          ...data,
          project_id: data.project_id || null,
          description: data.description || undefined,
        })
      } else {
        await createTransaction.mutateAsync({
          ...data,
          project_id: data.project_id || null,
          description: data.description || undefined,
        })
      }
      onOpenChange(false)
      form.reset({
        type: defaultType,
        amount: 0,
        transaction_date: today,
        project_id: '',
        description: '',
        is_paid: false,
      })
    } catch (error) {
      console.error('Transaction operation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const transactionType = form.watch('type')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'İşlemi Düzenle' : 'Yeni İşlem'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'İşlem bilgilerini güncelleyin.'
              : 'Yeni bir gelir veya gider ekleyin.'}
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
                      {Object.entries(TRANSACTION_TYPES).map(([value, { label }]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                name="transaction_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarih *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proje (Opsiyonel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Proje seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Proje yok</SelectItem>
                      {projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="İşlem detayları..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_paid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {transactionType === 'income' ? 'Ödeme Alındı' : 'Ödeme Yapıldı'}
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {transactionType === 'income'
                        ? 'Bu gelirin ödemesi alındı mı?'
                        : 'Bu giderin ödemesi yapıldı mı?'}
                    </p>
                  </div>
                </FormItem>
              )}
            />

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
