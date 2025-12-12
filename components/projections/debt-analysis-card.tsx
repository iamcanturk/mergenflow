'use client'

import { useDebtAnalysis } from '@/hooks/use-projections'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Calendar, CreditCard, TrendingDown, CheckCircle2 } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'

export function DebtAnalysisCard() {
  const { t, locale } = useTranslation()
  const { data: analysis, isLoading, error } = useDebtAnalysis()

  const dateLocale = locale === 'tr' ? tr : enUS

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('projections.debt.title')}
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
            {t('projections.debt.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{t('projections.debt.loadError')}</span>
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
            {t('projections.debt.title')}
          </CardTitle>
          <CardDescription>
            {t('projections.debt.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="font-semibold text-lg">{t('projections.debt.congratulations')}</h3>
            <p className="text-muted-foreground">
              {t('projections.debt.noDebt')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('projections.debt.addDebtHint')}
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
          {t('projections.debt.title')}
        </CardTitle>
        <CardDescription>
          {t('projections.debt.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              {t('projections.debt.totalRemaining')}
            </div>
            <div className="mt-2 text-2xl font-bold text-red-600">
              {formatCurrency(analysis.totalDebt)}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              {t('projections.debt.monthlyTotal')}
            </div>
            <div className="mt-2 text-2xl font-bold">
              {formatCurrency(analysis.monthlyPayment)}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {t('projections.debt.debtFreeDate')}
            </div>
            <div className="mt-2 text-2xl font-bold text-green-600">
              {analysis.debtFreeDate
                ? format(analysis.debtFreeDate, 'MMMM yyyy', { locale: dateLocale })
                : '-'}
            </div>
            {analysis.monthsToPayoff && (
              <div className="text-sm text-muted-foreground">
                {t('projections.debt.monthsRemaining').replace('{count}', analysis.monthsToPayoff.toString())}
              </div>
            )}
          </div>
        </div>

        {/* Individual Debts */}
        <div className="space-y-3">
          <h4 className="font-medium">{t('projections.debt.activeDebts')}</h4>
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
                      {t('projections.debt.remaining')}: {formatCurrency(debt.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {formatCurrency(debt.monthlyPayment)}{t('projections.debt.perMonth')}
                    </Badge>
                    {debt.endDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('projections.debt.endsOn')}: {format(debt.endDate, 'd MMM yyyy', { locale: dateLocale })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('projections.debt.percentPaid').replace('{percent}', Math.round(progress).toString())}</span>
                    <span>{t('projections.debt.monthsRemaining').replace('{count}', (debt.monthsRemaining || 0).toString())}</span>
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
