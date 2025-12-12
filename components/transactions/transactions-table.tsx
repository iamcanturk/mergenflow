'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'
import { Transaction } from '@/types'
import { useTransactions, useToggleTransactionPaid, useDeleteTransaction } from '@/hooks/use-transactions'
import { useTranslation } from '@/lib/i18n'
import { Pencil, Trash2, MoreHorizontal, ArrowUpCircle, ArrowDownCircle, CheckCircle2, Circle } from 'lucide-react'

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
import { TransactionFormDialog } from './transaction-form-dialog'
import { DeleteTransactionDialog } from './delete-transaction-dialog'

interface TransactionWithProject extends Transaction {
  project: { id: string; name: string } | null
}

export function TransactionsTable() {
  const { t, locale } = useTranslation()
  const { data: transactions, isLoading } = useTransactions()
  const togglePaid = useToggleTransactionPaid()
  const deleteTransaction = useDeleteTransaction()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const dateLocale = locale === 'tr' ? tr : enUS

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }

  const handleDelete = (transaction: Transaction) => {
    setDeletingTransaction(transaction)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingTransaction) return

    setDeleteLoading(true)
    try {
      await deleteTransaction.mutateAsync(deletingTransaction.id)
      setDeleteOpen(false)
      setDeletingTransaction(null)
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleTogglePaid = async (transaction: Transaction) => {
    try {
      await togglePaid.mutateAsync({
        id: transaction.id,
        is_paid: !transaction.is_paid,
      })
    } catch (error) {
      console.error('Failed to toggle paid status:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('transactions.noTransactions')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t('transactions.type')}</TableHead>
              <TableHead>{t('transactions.description')}</TableHead>
              <TableHead>{t('transactions.project')}</TableHead>
              <TableHead>{t('transactions.date')}</TableHead>
              <TableHead className="text-right">{t('transactions.amount')}</TableHead>
              <TableHead className="w-[100px]">{t('projects.status')}</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(transactions as TransactionWithProject[]).map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? t('transactions.income') : t('transactions.expense')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {transaction.description || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  {transaction.project ? (
                    <Badge variant="outline">{transaction.project.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(transaction.transaction_date), 'd MMMM yyyy', { locale: dateLocale })}
                </TableCell>
                <TableCell className="text-right font-medium">
                  <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleTogglePaid(transaction)}
                  >
                    {transaction.is_paid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">{t('dashboard.collected')}</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-500">{t('dashboard.pending')}</span>
                      </>
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(transaction)}
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

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingTransaction(null)
        }}
        transaction={editingTransaction}
      />

      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transaction={deletingTransaction}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </>
  )
}
