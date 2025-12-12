'use client'

import { useDebtAnalysis } from '@/hooks/use-projections'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Calendar, CreditCard, TrendingDown, CheckCircle2 } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { tr } from 'date-fns/locale'

export function DebtAnalysisCard() {
  const { data: analysis, isLoading, error } = useDebtAnalysis()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Borç Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Borç Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Yüklenirken hata oluştu</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No debts
  if (!analysis || analysis.debts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Borç Analizi
          </CardTitle>
          <CardDescription>
            Krediler ve taksitli borçların analizi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="font-semibold text-lg">Tebrikler!</h3>
            <p className="text-muted-foreground">
              Aktif borcunuz bulunmuyor.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Bitiş tarihi olan gider ekleyerek borç takibi yapabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const now = new Date()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Borç Analizi
        </CardTitle>
        <CardDescription>
          Krediler ve taksitli borçların analizi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              Toplam Kalan Borç
            </div>
            <div className="mt-2 text-2xl font-bold text-red-600">
              ₺{analysis.totalDebt.toLocaleString('tr-TR')}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Aylık Toplam Ödeme
            </div>
            <div className="mt-2 text-2xl font-bold">
              ₺{analysis.monthlyPayment.toLocaleString('tr-TR')}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Borçsuz Olma Tarihi
            </div>
            <div className="mt-2 text-2xl font-bold text-green-600">
              {analysis.debtFreeDate
                ? format(analysis.debtFreeDate, 'MMMM yyyy', { locale: tr })
                : '-'}
            </div>
            {analysis.monthsToPayoff && (
              <div className="text-sm text-muted-foreground">
                {analysis.monthsToPayoff} ay kaldı
              </div>
            )}
          </div>
        </div>

        {/* Individual Debts */}
        <div className="space-y-3">
          <h4 className="font-medium">Aktif Borçlar</h4>
          {analysis.debts.map((debt, index) => {
            // Calculate progress (how much time has passed)
            const totalDays = debt.endDate 
              ? differenceInDays(debt.endDate, new Date(debt.endDate.getTime() - (debt.monthsRemaining || 0) * 30 * 24 * 60 * 60 * 1000))
              : 0
            const passedDays = debt.endDate
              ? totalDays - differenceInDays(debt.endDate, now)
              : 0
            const progress = totalDays > 0 ? Math.min(100, (passedDays / totalDays) * 100) : 0

            return (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">{debt.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      Kalan: ₺{debt.amount.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      ₺{debt.monthlyPayment.toLocaleString('tr-TR')}/ay
                    </Badge>
                    {debt.endDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Bitiş: {format(debt.endDate, 'd MMM yyyy', { locale: tr })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% ödendi</span>
                    <span>{debt.monthsRemaining} ay kaldı</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
