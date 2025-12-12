'use client'

import { useState } from 'react'
import { useRecurringItems } from '@/hooks/use-projections'
import { useDeleteRecurringItem } from '@/hooks/use-recurring-items'
import { useTranslation } from '@/lib/i18n'
import { format } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'
import { Pencil, Trash2, MoreHorizontal, ArrowUpCircle, ArrowDownCircle, CalendarDays } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RecurringItemFormDialog } from './recurring-item-form-dialog'
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

interface RecurringItem {
  id: string
  name: string
  type: 'income' | 'expense'
  amount: number
  frequency: 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
}

export function RecurringItemsList() {
  const { t, locale } = useTranslation()
  const { data: items, isLoading } = useRecurringItems()
  const deleteItem = useDeleteRecurringItem()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<RecurringItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const dateLocale = locale === 'tr' ? tr : enUS

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleEdit = (item: RecurringItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleDelete = (item: RecurringItem) => {
    setDeletingItem(item)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return

    setDeleteLoading(true)
    try {
      await deleteItem.mutateAsync(deletingItem.id)
      setDeleteOpen(false)
      setDeletingItem(null)
    } catch (error) {
      console.error('Failed to delete recurring item:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">{t('projections.recurring.noItems')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('projections.recurring.addDescription')}
        </p>
      </div>
    )
  }

  const incomeItems = items.filter(i => i.type === 'income')
  const expenseItems = items.filter(i => i.type === 'expense')

  const totalMonthlyIncome = incomeItems
    .filter(i => i.frequency === 'monthly')
    .reduce((sum, i) => sum + Number(i.amount), 0) +
    incomeItems
      .filter(i => i.frequency === 'yearly')
      .reduce((sum, i) => sum + Number(i.amount) / 12, 0)

  const totalMonthlyExpense = expenseItems
    .filter(i => i.frequency === 'monthly')
    .reduce((sum, i) => sum + Number(i.amount), 0) +
    expenseItems
      .filter(i => i.frequency === 'yearly')
      .reduce((sum, i) => sum + Number(i.amount) / 12, 0)

  return (
    <>
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
            <p className="text-muted-foreground">{t('projections.recurring.monthlyIncome')}</p>
            <p className="text-lg font-semibold text-green-600">
              +{formatCurrency(totalMonthlyIncome)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950">
            <p className="text-muted-foreground">{t('projections.recurring.monthlyExpense')}</p>
            <p className="text-lg font-semibold text-red-600">
              -{formatCurrency(totalMonthlyExpense)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
            <p className="text-muted-foreground">{t('projections.recurring.monthlyNet')}</p>
            <p className={`text-lg font-semibold ${totalMonthlyIncome - totalMonthlyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalMonthlyIncome - totalMonthlyExpense >= 0 ? '+' : ''}
              {formatCurrency(totalMonthlyIncome - totalMonthlyExpense)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('projections.recurring.type')}</TableHead>
                <TableHead>{t('projections.recurring.name')}</TableHead>
                <TableHead>{t('projections.recurring.frequency')}</TableHead>
                <TableHead className="text-right">{t('projections.recurring.amount')}</TableHead>
                <TableHead>{t('projections.recurring.dateRange')}</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.type === 'income' ? (
                        <ArrowUpCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={item.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {item.type === 'income' ? t('transactions.income') : t('transactions.expense')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.frequency === 'monthly' ? t('projections.frequency.monthly') : t('projections.frequency.yearly')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={item.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {item.type === 'income' ? '+' : '-'}
                      {formatCurrency(item.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(item.start_date), 'd MMM yyyy', { locale: dateLocale })}
                    {item.end_date && (
                      <> - {format(new Date(item.end_date), 'd MMM yyyy', { locale: dateLocale })}</>
                    )}
                    {!item.end_date && ` - ${t('projections.recurring.indefinite')}`}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(item)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <RecurringItemFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingItem(null)
        }}
        item={editingItem}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('projections.recurring.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('projections.recurring.deleteConfirm').replace('{name}', deletingItem?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? t('projections.recurring.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
