'use client'

import { useState } from 'react'
import { useMonthlyTransactionsSummary } from '@/hooks/use-transactions'
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionsTable, TransactionFormDialog } from '@/components/transactions'

export default function TransactionsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [defaultType, setDefaultType] = useState<'income' | 'expense'>('income')
  const { data: summary } = useMonthlyTransactionsSummary()

  const handleAddIncome = () => {
    setDefaultType('income')
    setFormOpen(true)
  }

  const handleAddExpense = () => {
    setDefaultType('expense')
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İşlemler</h1>
          <p className="text-muted-foreground">
            Gelir ve giderlerinizi takip edin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddExpense}>
            <ArrowDownCircle className="h-4 w-4 mr-2 text-red-600" />
            Gider Ekle
          </Button>
          <Button onClick={handleAddIncome}>
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Gelir Ekle
          </Button>
        </div>
      </div>

      {/* Bu Ay Özeti */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay Gelir</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +₺{(summary?.totalIncome || 0).toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Ödenen: ₺{(summary?.paidIncome || 0).toLocaleString('tr-TR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay Gider</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -₺{(summary?.totalExpense || 0).toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Ödenen: ₺{(summary?.paidExpense || 0).toLocaleString('tr-TR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(summary?.netIncome || 0) >= 0 ? '+' : ''}₺{(summary?.netIncome || 0).toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Gelir - Gider
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
            <Wallet className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              ₺{(summary?.unpaidIncome || 0).toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Alınacak gelir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* İşlem Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Tüm İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable />
        </CardContent>
      </Card>

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultType={defaultType}
      />
    </div>
  )
}
